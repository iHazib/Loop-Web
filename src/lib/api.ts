/* Frontend HTTP client for the Loop Retail API. */
import type { BlogPost, ContactQuery } from './store';

const BASE = '/api';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    credentials: 'include',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (res.status === 204) return null as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
  return data as T;
}

export interface SessionUser {
  email: string;
  name: string;
  picture: string;
}

export const api = {
  // posts
  listPosts: () => req<BlogPost[]>('/posts'),
  createPost: (p: Partial<BlogPost>) => req<BlogPost>('/posts', { method: 'POST', body: JSON.stringify(p) }),
  updatePost: (id: string, p: Partial<BlogPost>) => req<BlogPost>(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  deletePost: (id: string) => req<null>(`/posts/${id}`, { method: 'DELETE' }),

  // queries
  listQueries: () => req<ContactQuery[]>('/queries'),
  createQuery: (q: Partial<ContactQuery>) => req<ContactQuery>('/queries', { method: 'POST', body: JSON.stringify(q) }),
  updateQuery: (id: string, p: Partial<ContactQuery>) => req<ContactQuery>(`/queries/${id}`, { method: 'PATCH', body: JSON.stringify(p) }),
  deleteQuery: (id: string) => req<null>(`/queries/${id}`, { method: 'DELETE' }),

  // auth
  authGoogle: (credential: string, passcode: string) =>
    req<{ user: SessionUser }>('/auth/google', { method: 'POST', body: JSON.stringify({ credential, passcode }) }),
  me: () => req<{ user: SessionUser }>('/auth/me'),
  logout: () => req<null>('/auth/logout', { method: 'POST' }),
};
