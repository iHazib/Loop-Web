/// <reference types="vite/client" />

interface ImportMetaEnv {
  // The only auth var safe for the client bundle — the Google Client ID is public by design.
  // Admin passcode / allowlist are SERVER-ONLY (never VITE_*), see server/auth.ts.
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
