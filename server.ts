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

// Server-side active session store (token -> timestamp)
const activeSessions = new Map<string, { createdAt: number; phone: string }>();

function hashInput(val: string): string {
  return crypto.createHash('sha256').update(val).digest('hex');
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // 1. Admin Login API Endpoint
  app.post('/api/admin/login', (req: Request, res: Response) => {
    console.log("[ADMIN AUTH] login endpoint reached");

    const { phone, password } = req.body || {};

    console.log("[ADMIN AUTH] phone received:", JSON.stringify(phone));
    console.log("[ADMIN AUTH] password received:", password ? "[RECEIVED]" : "[MISSING]");

    if (phone === undefined || password === undefined) {
      res.status(401).json({ success: false, error: 'Invalid phone number or password.' });
      return;
    }

    const normalizedPhone = String(phone ?? '').trim();
    const normalizedPassword = String(password ?? '');

    if (!normalizedPhone || !normalizedPassword) {
      res.status(401).json({ success: false, error: 'Invalid phone number or password.' });
      return;
    }

    const phoneHash = hashInput(normalizedPhone);
    const passHash = hashInput(normalizedPassword);

    // Verify exact credential match against secure server hashes or server environment variables
    const isPhoneMatch = phoneHash === TARGET_PHONE_HASH || normalizedPhone === (process.env.ADMIN_PHONE || '0244148534');
    const isPassMatch = passHash === TARGET_PASS_HASH || normalizedPassword === (process.env.ADMIN_PASSWORD || 'dan');

    if (isPhoneMatch && isPassMatch) {
      console.log("[ADMIN AUTH] Login verification SUCCESSFUL for phone:", normalizedPhone);
      // Generate a secure, cryptographically random session token
      const sessionToken = crypto.randomBytes(32).toString('hex');
      activeSessions.set(sessionToken, {
        createdAt: Date.now(),
        phone: normalizedPhone
      });

      res.json({
        success: true,
        token: sessionToken,
        user: {
          phone: normalizedPhone,
          displayName: 'Big Dan Admin',
          role: 'superadmin'
        }
      });
      return;
    }

    console.log("[ADMIN AUTH] Login verification FAILED for phone:", normalizedPhone);
    // Generic error response - never reveal which field failed
    res.status(401).json({ success: false, error: 'Invalid phone number or password.' });
  });

  // 2. Admin Session Verification Endpoint
  app.post('/api/admin/verify', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const bodyToken = req.body?.token;
    
    let token = bodyToken;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token || typeof token !== 'string') {
      res.status(401).json({ valid: false, error: 'Unauthenticated' });
      return;
    }

    const session = activeSessions.get(token);
    if (!session) {
      res.status(401).json({ valid: false, error: 'Invalid or expired session' });
      return;
    }

    // Sessions valid for 24 hours
    const MAX_AGE = 24 * 60 * 60 * 1000;
    if (Date.now() - session.createdAt > MAX_AGE) {
      activeSessions.delete(token);
      res.status(401).json({ valid: false, error: 'Session expired' });
      return;
    }

    res.json({
      valid: true,
      user: {
        phone: session.phone,
        displayName: 'Big Dan Admin',
        role: 'superadmin'
      }
    });
  });

  // 3. Admin Logout Endpoint
  app.post('/api/admin/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const bodyToken = req.body?.token;

    let token = bodyToken;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (token && typeof token === 'string') {
      activeSessions.delete(token);
    }

    res.json({ success: true });
  });

  // Vite Integration
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
