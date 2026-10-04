// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
var TARGET_PHONE_HASH = "ec382e0b8c43b84c6146c013fbfa5775d9e5644fdabbf6ef9f7db0e165abda80";
var TARGET_PASS_HASH = "ec4f2dbb3b140095550c9afbbb69b5d6fd9e814b9da82fad0b34e9fcbe56f1cb";
var activeSessions = /* @__PURE__ */ new Map();
function hashInput(val) {
  return crypto.createHash("sha256").update(val).digest("hex");
}
function getCookie(req, name) {
  const cookies = req.headers.cookie;
  if (!cookies) return null;
  const parts = cookies.split(";");
  for (const part of parts) {
    const [key, val] = part.trim().split("=");
    if (key === name) return val;
  }
  return null;
}
async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3e3;
  app.use(express.json());
  app.post("/api/admin/login", (req, res) => {
    const { phone, password } = req.body || {};
    if (typeof phone !== "string" || typeof password !== "string") {
      res.status(401).json({ success: false, error: "Invalid phone number or password." });
      return;
    }
    const cleanPhone = phone.trim();
    const cleanPass = password.trim();
    if (!cleanPhone || !cleanPass) {
      res.status(401).json({ success: false, error: "Invalid phone number or password." });
      return;
    }
    const phoneHash = hashInput(cleanPhone);
    const passHash = hashInput(cleanPass);
    const isPhoneMatch = phoneHash === TARGET_PHONE_HASH || cleanPhone === process.env.ADMIN_PHONE;
    const isPassMatch = passHash === TARGET_PASS_HASH || cleanPass === process.env.ADMIN_PASSWORD;
    if (isPhoneMatch && isPassMatch) {
      const sid = crypto.randomBytes(32).toString("hex");
      activeSessions.set(sid, {
        phone: cleanPhone,
        createdAt: Date.now()
      });
      let cookieStr = `ankobeng_admin_sid=${sid}; Path=/; HttpOnly; SameSite=Strict`;
      if (process.env.NODE_ENV === "production") {
        cookieStr += "; Secure";
      }
      res.setHeader("Set-Cookie", cookieStr);
      res.json({
        success: true,
        user: {
          phone: cleanPhone,
          displayName: "Big Dan Admin",
          role: "superadmin"
        }
      });
      return;
    }
    res.status(401).json({ success: false, error: "Invalid phone number or password." });
  });
  app.get("/api/admin/session", (req, res) => {
    const sid = getCookie(req, "ankobeng_admin_sid");
    if (!sid) {
      res.json({ authenticated: false });
      return;
    }
    const session = activeSessions.get(sid);
    if (!session) {
      res.json({ authenticated: false });
      return;
    }
    const MAX_AGE = 24 * 60 * 60 * 1e3;
    if (Date.now() - session.createdAt > MAX_AGE) {
      activeSessions.delete(sid);
      res.json({ authenticated: false });
      return;
    }
    res.json({
      authenticated: true,
      user: {
        phone: session.phone,
        displayName: "Big Dan Admin",
        role: "superadmin"
      }
    });
  });
  app.post("/api/admin/logout", (req, res) => {
    const sid = getCookie(req, "ankobeng_admin_sid");
    if (sid) {
      activeSessions.delete(sid);
    }
    let cookieStr = "ankobeng_admin_sid=; Path=/; HttpOnly; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (process.env.NODE_ENV === "production") {
      cookieStr += "; Secure";
    }
    res.setHeader("Set-Cookie", cookieStr);
    res.json({ success: true });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve("dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve("dist", "index.html"));
    });
  }
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Server startup error:", err);
});
