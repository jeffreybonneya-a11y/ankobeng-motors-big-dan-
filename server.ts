import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// SHA-256 hashes for secure server-side credential verification
// Phone: "0244148534" -> sha256: ec382e0b8c43b84c6146c013fbfa5775d9e5644fdabbf6ef9f7db0e165abda80
// Password: "dan"     -> sha256: ec4f2dbb3b140095550c9afbbb69b5d6fd9e814b9da82fad0b34e9fcbe56f1cb
const TARGET_PHONE_HASH = 'ec382e0b8c43b84c6146c013fbfa5775d9e5644fdabbf6ef9f7db0e165abda80';
const TARGET_PASS_HASH = 'ec4f2dbb3b140095550c9afbbb69b5d6fd9e814b9da82fad0b34e9fcbe56f1cb';

// Server-side active session store (sid -> user info)
interface AdminSession {
  phone: string;
  createdAt: number;
}
const activeSessions = new Map<string, AdminSession>();

function hashInput(val: string): string {
  return crypto.createHash('sha256').update(val).digest('hex');
}

// Simple cookie parser helper
function getCookie(req: Request, name: string): string | null {
  const cookies = req.headers.cookie;
  if (!cookies) return null;
  const parts = cookies.split(';');
  for (const part of parts) {
    const [key, val] = part.trim().split('=');
    if (key === name) return val;
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // 1. Admin Login API Endpoint - Performs credential verification & sets HttpOnly cookie
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { phone, password } = req.body || {};

    if (typeof phone !== 'string' || typeof password !== 'string') {
      res.status(401).json({ success: false, error: 'Invalid phone number or password.' });
      return;
    }

    const cleanPhone = phone.trim();
    const cleanPass = password.trim();

    if (!cleanPhone || !cleanPass) {
      res.status(401).json({ success: false, error: 'Invalid phone number or password.' });
      return;
    }

    const phoneHash = hashInput(cleanPhone);
    const passHash = hashInput(cleanPass);

    const isPhoneMatch = phoneHash === TARGET_PHONE_HASH || cleanPhone === process.env.ADMIN_PHONE;
    const isPassMatch = passHash === TARGET_PASS_HASH || cleanPass === process.env.ADMIN_PASSWORD;

    if (isPhoneMatch && isPassMatch) {
      // Generate a secure session ID
      const sid = crypto.randomBytes(32).toString('hex');
      activeSessions.set(sid, {
        phone: cleanPhone,
        createdAt: Date.now()
      });

      // Construct cookie string
      let cookieStr = `ankobeng_admin_sid=${sid}; Path=/; HttpOnly; SameSite=Strict`;
      if (process.env.NODE_ENV === 'production') {
        cookieStr += '; Secure';
      }

      res.setHeader('Set-Cookie', cookieStr);
      res.json({
        success: true,
        user: {
          phone: cleanPhone,
          displayName: 'Big Dan Admin',
          role: 'superadmin'
        }
      });
      return;
    }

    // Generic error response
    res.status(401).json({ success: false, error: 'Invalid phone number or password.' });
  });

  // 2. Admin Get Session Endpoint
  app.get('/api/admin/session', (req: Request, res: Response) => {
    const sid = getCookie(req, 'ankobeng_admin_sid');
    if (!sid) {
      res.json({ authenticated: false });
      return;
    }

    const session = activeSessions.get(sid);
    if (!session) {
      res.json({ authenticated: false });
      return;
    }

    // Sessions valid for 24 hours
    const MAX_AGE = 24 * 60 * 60 * 1000;
    if (Date.now() - session.createdAt > MAX_AGE) {
      activeSessions.delete(sid);
      res.json({ authenticated: false });
      return;
    }

    res.json({
      authenticated: true,
      user: {
        phone: session.phone,
        displayName: 'Big Dan Admin',
        role: 'superadmin'
      }
    });
  });

  // 3. Admin Logout API Endpoint - clears the cookie & session
  app.post('/api/admin/logout', (req: Request, res: Response) => {
    const sid = getCookie(req, 'ankobeng_admin_sid');
    if (sid) {
      activeSessions.delete(sid);
    }

    let cookieStr = 'ankobeng_admin_sid=; Path=/; HttpOnly; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
    if (process.env.NODE_ENV === 'production') {
      cookieStr += '; Secure';
    }

    res.setHeader('Set-Cookie', cookieStr);
    res.json({ success: true });
  });

  // Vite Integration for Dev / Static serving for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
});
