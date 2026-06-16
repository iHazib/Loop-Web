import { useSyncExternalStore } from 'react';
import { api } from './api';

/* ════════════════════════════════════════════════
   Loop Retail — data layer
   Reactive in-memory cache hydrated from the backend
   API (server/). Mutations call the API then update
   the cache and notify subscribers.
   ════════════════════════════════════════════════ */

/* ── Categories ── */
export const BLOG_CATEGORIES = [
  'Marketplace Control',
  'Brand Protection',
  'Retail Expansion',
  'DTC Growth',
  'Guides',
  'Company',
] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const QUERY_CATEGORIES = [
  'Marketplace Control',
  'Brand Protection',
  'Retail Expansion',
  'DTC Growth',
  'General Enquiry',
  'Partnership',
  'Press & Media',
  'Support',
] as const;
export type QueryCategory = (typeof QUERY_CATEGORIES)[number];

export type PostStatus = 'draft' | 'published';
export type QueryStatus = 'new' | 'read' | 'replied' | 'archived';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // markdown
  coverImage: string;
  category: BlogCategory;
  tags: string[];
  author: string;
  status: PostStatus;
  featured: boolean;
  readMinutes: number;
  seoTitle: string;
  seoDescription: string;
  createdAt: number;
  updatedAt: number;
  publishedAt: number | null;
}

export interface ContactQuery {
  id: string;
  name: string;
  email: string;
  company: string;
  category: QueryCategory;
  subject: string;
  message: string;
  status: QueryStatus;
  createdAt: number;
}

/* ── Helpers ── */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(ts: number | null): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return formatDate(ts);
}

/* ── Reactive cache ── */
let posts: BlogPost[] = [];
let queries: ContactQuery[] = [];
let ready = false;

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/* ── Hydration ── */
export async function refresh(): Promise<void> {
  const [p, q] = await Promise.all([
    api.listPosts().catch(() => posts),
    api.listQueries().catch(() => queries), // 401 for non-admins — keep what we have
  ]);
  posts = p;
  queries = q;
  ready = true;
  emit();
}
// kick off initial hydration on load
void refresh();

/* ── Posts ── */
export function getPosts() {
  return posts;
}
export function getPublishedPosts() {
  return posts
    .filter((p) => p.status === 'published')
    .sort((a, b) => (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt));
}
export function getPostById(id: string) {
  return posts.find((p) => p.id === id) ?? null;
}
export function getPostBySlug(slug: string) {
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function savePost(input: Partial<BlogPost> & { id?: string }): Promise<BlogPost> {
  const saved = input.id ? await api.updatePost(input.id, input) : await api.createPost(input);
  posts = posts.some((p) => p.id === saved.id)
    ? posts.map((p) => (p.id === saved.id ? saved : p))
    : [saved, ...posts];
  emit();
  return saved;
}

export async function deletePost(id: string): Promise<void> {
  await api.deletePost(id);
  posts = posts.filter((p) => p.id !== id);
  emit();
}

/* ── Queries ── */
export function getQueries() {
  return queries;
}
export async function addQuery(input: Omit<ContactQuery, 'id' | 'status' | 'createdAt'>): Promise<ContactQuery> {
  const q = await api.createQuery(input);
  queries = [q, ...queries];
  emit();
  return q;
}
export async function updateQuery(id: string, patch: Partial<ContactQuery>): Promise<void> {
  const updated = await api.updateQuery(id, patch);
  queries = queries.map((q) => (q.id === id ? updated : q));
  emit();
}
export async function deleteQuery(id: string): Promise<void> {
  await api.deleteQuery(id);
  queries = queries.filter((q) => q.id !== id);
  emit();
}

/* ── React hooks ── */
export function usePosts() {
  return useSyncExternalStore(subscribe, getPosts, getPosts);
}
export function useQueries() {
  return useSyncExternalStore(subscribe, getQueries, getQueries);
}
export function useReady() {
  const get = () => ready;
  return useSyncExternalStore(subscribe, get, get);
}

/* Admin authentication lives in ./auth (server-verified Google + allowlist + passcode). */
