import '../server/env'; // no-op on Vercel (env injected); loads .env for `vercel dev`
import app from '../server/app';

/* Vercel serverless entry. Vercel routes /api/* here (see vercel.json) and
   invokes the exported Express app as the request handler. */
export default app;
