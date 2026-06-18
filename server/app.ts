import express from 'express';
import * as store from './storage';
import * as auth from './auth';

/* The Express API as a portable app (no app.listen, no static serving).
   - Local/self-hosted: server/index.ts wraps this with static serving + listen.
   - Vercel: api/index.ts exports this directly as a serverless function. */

const app = express();
app.use(express.json({ limit: '1mb' }));

// Wrap async handlers so DB errors return 500 JSON instead of hanging the request.
const ah =
  (fn: (req: express.Request, res: express.Response) => Promise<void>) =>
  (req: express.Request, res: express.Response) => {
    fn(req, res).catch((e) => {
      console.error(e);
      if (!res.headersSent) res.status(500).json({ error: 'Server error' });
    });
  };

/* ─────────── Auth ─────────── */
app.post('/api/auth/google', async (req, res) => {
  if (!auth.configured()) {
    res.status(500).json({ error: 'Server admin auth is not fully configured (set GOOGLE_CLIENT_ID, ADMIN_PASSCODE and ADMIN_EMAILS).' });
    return;
  }
  const { credential, passcode } = req.body ?? {};
  if (!credential) {
    res.status(400).json({ error: 'Missing Google credential.' });
    return;
  }
  const profile = await auth.verifyGoogleToken(credential);
  if (!profile || !profile.verified) {
    res.status(401).json({ error: 'Could not verify this Google account.' });
    return;
  }
  if (!auth.isAllowed(profile.email)) {
    res.status(403).json({ error: `${profile.email} is not authorised for admin access.` });
    return;
  }
  if (!auth.checkPasscode(passcode)) {
    res.status(403).json({ error: 'Incorrect passcode.' });
    return;
  }
  const user = { email: profile.email, name: profile.name, picture: profile.picture };
  auth.setSessionCookie(res, user);
  res.json({ user });
});

app.get('/api/auth/me', (req, res) => {
  const user = auth.sessionFromReq(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorised' });
    return;
  }
  res.json({ user });
});

app.post('/api/auth/logout', (req, res) => {
  auth.clearSessionCookie(res);
  res.status(204).end();
});

/* ─────────── Posts ─────────── */
app.get('/api/posts', ah(async (req, res) => {
  const authed = auth.sessionFromReq(req) !== null;
  res.json(await store.listPosts(authed));
}));
app.post('/api/posts', auth.requireAuth, ah(async (req, res) => {
  res.json(await store.createPost(req.body ?? {}));
}));
app.put('/api/posts/:id', auth.requireAuth, ah(async (req, res) => {
  const updated = await store.updatePost(req.params.id, req.body ?? {});
  if (!updated) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  res.json(updated);
}));
app.delete('/api/posts/:id', auth.requireAuth, ah(async (req, res) => {
  await store.deletePost(req.params.id);
  res.status(204).end();
}));

/* ─────────── Queries ─────────── */
app.post('/api/queries', ah(async (req, res) => {
  const body = req.body ?? {};
  if (!body.name || !body.email || !body.message) {
    res.status(400).json({ error: 'Name, email and message are required.' });
    return;
  }
  res.json(await store.createQuery(body));
}));
app.get('/api/queries', auth.requireAuth, ah(async (_req, res) => {
  res.json(await store.listQueries());
}));
app.patch('/api/queries/:id', auth.requireAuth, ah(async (req, res) => {
  const updated = await store.updateQuery(req.params.id, req.body ?? {});
  if (!updated) {
    res.status(404).json({ error: 'Query not found' });
    return;
  }
  res.json(updated);
}));
app.delete('/api/queries/:id', auth.requireAuth, ah(async (req, res) => {
  await store.deleteQuery(req.params.id);
  res.status(204).end();
}));

export default app;
