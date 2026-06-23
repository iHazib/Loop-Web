import '../server/env'; // load env (no-op on Vercel; reads .env locally)
import * as store from '../server/storage';
import * as auth from '../server/auth';

/* Native Vercel serverless function — handles ALL /api/* requests itself
   (no Express), reusing the shared auth + storage logic. This avoids the
   fragile "export an Express app" pattern that crashed on Vercel's runtime.
   Local development still uses the Express server in server/index.ts. */

interface VReq {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}
interface VRes {
  status(code: number): VRes;
  json(data: unknown): VRes;
  send(data?: unknown): VRes;
  setHeader(name: string, value: string): void;
}

function parseBody(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object') return raw as Record<string, unknown>;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return {};
}

export default async function handler(req: VReq, res: VRes): Promise<void> {
  const method = req.method ?? 'GET';
  const path = (req.url ?? '').split('?')[0].replace(/\/+$/, '') || '/';
  const cookieHeader = req.headers.cookie as string | undefined;
  const user = auth.userFromCookieHeader(cookieHeader);
  const body = parseBody(req.body);

  const json = (code: number, data: unknown) => { res.status(code).json(data); };
  const noContent = () => { res.status(204).send(); };

  try {
    /* ── Auth ── */
    if (path === '/api/auth/me' && method === 'GET') {
      if (!user) return json(401, { error: 'Unauthorised' });
      return json(200, { user });
    }
    if (path === '/api/auth/logout' && method === 'POST') {
      res.setHeader('Set-Cookie', auth.buildClearCookie());
      return noContent();
    }
    if (path === '/api/auth/google' && method === 'POST') {
      if (!auth.configured()) return json(500, { error: 'Server admin auth is not fully configured (set GOOGLE_CLIENT_ID, ADMIN_PASSCODE and ADMIN_EMAILS).' });
      const credential = String(body.credential ?? '');
      if (!credential) return json(400, { error: 'Missing Google credential.' });
      const profile = await auth.verifyGoogleToken(credential);
      if (!profile || !profile.verified) return json(401, { error: 'Could not verify this Google account.' });
      if (!auth.isAllowed(profile.email)) return json(403, { error: `${profile.email} is not authorised for admin access.` });
      if (!auth.checkPasscode(String(body.passcode ?? ''))) return json(403, { error: 'Incorrect passcode.' });
      const u = { email: profile.email, name: profile.name, picture: profile.picture };
      res.setHeader('Set-Cookie', auth.buildSessionCookie(u));
      return json(200, { user: u });
    }
    if (path === '/api/auth/email/check' && method === 'POST') {
      if (!auth.emailAuthReady()) return json(500, { error: 'Server admin auth is not configured (set ADMIN_PASSCODE and ADMIN_EMAILS).' });
      const email = String(body.email ?? '').trim();
      if (!email || !auth.isAllowed(email)) return json(403, { error: 'This email is not authorised for admin access.' });
      return json(200, { ok: true });
    }
    if (path === '/api/auth/email' && method === 'POST') {
      if (!auth.emailAuthReady()) return json(500, { error: 'Server admin auth is not configured (set ADMIN_PASSCODE and ADMIN_EMAILS).' });
      const email = String(body.email ?? '').trim();
      if (!email || !auth.isAllowed(email)) return json(403, { error: 'This email is not authorised for admin access.' });
      if (!auth.checkPasscode(String(body.passcode ?? ''))) return json(403, { error: 'Incorrect passcode.' });
      const u = { email, name: email.split('@')[0], picture: '' };
      res.setHeader('Set-Cookie', auth.buildSessionCookie(u));
      return json(200, { user: u });
    }

    /* ── Posts ── */
    if (path === '/api/posts' && method === 'GET') {
      return json(200, await store.listPosts(user !== null));
    }
    if (path === '/api/posts' && method === 'POST') {
      if (!user) return json(401, { error: 'Unauthorised' });
      return json(200, await store.createPost(body));
    }
    const postMatch = path.match(/^\/api\/posts\/([^/]+)$/);
    if (postMatch) {
      if (!user) return json(401, { error: 'Unauthorised' });
      const id = decodeURIComponent(postMatch[1]);
      if (method === 'PUT') {
        const updated = await store.updatePost(id, body);
        return updated ? json(200, updated) : json(404, { error: 'Post not found' });
      }
      if (method === 'DELETE') {
        await store.deletePost(id);
        return noContent();
      }
    }

    /* ── Queries ── */
    if (path === '/api/queries' && method === 'POST') {
      if (!body.name || !body.email || !body.message) return json(400, { error: 'Name, email and message are required.' });
      return json(200, await store.createQuery(body));
    }
    if (path === '/api/queries' && method === 'GET') {
      if (!user) return json(401, { error: 'Unauthorised' });
      return json(200, await store.listQueries());
    }
    const queryMatch = path.match(/^\/api\/queries\/([^/]+)$/);
    if (queryMatch) {
      if (!user) return json(401, { error: 'Unauthorised' });
      const id = decodeURIComponent(queryMatch[1]);
      if (method === 'PATCH') {
        const updated = await store.updateQuery(id, body);
        return updated ? json(200, updated) : json(404, { error: 'Query not found' });
      }
      if (method === 'DELETE') {
        await store.deleteQuery(id);
        return noContent();
      }
    }

    return json(404, { error: 'Not found' });
  } catch (e) {
    console.error(e);
    return json(500, { error: e instanceof Error ? e.message : 'Server error' });
  }
}
