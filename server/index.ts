import './env'; // MUST be first — populates process.env before auth/storage initialise
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import * as store from './storage';
import * as auth from './auth';

const app = express();
app.use(express.json({ limit: '1mb' }));

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
app.get('/api/posts', (req, res) => {
  const authed = auth.sessionFromReq(req) !== null;
  res.json(store.listPosts(authed));
});
app.post('/api/posts', auth.requireAuth, (req, res) => {
  res.json(store.createPost(req.body ?? {}));
});
app.put('/api/posts/:id', auth.requireAuth, (req, res) => {
  const updated = store.updatePost(req.params.id, req.body ?? {});
  if (!updated) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  res.json(updated);
});
app.delete('/api/posts/:id', auth.requireAuth, (req, res) => {
  store.deletePost(req.params.id);
  res.status(204).end();
});

/* ─────────── Queries ─────────── */
app.post('/api/queries', (req, res) => {
  const body = req.body ?? {};
  if (!body.name || !body.email || !body.message) {
    res.status(400).json({ error: 'Name, email and message are required.' });
    return;
  }
  res.json(store.createQuery(body));
});
app.get('/api/queries', auth.requireAuth, (_req, res) => {
  res.json(store.listQueries());
});
app.patch('/api/queries/:id', auth.requireAuth, (req, res) => {
  const updated = store.updateQuery(req.params.id, req.body ?? {});
  if (!updated) {
    res.status(404).json({ error: 'Query not found' });
    return;
  }
  res.json(updated);
});
app.delete('/api/queries/:id', auth.requireAuth, (req, res) => {
  store.deleteQuery(req.params.id);
  res.status(204).end();
});

/* ─────────── Serve built frontend in production ─────────── */
const dist = path.resolve('dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(dist, 'index.html'));
  });
}

const PORT = Number(process.env.PORT) || 8787;
app.listen(PORT, () => {
  console.log(`\n  Loop Retail API  →  http://localhost:${PORT}`);
  console.log(`  Auth configured  →  ${auth.configured() ? 'yes' : 'NO (set GOOGLE_CLIENT_ID)'}\n`);
});
