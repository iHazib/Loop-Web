import dotenv from 'dotenv';

/* Loads environment variables. This module MUST be imported before any
   module that reads process.env at init time (server/auth.ts, etc.).
   In ES modules, imports are evaluated in source order, so importing
   this first guarantees process.env is populated before auth initialises. */

// Load .env.local first (Vite convention), then .env — without overriding already-set vars.
dotenv.config({ path: '.env.local' });
dotenv.config();
