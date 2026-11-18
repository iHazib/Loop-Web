/* Case studies for the public site.
   Staff write them in admin. Anyone sees the teaser: title, sector, summary and which numbers there are,
   but the numbers and the full story are only sent once a valid access code is given.
   Codes are made per prospect in admin, can cover one study or all of them, and expire. */

export interface CaseMetric { label: string; value: string; note?: string }
export interface CaseSection { heading: string; body: string }
export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  brandLabel: string; // how the brand is described publicly, e.g. "UK pet care brand"
  sector: string;
  summary: string; // public teaser
  cover: string; // a PHOTO key from the site
  metrics: CaseMetric[];
  sections: CaseSection[];
  published: boolean;
  sort: number;
  updatedAt?: string;
}
export interface CaseAccess { id: string; label: string; studyId: string | null; expiresAt: string; createdAt: string; lastUsed: string | null; uses: number; revoked: boolean }

const COVERS = ['rack', 'floor', 'van', 'amazon', 'shelves', 'aisle', 'parcel', 'carry', 'boxes', 'analytics', 'phone', 'team', 'port', 'loading', 'forklift', 'stacked'];
const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

/** Cleans a study posted from admin. Returns an error message when something required is missing. */
export function cleanStudy(raw: Record<string, unknown>): Omit<CaseStudy, 'id'> | string {
  const title = str(raw.title, 140);
  if (!title) return 'Give the case study a title.';
  const slug = slugify(str(raw.slug, 60) || title);
  if (!slug) return 'The link name needs letters or numbers.';
  const metrics = (Array.isArray(raw.metrics) ? raw.metrics : [])
    .map((m: any) => ({ label: str(m?.label, 60), value: str(m?.value, 30), note: str(m?.note, 120) }))
    .filter((m) => m.label && m.value).slice(0, 8);
  const sections = (Array.isArray(raw.sections) ? raw.sections : [])
    .map((s: any) => ({ heading: str(s?.heading, 100), body: str(s?.body, 6000) }))
    .filter((s) => s.heading || s.body).slice(0, 10);
  const cover = COVERS.includes(String(raw.cover)) ? String(raw.cover) : 'boxes';
  return {
    slug, title, cover, metrics, sections,
    brandLabel: str(raw.brandLabel, 80), sector: str(raw.sector, 60), summary: str(raw.summary, 400),
    published: raw.published === true, sort: Number.isFinite(Number(raw.sort)) ? Math.round(Number(raw.sort)) : 0,
  };
}

/** What anyone may see without a code: no numbers, no story. */
export function teaser(c: CaseStudy) {
  return {
    slug: c.slug, title: c.title, brandLabel: c.brandLabel, sector: c.sector, summary: c.summary, cover: c.cover,
    metrics: c.metrics.map((m) => ({ label: m.label, length: Math.min(m.value.length, 8) })),
    sections: c.sections.map((s) => ({ heading: s.heading, length: Math.min(s.body.length, 1200) })),
    locked: true as const,
  };
}
export function full(c: CaseStudy) {
  return { slug: c.slug, title: c.title, brandLabel: c.brandLabel, sector: c.sector, summary: c.summary, cover: c.cover, metrics: c.metrics, sections: c.sections, locked: false as const };
}

/** Readable codes: 8 letters and numbers without look alikes, shown as XXXX-XXXX. */
export function newCode(): string {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const s = Array.from(bytes, (b) => A[b % A.length]).join('');
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}
export const normCode = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '');
