import crypto from 'node:crypto';

/* Client (brand) accounts for the portal.
   - Separate cookie from the admin session, so a client can never reach /admin APIs.
   - Passwords: scrypt with a per-user salt.
   - Invites: random token, only its SHA-256 is stored. */

export const PORTAL_COOKIE = 'loop_portal';
const MAX_AGE = 14 * 86_400_000;
const SECRET = (process.env.JWT_SECRET || '').trim() || crypto.randomBytes(32).toString('hex');

export type Role = 'manager' | 'viewer';
export type Principal =
  | { kind: 'staff'; email: string; name: string }
  | { kind: 'client'; email: string; name: string; brands: Record<string, Role> };

export interface ClientSession { email: string; name: string }

const hmac = (body: string) => crypto.createHmac('sha256', `portal:${SECRET}`).update(body).digest('base64url');

export function signClient(s: ClientSession): string {
  const body = Buffer.from(JSON.stringify({ ...s, kind: 'client', exp: Date.now() + MAX_AGE })).toString('base64url');
  return `${body}.${hmac(body)}`;
}
export function verifyClient(token: string | undefined): ClientSession | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const exp = hmac(body);
  if (sig.length !== exp.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(exp))) return null;
  try {
    const d = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (d.kind !== 'client' || typeof d.exp !== 'number' || d.exp < Date.now()) return null;
    return { email: String(d.email), name: String(d.name ?? '') };
  } catch { return null; }
}

export function cookieValue(header: string | undefined, name: string): string | undefined {
  for (const part of (header ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return undefined;
}

const secure = () => (process.env.NODE_ENV === 'production' ? '; Secure' : '');
export const setClientCookie = (s: ClientSession) => `${PORTAL_COOKIE}=${signClient(s)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(MAX_AGE / 1000)}${secure()}`;
export const clearClientCookie = () => `${PORTAL_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure()}`;

/* ── Passwords ── */
export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16).toString('base64url');
  const hash = crypto.scryptSync(pw, salt, 64).toString('base64url');
  return `scrypt$${salt}$${hash}`;
}
export function checkPassword(pw: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const [algo, salt, hash] = stored.split('$');
  if (algo !== 'scrypt' || !salt || !hash) return false;
  const got = crypto.scryptSync(pw, salt, 64);
  const want = Buffer.from(hash, 'base64url');
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}
export function passwordProblem(pw: string): string | null {
  if (pw.length < 10) return 'Use at least 10 characters.';
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'Use letters and at least one number.';
  return null;
}

/* ── Invites ── */
export function newInviteToken() {
  const token = crypto.randomBytes(24).toString('base64url');
  return { token, hash: sha256(token) };
}
export const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

/* ── Simple login throttle (per instance) ── */
const attempts = new Map<string, { n: number; until: number }>();
export function throttled(key: string): boolean {
  const a = attempts.get(key);
  return Boolean(a && a.n >= 6 && a.until > Date.now());
}
export function noteFailure(key: string) {
  const a = attempts.get(key);
  if (!a || a.until < Date.now()) attempts.set(key, { n: 1, until: Date.now() + 15 * 60_000 });
  else a.n++;
}
export const clearFailures = (key: string) => attempts.delete(key);

/* ── Permissions ── */
export function canView(p: Principal | null, brandId: string): boolean {
  if (brandId === 'demo') return true;
  if (!p) return false;
  return p.kind === 'staff' || Boolean(p.brands[brandId]);
}
export function canEdit(p: Principal | null, brandId: string): boolean {
  if (!p || brandId === 'demo') return false;
  return p.kind === 'staff' || p.brands[brandId] === 'manager';
}
export const isStaff = (p: Principal | null) => p?.kind === 'staff';
