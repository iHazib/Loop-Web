import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

/* ════════════════════════════════════════════════
   Server-side persistence — Supabase (Postgres).
   Uses the service_role key, so it bypasses RLS.
   This is the ONLY file that talks to the database;
   the HTTP layer and frontend are unchanged.
   ════════════════════════════════════════════════ */

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim();
const SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (see .env).');
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type PostStatus = 'draft' | 'published';
export type QueryStatus = 'new' | 'read' | 'replied' | 'archived';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
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
  category: string;
  subject: string;
  message: string;
  status: QueryStatus;
  createdAt: number;
}

/* ── Helpers ── */
function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);
}
function readingTime(md: string): number {
  return Math.max(1, Math.round((md || '').trim().split(/\s+/).filter(Boolean).length / 200));
}
function now(): number {
  return Date.now();
}

/* ── Row ⇄ model mapping ── */
/* eslint-disable @typescript-eslint/no-explicit-any */
function toPost(r: any): BlogPost {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt ?? '',
    content: r.content ?? '',
    coverImage: r.cover_image ?? '',
    category: r.category ?? 'Company',
    tags: r.tags ?? [],
    author: r.author ?? 'Loop Retail',
    status: r.status,
    featured: !!r.featured,
    readMinutes: r.read_minutes ?? 1,
    seoTitle: r.seo_title ?? '',
    seoDescription: r.seo_description ?? '',
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
    publishedAt: r.published_at == null ? null : Number(r.published_at),
  };
}
function toQuery(r: any): ContactQuery {
  return {
    id: r.id,
    name: r.name ?? '',
    email: r.email ?? '',
    company: r.company ?? '',
    category: r.category ?? 'General Enquiry',
    subject: r.subject ?? '',
    message: r.message ?? '',
    status: r.status,
    createdAt: Number(r.created_at),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ── Posts ── */
export async function listPosts(includeUnpublished: boolean): Promise<BlogPost[]> {
  let q = supabase.from('posts').select('*');
  if (!includeUnpublished) q = q.eq('status', 'published');
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? [])
    .map(toPost)
    .sort((a, b) => (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt));
}

export async function createPost(input: Partial<BlogPost>): Promise<BlogPost> {
  const ts = now();
  const status: PostStatus = input.status === 'published' ? 'published' : 'draft';
  const row = {
    title: input.title ?? 'Untitled',
    slug: (input.slug && input.slug.trim()) || slugify(input.title ?? 'untitled'),
    excerpt: input.excerpt ?? '',
    content: input.content ?? '',
    cover_image: input.coverImage ?? '',
    category: input.category ?? 'Company',
    tags: input.tags ?? [],
    author: input.author ?? 'Loop Retail',
    status,
    featured: !!input.featured,
    read_minutes: readingTime(input.content ?? ''),
    seo_title: input.seoTitle ?? '',
    seo_description: input.seoDescription ?? '',
    created_at: ts,
    updated_at: ts,
    published_at: status === 'published' ? ts : null,
  };
  const { data, error } = await supabase.from('posts').insert(row).select('*').single();
  if (error) throw error;
  return toPost(data);
}

export async function updatePost(id: string, input: Partial<BlogPost>): Promise<BlogPost | null> {
  const { data: prev, error: getErr } = await supabase.from('posts').select('*').eq('id', id).maybeSingle();
  if (getErr) throw getErr;
  if (!prev) return null;

  const status: PostStatus =
    input.status === 'published' ? 'published' : input.status === 'draft' ? 'draft' : prev.status;
  const patch = {
    title: input.title ?? prev.title,
    slug: (input.slug && input.slug.trim()) || prev.slug,
    excerpt: input.excerpt ?? prev.excerpt,
    content: input.content ?? prev.content,
    cover_image: input.coverImage ?? prev.cover_image,
    category: input.category ?? prev.category,
    tags: input.tags ?? prev.tags,
    author: input.author ?? prev.author,
    status,
    featured: input.featured ?? prev.featured,
    read_minutes: readingTime(input.content ?? prev.content),
    seo_title: input.seoTitle ?? prev.seo_title,
    seo_description: input.seoDescription ?? prev.seo_description,
    updated_at: now(),
    published_at: status === 'published' ? prev.published_at ?? now() : status === 'draft' ? null : prev.published_at,
  };
  const { data, error } = await supabase.from('posts').update(patch).eq('id', id).select('*').single();
  if (error) throw error;
  return toPost(data);
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}

/* ── Queries ── */
export async function listQueries(): Promise<ContactQuery[]> {
  const { data, error } = await supabase.from('queries').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toQuery);
}

export async function createQuery(input: Partial<ContactQuery>): Promise<ContactQuery> {
  const row = {
    name: String(input.name ?? '').slice(0, 120),
    email: String(input.email ?? '').slice(0, 160),
    company: String(input.company ?? '').slice(0, 160),
    category: String(input.category ?? 'General Enquiry'),
    subject: String(input.subject ?? '').slice(0, 200),
    message: String(input.message ?? '').slice(0, 5000),
    status: 'new' as QueryStatus,
    created_at: now(),
  };
  const { data, error } = await supabase.from('queries').insert(row).select('*').single();
  if (error) throw error;
  return toQuery(data);
}

export async function updateQuery(id: string, patch: Partial<ContactQuery>): Promise<ContactQuery | null> {
  const row: Record<string, unknown> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.company !== undefined) row.company = patch.company;
  if (patch.category !== undefined) row.category = patch.category;
  if (patch.subject !== undefined) row.subject = patch.subject;
  if (patch.message !== undefined) row.message = patch.message;
  if (Object.keys(row).length === 0) {
    const { data } = await supabase.from('queries').select('*').eq('id', id).maybeSingle();
    return data ? toQuery(data) : null;
  }
  const { data, error } = await supabase.from('queries').update(row).eq('id', id).select('*').maybeSingle();
  if (error) throw error;
  return data ? toQuery(data) : null;
}

export async function deleteQuery(id: string): Promise<void> {
  const { error } = await supabase.from('queries').delete().eq('id', id);
  if (error) throw error;
}

/* ── One-time seed: starter blog posts if the table is empty ── */
const seedPosts: Array<Partial<BlogPost>> = [
  {
    title: 'Who actually controls your Amazon listing?',
    slug: 'who-controls-your-amazon-listing',
    excerpt:
      'On most marketplaces, the brand is not the one setting the price, writing the copy or choosing the images. Here is how control quietly slips away — and how to take it back.',
    content:
      '## The listing is the brand\n\nTo a customer, the product listing **is** your brand. They never see your supply chain — they see a title, six images, a price and a star rating.\n\n### Three ways control slips\n\n- **Pricing** — unauthorised sellers undercut your RRP.\n- **Content** — hijacked listings get the wrong images and weak copy.\n- **Trust** — old stock generates the bad reviews your brand gets blamed for.\n\n> You don\'t argue with the marketplace. You show the proof.',
    coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
    category: 'Marketplace Control',
    tags: ['Amazon', 'Buy Box', 'MAP'],
    author: 'Loop Retail',
    status: 'published',
    featured: true,
    seoTitle: 'Who controls your Amazon listing? | Loop Retail',
    seoDescription: 'How brand control slips away on marketplaces — and the operating model that takes it back.',
  },
  {
    title: 'A foreign brand’s guide to entering UK retail',
    slug: 'foreign-brands-guide-uk-retail',
    excerpt:
      'The UK is one of the most structured and buyer-selective retail markets in the world. Sending samples to Tesco is not a strategy. Here is what proof buyers actually want.',
    content:
      '## The UK is not a test market\n\nIt is one of the most regulated, structured and buyer-selective retail environments anywhere. Buyers do not take risk — they take **proof**.\n\n### What buyers ask before they say yes\n\n1. Will the product comply with UK rules?\n2. Is the packaging right for UK shelves?\n3. Is the price right for UK margins?\n4. Can stock be supplied reliably?\n5. Is there real demand?',
    coverImage: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1200&q=80',
    category: 'Retail Expansion',
    tags: ['UK Market', 'Buyers', 'Compliance'],
    author: 'Loop Retail',
    status: 'published',
    featured: false,
    seoTitle: 'Entering UK retail as a foreign brand | Loop Retail',
    seoDescription: 'What UK retail buyers actually want before they take a risk on a foreign brand.',
  },
  {
    title: 'DTC is your first serious UK market test',
    slug: 'dtc-first-uk-market-test',
    excerpt:
      'Direct-to-consumer is not only a sales channel. For a foreign brand, it is the cleanest way to generate real UK demand data — the kind retail buyers trust.',
    content:
      '## Proof, not forecasts\n\nDTC lets you launch in the UK without a local office. Every order is real demand data: which products sell, what price works, how packaging performs.\n\n### From first order to retail-ready\n\nThat evidence is exactly what a retail buyer wants to see.',
    coverImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80',
    category: 'DTC Growth',
    tags: ['DTC', 'Fulfilment', 'Data'],
    author: 'Loop Retail',
    status: 'draft',
    featured: false,
    seoTitle: 'DTC as a UK market test | Loop Retail',
    seoDescription: 'Why DTC is the first serious UK market test for foreign brands.',
  },
];

export async function seedIfEmpty(): Promise<void> {
  const { count, error } = await supabase.from('posts').select('id', { count: 'exact', head: true });
  if (error) {
    console.error('  Supabase seed check failed:', error.message);
    return;
  }
  if ((count ?? 0) > 0) return;
  for (const p of seedPosts) await createPost(p);
  console.log('  Seeded starter blog posts.');
}

export function uid(): string {
  return crypto.randomUUID();
}
