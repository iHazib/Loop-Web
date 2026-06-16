import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/* ════════════════════════════════════════════════
   Server-side persistence (JSON file).
   Single source of truth for posts + queries.
   Swap these functions for a real DB (Postgres,
   etc.) without changing the HTTP layer.
   ════════════════════════════════════════════════ */

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

interface DB {
  posts: BlogPost[];
  queries: ContactQuery[];
}

const DATA_FILE = path.resolve('server/data.json');

function uid(): string {
  return crypto.randomUUID();
}
function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);
}
function readingTime(md: string): number {
  return Math.max(1, Math.round(md.trim().split(/\s+/).filter(Boolean).length / 200));
}

/* ── Seed ── */
function seed(): DB {
  const now = Date.now();
  const day = 86_400_000;
  return {
    posts: [
      {
        id: uid(),
        title: 'Who actually controls your Amazon listing?',
        slug: 'who-controls-your-amazon-listing',
        excerpt:
          'On most marketplaces, the brand is not the one setting the price, writing the copy or choosing the images. Here is how control quietly slips away — and how to take it back.',
        content:
          '## The listing is the brand\n\nTo a customer, the product listing **is** your brand. They never see your supply chain — they see a title, six images, a price and a star rating.\n\n### Three ways control slips\n\n- **Pricing** — unauthorised sellers undercut your RRP.\n- **Content** — hijacked listings get the wrong images and weak copy.\n- **Trust** — old stock generates the bad reviews your brand gets blamed for.\n\n> You don\'t argue with the marketplace. You show the proof.\n\n### Taking it back\n\nMarketplace control is an operating model, not a dashboard.',
        coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
        category: 'Marketplace Control',
        tags: ['Amazon', 'Buy Box', 'MAP'],
        author: 'Loop Retail',
        status: 'published',
        featured: true,
        readMinutes: 3,
        seoTitle: 'Who controls your Amazon listing? | Loop Retail',
        seoDescription: 'How brand control slips away on marketplaces — and the operating model that takes it back.',
        createdAt: now - day * 3,
        updatedAt: now - day * 3,
        publishedAt: now - day * 3,
      },
      {
        id: uid(),
        title: 'A foreign brand’s guide to entering UK retail',
        slug: 'foreign-brands-guide-uk-retail',
        excerpt:
          'The UK is one of the most structured and buyer-selective retail markets in the world. Sending samples to Tesco is not a strategy. Here is what proof buyers actually want.',
        content:
          '## The UK is not a test market\n\nIt is one of the most regulated, structured and buyer-selective retail environments anywhere. Buyers do not take risk — they take **proof**.\n\n### What buyers ask before they say yes\n\n1. Will the product comply with UK rules?\n2. Is the packaging right for UK shelves?\n3. Is the price right for UK margins?\n4. Can stock be supplied reliably?\n5. Is there real demand?\n\n### Start with independents\n\nChains bring scale. Independents open the door.',
        coverImage: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1200&q=80',
        category: 'Retail Expansion',
        tags: ['UK Market', 'Buyers', 'Compliance'],
        author: 'Loop Retail',
        status: 'published',
        featured: false,
        readMinutes: 4,
        seoTitle: 'Entering UK retail as a foreign brand | Loop Retail',
        seoDescription: 'What UK retail buyers actually want before they take a risk on a foreign brand.',
        createdAt: now - day * 8,
        updatedAt: now - day * 8,
        publishedAt: now - day * 8,
      },
      {
        id: uid(),
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
        readMinutes: 2,
        seoTitle: 'DTC as a UK market test | Loop Retail',
        seoDescription: 'Why DTC is the first serious UK market test for foreign brands.',
        createdAt: now - day,
        updatedAt: now - day,
        publishedAt: null,
      },
    ],
    queries: [
      {
        id: uid(), name: 'Elena Marsh', email: 'elena@northwind.co', company: 'Northwind Supplements',
        category: 'Marketplace Control', subject: 'Unauthorised sellers on Amazon UK',
        message: 'We have four sellers undercutting our RRP on Amazon UK and our buy box is gone. Can Loop Retail take back control of our listings?',
        status: 'new', createdAt: now - 3600_000 * 2,
      },
      {
        id: uid(), name: 'Tomas Berg', email: 'tomas@berghaus.se', company: 'Berghaus Home (SE)',
        category: 'Retail Expansion', subject: 'Entering UK garden centres',
        message: 'Swedish homeware brand looking to enter UK independents and garden centres. We need help with compliance and a route to market.',
        status: 'read', createdAt: now - 3600_000 * 30,
      },
      {
        id: uid(), name: 'Priya Nair', email: 'priya@glowlab.in', company: 'GlowLab Cosmetics',
        category: 'DTC Growth', subject: 'UK DTC launch + fulfilment',
        message: 'We want to launch DTC in the UK without setting up a local office. Interested in the local stock + fulfilment layer.',
        status: 'replied', createdAt: now - 86_400_000 * 2,
      },
    ],
  };
}

/* ── Load / save ── */
let db: DB;
function persist() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}
try {
  db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as DB;
} catch {
  db = seed();
  persist();
}

/* ── Posts ── */
export function listPosts(includeUnpublished: boolean): BlogPost[] {
  const all = [...db.posts].sort((a, b) => (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt));
  return includeUnpublished ? all : all.filter((p) => p.status === 'published');
}

export function createPost(input: Partial<BlogPost>): BlogPost {
  const ts = Date.now();
  const post: BlogPost = {
    id: uid(),
    title: input.title ?? 'Untitled',
    slug: input.slug?.trim() || slugify(input.title ?? 'untitled'),
    excerpt: input.excerpt ?? '',
    content: input.content ?? '',
    coverImage: input.coverImage ?? '',
    category: input.category ?? 'Company',
    tags: input.tags ?? [],
    author: input.author ?? 'Loop Retail',
    status: input.status === 'published' ? 'published' : 'draft',
    featured: !!input.featured,
    readMinutes: readingTime(input.content ?? ''),
    seoTitle: input.seoTitle ?? '',
    seoDescription: input.seoDescription ?? '',
    createdAt: ts,
    updatedAt: ts,
    publishedAt: input.status === 'published' ? ts : null,
  };
  db.posts.unshift(post);
  persist();
  return post;
}

export function updatePost(id: string, input: Partial<BlogPost>): BlogPost | null {
  const idx = db.posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const prev = db.posts[idx];
  const status: PostStatus = input.status === 'published' ? 'published' : input.status === 'draft' ? 'draft' : prev.status;
  const updated: BlogPost = {
    ...prev,
    ...input,
    status,
    tags: input.tags ?? prev.tags,
    readMinutes: readingTime(input.content ?? prev.content),
    updatedAt: Date.now(),
    publishedAt: status === 'published' ? prev.publishedAt ?? Date.now() : status === 'draft' ? null : prev.publishedAt,
    id: prev.id,
  };
  db.posts[idx] = updated;
  persist();
  return updated;
}

export function deletePost(id: string): void {
  db.posts = db.posts.filter((p) => p.id !== id);
  persist();
}

/* ── Queries ── */
export function listQueries(): ContactQuery[] {
  return [...db.queries].sort((a, b) => b.createdAt - a.createdAt);
}

export function createQuery(input: Partial<ContactQuery>): ContactQuery {
  const q: ContactQuery = {
    id: uid(),
    name: String(input.name ?? '').slice(0, 120),
    email: String(input.email ?? '').slice(0, 160),
    company: String(input.company ?? '').slice(0, 160),
    category: String(input.category ?? 'General Enquiry'),
    subject: String(input.subject ?? '').slice(0, 200),
    message: String(input.message ?? '').slice(0, 5000),
    status: 'new',
    createdAt: Date.now(),
  };
  db.queries.unshift(q);
  persist();
  return q;
}

export function updateQuery(id: string, patch: Partial<ContactQuery>): ContactQuery | null {
  const idx = db.queries.findIndex((q) => q.id === id);
  if (idx === -1) return null;
  db.queries[idx] = { ...db.queries[idx], ...patch, id };
  persist();
  return db.queries[idx];
}

export function deleteQuery(id: string): void {
  db.queries = db.queries.filter((q) => q.id !== id);
  persist();
}
