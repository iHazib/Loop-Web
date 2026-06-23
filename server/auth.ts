import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';

/* ════════════════════════════════════════════════
   Server-enforced admin auth.
   - Google ID token verified against Google's keys.
   - Email allowlist enforced here (not the client).
   - Passcode is a second factor.
   - Session = HMAC-signed token in an httpOnly cookie.
   ════════════════════════════════════════════════ */

// The Google Client ID is public by design (embedded in client JS), so a VITE_ fallback is fine.
const CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '').trim();

// Secrets are SERVER-ONLY — never read VITE_* here (those get bundled into the public client JS).
// No hard-coded defaults: everything comes from the environment (and .env, which is gitignored).
const PASSCODE = (process.env.ADMIN_PASSCODE || '').trim();

const RAW_SECRET = (process.env.JWT_SECRET || '').trim();
if (!RAW_SECRET && process.env.NODE_ENV === 'production') {
  // Warn rather than throw — throwing at import crashes the whole serverless function.
  console.warn('[auth] JWT_SECRET is not set in production — admin sessions will not persist across instances.');
}
// Fall back to a random per-boot secret if unset — never a constant shipped in source.
const SECRET = RAW_SECRET || crypto.randomBytes(32).toString('hex');

// Allowlist comes from the ADMIN_EMAILS env var only — no emails are hard-coded in source.
const ALLOWED = new Set(
  (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean),
);

const client = new OAuth2Client(CLIENT_ID);

export const COOKIE_NAME = 'loop_session';
const MAX_AGE = 7 * 86_400_000; // 7 days

export function configured(): boolean {
  // All three must be present for Google admin login to be possible.
  return CLIENT_ID.length > 0 && PASSCODE.length > 0 && ALLOWED.size > 0;
}

// The email + passcode path doesn't need a Google Client ID — just passcode + allowlist.
export function emailAuthReady(): boolean {
  return PASSCODE.length > 0 && ALLOWED.size > 0;
}

export interface SessionUser {
  email: string;
  name: string;
  picture: string;
}

export async function verifyGoogleToken(credential: string): Promise<{ email: string; name: string; picture: string; verified: boolean } | null> {
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: CLIENT_ID });
    const p = ticket.getPayload();
    if (!p?.email) return null;
    return { email: p.email, name: p.name ?? '', picture: p.picture ?? '', verified: p.email_verified === true };
  } catch {
    return null;
  }
}

export function isAllowed(email: string): boolean {
  return ALLOWED.has(email.trim().toLowerCase());
}
export function checkPasscode(code: string): boolean {
  if (!PASSCODE || typeof code !== 'string') return false;
  const a = Buffer.from(code);
  const b = Buffer.from(PASSCODE);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ── Signed session token ── */
function hmac(body: string): string {
  return crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
}
export function signSession(user: SessionUser): string {
  const body = Buffer.from(JSON.stringify({ ...user, exp: Date.now() + MAX_AGE })).toString('base64url');
  return `${body}.${hmac(body)}`;
}
export function verifySession(token: string): SessionUser | null {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = hmac(body);
  // constant-time compare
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    return { email: data.email, name: data.name, picture: data.picture };
  } catch {
    return null;
  }
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  (header ?? '').split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

export function sessionFromReq(req: Request): SessionUser | null {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  return token ? verifySession(token) : null;
}

export function setSessionCookie(res: Response, user: SessionUser): void {
  res.cookie(COOKIE_NAME, signSession(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE,
    path: '/',
  });
}
export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

/* ── Framework-agnostic helpers (used by the native Vercel function) ── */
export function buildSessionCookie(user: SessionUser): string {
  const attrs = [`${COOKIE_NAME}=${signSession(user)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${Math.floor(MAX_AGE / 1000)}`];
  if (process.env.NODE_ENV === 'production') attrs.push('Secure');
  return attrs.join('; ');
}
export function buildClearCookie(): string {
  const attrs = [`${COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (process.env.NODE_ENV === 'production') attrs.push('Secure');
  return attrs.join('; ');
}
export function userFromCookieHeader(cookieHeader: string | undefined): SessionUser | null {
  const token = parseCookies(cookieHeader)[COOKIE_NAME];
  return token ? verifySession(token) : null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const user = sessionFromReq(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorised' });
    return;
  }
  (req as Request & { user: SessionUser }).user = user;
  next();
}
