import { api, type SessionUser } from './api';

/* ════════════════════════════════════════════════
   Admin auth — client helpers.
   The server (server/auth.ts) is authoritative: it
   verifies the Google ID token, enforces the email
   allowlist + passcode, and issues an httpOnly session
   cookie. This module only renders the Google button
   and relays credentials to the server.
   ════════════════════════════════════════════════ */

export type { SessionUser };

// Needed client-side only to render the Google button.
export const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() ?? '';

/* ── Session via server ── */
export async function fetchSession(): Promise<SessionUser | null> {
  try {
    const { user } = await api.me();
    return user;
  } catch {
    return null;
  }
}

export async function loginWithGoogle(credential: string, passcode: string): Promise<SessionUser> {
  const { user } = await api.authGoogle(credential, passcode);
  return user;
}

export async function logout(): Promise<void> {
  try {
    await api.logout();
  } finally {
    try {
      window.google?.accounts.id.disableAutoSelect();
    } catch {
      /* ignore */
    }
  }
}

/* ── Decode Google ID token (display only — server re-verifies) ── */
export interface GoogleProfile {
  email: string;
  name: string;
  picture: string;
}
export function decodeIdToken(token: string): GoogleProfile | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const data = JSON.parse(decodeURIComponent(escape(json)));
    return { email: String(data.email ?? ''), name: String(data.name ?? ''), picture: String(data.picture ?? '') };
  } catch {
    return null;
  }
}

/* ── Load Google Identity Services script once ── */
let gsiPromise: Promise<void> | null = null;
export function loadGsi(): Promise<void> {
  if (gsiPromise) return gsiPromise;
  gsiPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Google Sign-In'));
    document.head.appendChild(s);
  });
  return gsiPromise;
}

/* ── Minimal GIS typings ── */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}
