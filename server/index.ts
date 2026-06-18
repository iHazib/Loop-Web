import './env'; // MUST be first — populates process.env before app/auth/storage initialise
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import app from './app';
import * as store from './storage';
import * as auth from './auth';

/* Local development + self-hosted production runner.
   (On Vercel, api/index.ts serves the same app as a serverless function;
   Vercel serves the static frontend itself, so this file isn't used there.) */

// Serve the built frontend when running as a single self-hosted server.
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
  console.log(`  Auth configured  →  ${auth.configured() ? 'yes' : 'NO (set GOOGLE_CLIENT_ID)'}`);
  void store.seedIfEmpty().then(() => console.log('  Supabase connected.\n')).catch((e) => console.error('  Supabase error:', e.message, '\n'));
});
