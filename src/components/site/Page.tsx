import { createContext, useContext, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Minus, Plus } from 'lucide-react';
import { NavBar } from '../NavBar';
import { Footer } from '../Footer';
import { CTA, contactHref } from '../CTA';

/* Building blocks for every public page.
   Light canvas, white panels, Geist, one red action per view, petrol for the quiet dark band.
   Spacing: sections 72px top and bottom on desktop, 48px on phones. Heroes size to content. */

/* Photography: Unsplash (free licence), served from their CDN at the size we need. */
export const PHOTO = {
  shelves: '1587293852726-70cdb56c2866',
  aisle: '1586528116022-aeda1613c63d',
  amazon: '1633174524827-db00a6b7bc74',
  parcel: '1672552226380-486fe900b322',
  carry: '1449247666642-264389f5f5b1',
  boxes: '1580674285054-bed31e145f59',
  analytics: '1551288049-bebda4e38f71',
  shopify: '1658297063569-162817482fb6',
  phone: '1758874573126-cf93a36261e8',
  team: '1758518731706-be5d5230e5a5',
  port: '1590496793907-4d66e2994b4d',
  loading: '1620455800201-7f00aeef12ed',
  forklift: '1664382953403-fc1ac77073a0',
  stacked: '1769355104335-acef3aa4c9b6',
  card: '1733503747506-773e56e4078f',
  store: '1764795849825-20fde0c5712e',
} as const;
export type PhotoKey = keyof typeof PHOTO;
export const photo = (k: PhotoKey, w = 1200, h?: number) =>
  `https://images.unsplash.com/photo-${PHOTO[k]}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=70`;

export function Photo({ k, alt, className = '', w = 1200, h, eager = false }: { k: PhotoKey; alt: string; className?: string; w?: number; h?: number; eager?: boolean }) {
  return (
    <img
      src={photo(k, w, h)}
      srcSet={`${photo(k, Math.round(w / 2), h ? Math.round(h / 2) : undefined)} ${Math.round(w / 2)}w, ${photo(k, w, h)} ${w}w`}
      sizes="(max-width: 768px) 100vw, 50vw"
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`w-full h-full object-cover ${className}`}
    />
  );
}

export const WRAP = 'max-w-[1248px] mx-auto px-4 md:px-6';
export const H2 = 'font-semibold tracking-[-0.03em] text-balance text-[28px] leading-[32px] md:text-[38px] md:leading-[42px]';

export function SitePage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <NavBar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

/** Small label above a heading: sentence case with the red dot. */
export function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[14px] font-medium ${dark ? 'text-white/80' : 'text-muted'}`}>
      <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-brand-red" />
      {children}
    </span>
  );
}

export function PageHero({ eyebrow, title, lead, ctas, image, imageAlt = '', aside, meta, crumb }: {
  eyebrow: string;
  /** Kept for older pages; not shown. */
  tag?: string;
  title: ReactNode;
  lead: ReactNode;
  ctas?: ReactNode;
  image?: PhotoKey;
  imageAlt?: string;
  /** A proof card that sits over the photo (a dashboard panel, a case, a number). */
  aside?: ReactNode;
  meta?: { k: string; v: string }[];
  crumb?: { label: string; to: string };
}) {
  return (
    <section className={`${WRAP} pt-8 md:pt-12 pb-12 md:pb-16`}>
      {crumb && (
        <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-muted">
          <Link to={crumb.to} className="hover:text-ink">{crumb.label}</Link> <span aria-hidden="true">/</span> <span className="text-ink">{eyebrow}</span>
        </nav>
      )}
      <div className="grid lg:grid-cols-[1.02fr_1fr] gap-10 lg:gap-14 items-center">
        <div className="flex flex-col gap-6 min-w-0">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="font-semibold tracking-[-0.04em] text-balance text-[38px] leading-[42px] md:text-[54px] md:leading-[56px]">{title}</h1>
          <p className="text-[17px] md:text-[18px] leading-[28px] text-muted max-w-[540px] text-pretty">{lead}</p>
          {ctas && <div className="flex flex-wrap gap-3">{ctas}</div>}
          {meta && (
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line rounded-xl overflow-hidden border border-line mt-1">
              {meta.map((m) => (
                <div key={m.k} className="bg-surface px-4 py-3">
                  <dt className="text-[12px] text-muted">{m.k}</dt>
                  <dd className="text-[14px] font-semibold mt-0.5">{m.v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        {(image || aside) && (
          <div className="relative min-w-0">
            {image ? (
              <div className="rounded-[24px] overflow-hidden aspect-[5/4] bg-sunken">
                <Photo k={image} alt={imageAlt} w={1100} h={880} eager />
              </div>
            ) : null}
            {aside && (
              <div className={image ? 'relative -mt-24 mx-4 sm:mx-0 sm:absolute sm:mt-0 sm:-left-8 sm:bottom-6 sm:w-[min(400px,85%)]' : ''}>
                <div className="bg-surface rounded-2xl border border-line shadow-[0_24px_60px_-24px_rgba(18,22,20,0.35)]">{aside}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

type Tone = 'white' | 'off' | 'dark' | 'petrol' | 'ink' | 'canvas' | 'panel';
const norm = (t: Tone): 'panel' | 'canvas' | 'petrol' | 'ink' =>
  t === 'white' || t === 'panel' ? 'panel' : t === 'off' || t === 'canvas' ? 'canvas' : t === 'dark' || t === 'petrol' ? 'petrol' : 'ink';
const ToneCtx = createContext<'panel' | 'canvas' | 'petrol' | 'ink'>('canvas');
const useTone = () => useContext(ToneCtx);
const isDark = (t: string) => t === 'petrol' || t === 'ink';

export function SectionHead({ eyebrow, title, lead, dark = false }: { eyebrow?: string; title?: ReactNode; lead?: ReactNode; dark?: boolean }) {
  if (!eyebrow && !title && !lead) return null;
  return (
    <div className="mb-8 md:mb-10 grid md:grid-cols-[1.25fr_1fr] gap-4 md:gap-12 md:items-end">
      <div className="flex flex-col gap-3">
        {eyebrow && <Eyebrow dark={dark}>{eyebrow}</Eyebrow>}
        {title && <h2 className={H2}>{title}</h2>}
      </div>
      {lead && <p className={`text-[16px] leading-[25px] max-w-[460px] md:justify-self-end text-pretty ${dark ? 'text-white/75' : 'text-muted'}`}>{lead}</p>}
    </div>
  );
}

export function Section({ tone = 'canvas', eyebrow, title, lead, children, id }: {
  tone?: Tone; eyebrow?: string; title?: ReactNode; lead?: ReactNode; children?: ReactNode; id?: string;
}) {
  const t = norm(tone);
  const dark = isDark(t);
  const bg = t === 'panel' ? 'bg-surface' : t === 'petrol' ? 'bg-petrol text-white' : t === 'ink' ? 'bg-ink text-white' : '';
  const inner = (
    <div className={`${WRAP} py-12 md:py-[72px]`}>
      <SectionHead eyebrow={eyebrow} title={title} lead={lead} dark={dark} />
      <ToneCtx.Provider value={t}>{children}</ToneCtx.Provider>
    </div>
  );
  if (t === 'canvas') return <section id={id} className="scroll-mt-20">{inner}</section>;
  return (
    <section id={id} className="px-2 md:px-3 my-3 scroll-mt-20">
      <div className={`rounded-[24px] ${bg}`}>{inner}</div>
    </section>
  );
}

export interface CardItem { title: string; body: string; tag?: string; href?: string; points?: string[]; image?: PhotoKey; imageAlt?: string }

export function CardGrid({ items, cols = 3 }: { items: CardItem[]; cols?: 2 | 3 | 4; dark?: boolean }) {
  const t = useTone();
  const dark = isDark(t);
  const grid = cols === 2 ? 'md:grid-cols-2' : cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3';
  const card = dark ? 'bg-white/[0.07]' : t === 'panel' ? 'bg-canvas' : 'bg-surface border border-line';
  return (
    <div className={`grid ${grid} gap-3 md:gap-4`}>
      {items.map((it) => {
        const body = (
          <>
            {it.image && (
              <div className="-mx-6 -mt-6 mb-5 aspect-[16/10] overflow-hidden rounded-t-2xl bg-sunken">
                <Photo k={it.image} alt={it.imageAlt ?? ''} w={720} h={450} />
              </div>
            )}
            {it.tag && <span className={`self-start text-[12px] font-medium rounded-md px-2 py-0.5 mb-4 ${dark ? 'bg-white/10 text-white/85' : 'bg-red-tint text-red-text'}`}>{it.tag}</span>}
            <h3 className="text-[19px] leading-[25px] font-semibold tracking-[-0.015em]">{it.title}</h3>
            <p className={`mt-2 text-[15px] leading-[23px] ${dark ? 'text-white/75' : 'text-muted'}`}>{it.body}</p>
            {it.points && (
              <ul className="mt-4 grid gap-2">
                {it.points.map((p) => (
                  <li key={p} className={`flex gap-2.5 text-[14px] leading-[20px] ${dark ? 'text-white/85' : 'text-ink'}`}>
                    <Check size={16} className="text-brand-red shrink-0 mt-0.5" aria-hidden="true" />{p}
                  </li>
                ))}
              </ul>
            )}
            {it.href && (
              <span className={`mt-auto pt-5 inline-flex items-center gap-1.5 text-[14px] font-medium ${dark ? 'text-white' : 'text-red-text'}`}>
                Read more <span className="sr-only">about {it.title}</span><ArrowUpRight size={15} aria-hidden="true" />
              </span>
            )}
          </>
        );
        const cls = `h-full flex flex-col rounded-2xl p-6 overflow-hidden ${card} ${it.href ? 'transition-colors hover:border-ink/30' : ''}`;
        return it.href
          ? <Link key={it.title} to={it.href} className={cls}>{body}</Link>
          : <div key={it.title} className={cls}>{body}</div>;
      })}
    </div>
  );
}

/** A real sequence: numbered rows with a time tag. */
export function Steps({ steps }: { steps: { title: string; body: string; time?: string }[]; dark?: boolean }) {
  const t = useTone();
  const dark = isDark(t);
  const row = dark ? 'bg-white/[0.07]' : t === 'panel' ? 'bg-canvas' : 'bg-surface border border-line';
  return (
    <ol className="grid gap-2">
      {steps.map((s, i) => (
        <li key={s.title} className={`grid grid-cols-[36px_1fr] md:grid-cols-[48px_220px_1fr_auto] gap-x-4 gap-y-1 items-start md:items-center rounded-xl px-4 md:px-5 py-4 ${row}`}>
          <span className={`w-8 h-8 rounded-full grid place-items-center text-[13px] font-semibold tnum ${i === 0 ? 'bg-brand-red text-white' : dark ? 'bg-white/15 text-white' : 'bg-sunken text-ink'}`}>{i + 1}</span>
          <h3 className="text-[16px] font-semibold leading-[22px] self-center">{s.title}</h3>
          <p className={`col-start-2 md:col-start-auto text-[15px] leading-[22px] ${dark ? 'text-white/75' : 'text-muted'}`}>{s.body}</p>
          {s.time && <span className={`col-start-2 md:col-start-auto justify-self-start md:justify-self-end text-[13px] font-medium whitespace-nowrap ${dark ? 'text-white/70' : 'text-red-text'}`}>{s.time}</span>}
        </li>
      ))}
    </ol>
  );
}

export function FAQ({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const t = useTone();
  return (
    <div className="grid md:grid-cols-2 gap-x-10 border-t border-line">
      {items.map((it, i) => {
        const o = open === i;
        return (
          <div key={it.q} className="border-b border-line">
            <button type="button" onClick={() => setOpen(o ? null : i)} aria-expanded={o} className="w-full flex items-start justify-between gap-6 py-5 text-left">
              <span className="text-[16px] font-semibold leading-[22px]">{it.q}</span>
              <span className={`w-7 h-7 rounded-full grid place-items-center shrink-0 ${o ? 'bg-ink text-white' : t === 'panel' ? 'bg-canvas' : 'bg-surface border border-line'}`}>{o ? <Minus size={14} /> : <Plus size={14} />}</span>
            </button>
            {o && <p className="-mt-1 pb-5 pr-10 text-[15px] leading-[23px] text-muted">{it.a}</p>}
          </div>
        );
      })}
    </div>
  );
}

export function Compare({ columns, rows, highlight = 0 }: { columns: string[]; rows: { label: string; cells: (boolean | string)[] }[]; highlight?: number }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full min-w-[680px] text-[14px] border-collapse">
        <thead>
          <tr className="bg-canvas">
            <th className="text-left font-medium text-muted px-5 py-3.5 w-[30%]"><span className="sr-only">Feature</span></th>
            {columns.map((c, i) => <th key={c} className={`text-left px-5 py-3.5 font-semibold ${i === highlight ? 'text-ink' : 'text-ink/80'}`}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-line align-top">
              <th scope="row" className="text-left font-medium px-5 py-3.5">{r.label}</th>
              {r.cells.map((c, i) => (
                <td key={i} className="px-5 py-3.5 text-muted">
                  {c === true ? <Check size={17} className="text-success" aria-label="Yes" /> : c === false ? <Minus size={17} className="text-control" aria-label="No" /> : c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Photo and text side by side. */
export function Split({ image, imageAlt, eyebrow, title, body, points, reverse = false, children }: {
  image: PhotoKey; imageAlt: string; eyebrow?: string; title: ReactNode; body?: ReactNode; points?: string[]; reverse?: boolean; children?: ReactNode;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
      <div className={`rounded-[20px] overflow-hidden aspect-[4/3] bg-sunken ${reverse ? 'lg:order-2' : ''}`}><Photo k={image} alt={imageAlt} w={1000} h={750} /></div>
      <div className="flex flex-col gap-4 min-w-0">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className={H2}>{title}</h2>
        {body && <div className="text-[16px] leading-[25px] text-muted max-w-[520px] grid gap-3">{body}</div>}
        {points && (
          <ul className="grid gap-2.5 mt-1">
            {points.map((p) => <li key={p} className="flex gap-2.5 text-[15px] leading-[22px]"><Check size={17} className="text-brand-red shrink-0 mt-0.5" aria-hidden="true" />{p}</li>)}
          </ul>
        )}
        {children}
      </div>
    </div>
  );
}

/** A row of plain figures with their source or meaning. */
export function Figures({ items }: { items: { value: string; label: string; note?: string }[] }) {
  const t = useTone();
  const dark = isDark(t);
  return (
    <dl className={`grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden ${dark ? 'bg-white/15' : 'bg-line border border-line'}`}>
      {items.map((f) => (
        <div key={f.label} className={`p-5 md:p-6 ${dark ? 'bg-petrol' : 'bg-surface'}`}>
          <dd className="text-[30px] md:text-[36px] leading-none font-semibold tracking-[-0.03em] tnum">{f.value}</dd>
          <dt className="mt-3 text-[14px] font-medium">{f.label}</dt>
          {f.note && <p className={`mt-1 text-[12px] ${dark ? 'text-white/65' : 'text-muted'}`}>{f.note}</p>}
        </div>
      ))}
    </dl>
  );
}

export function CTABand({ title, body, topic, label = 'Book a strategy call', secondary }: {
  title: ReactNode; body: string; topic: string; label?: string; secondary?: { to: string; label: string };
}) {
  return (
    <section className="px-2 md:px-3 my-3">
      <div className="rounded-[24px] bg-ink text-white">
        <div className={`${WRAP} py-12 md:py-16 grid md:grid-cols-[1.4fr_1fr] gap-8 md:items-end`}>
          <div>
            <h2 className="font-semibold tracking-[-0.035em] text-balance text-[30px] leading-[34px] md:text-[44px] md:leading-[48px]">{title}</h2>
            <p className="mt-4 text-[16px] md:text-[17px] leading-[26px] text-white/75 max-w-[560px]">{body}</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <CTA to={contactHref(topic)} label={label} tone="red" id={`band-${topic}`} />
            {secondary && <CTA to={secondary.to} label={secondary.label} tone="outline-light" id={`band-${topic}-2`} />}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Related({ links }: { links: { to: string; label: string; body: string }[] }) {
  return (
    <section className={`${WRAP} py-12 md:py-16`}>
      <h2 className="text-[20px] font-semibold tracking-[-0.02em] mb-5">Related</h2>
      <div className="grid md:grid-cols-3 gap-3">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="group rounded-2xl bg-surface border border-line p-5 flex items-start justify-between gap-4 hover:border-ink/30">
            <span>
              <span className="block text-[16px] font-semibold">{l.label}</span>
              <span className="block text-[14px] text-muted mt-1">{l.body}</span>
            </span>
            <ArrowUpRight size={18} className="text-muted group-hover:text-red-text shrink-0" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="mt-6 text-[13px] leading-[20px] text-muted max-w-3xl">{children}</p>;
}
