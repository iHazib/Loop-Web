import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, Plus, X } from 'lucide-react';
import { createContext, useContext, useEffect, useState } from 'react';
import { NavBar } from '../NavBar';
import { Footer } from '../Footer';
import { CTA, contactHref } from '../CTA';

/* Shared building blocks for the detail pages (services, tools, guides).
   Layout language: inset rounded panels on a soft grey canvas, tight semibold
   headlines, glass jump cards in the hero, rounded cards, arrow-circle buttons.
   Colours stay Loopretail: brand red, near black, white. */

const ease = [0.16, 1, 0.3, 1] as const;
const HEAD = 'font-display font-semibold tracking-[-0.035em]';
/* Cards sit on a contrasting surface: grey on white panels, white on the grey canvas. */
const ToneCtx = createContext<'white' | 'off' | 'dark'>('white');
const useSurface = () => {
  const t = useContext(ToneCtx);
  return t === 'off'
    ? { card: 'bg-white hover:bg-white/80', soft: 'bg-[#f2f2f2]', open: 'bg-white ring-1 ring-brand-red/20' }
    : { card: 'bg-[#f4f4f4] hover:bg-[#efefef]', soft: 'bg-white', open: 'bg-white ring-1 ring-black/[0.08]' };
};
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function SitePage({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-[#f2f2f2] font-sans overflow-x-hidden">
      <NavBar darkHero />
      {children}
      <Footer />
    </div>
  );
}

/** Small label with a red dot, used above headings. */
export function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[13px] font-medium ${dark ? 'text-white/70' : 'text-brand-dark/60'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
      {children}
    </span>
  );
}

/** Hero jump cards: built from the sections on the page (any Section with an eyebrow). */
function useJumpLinks() {
  const [links, setLinks] = useState<{ id: string; label: string }[]>([]);
  useEffect(() => {
    const t = setTimeout(() => {
      const found = [...document.querySelectorAll<HTMLElement>('section[data-nav]')]
        .map((el) => ({ id: el.id, label: el.dataset.nav || '' }))
        .filter((l) => l.id && l.label);
      setLinks(found.slice(0, 4));
    }, 0);
    return () => clearTimeout(t);
  }, []);
  return links;
}

export function PageHero({ eyebrow, tag, title, lead, ctas, meta }: {
  eyebrow: string;
  tag?: string;
  title: ReactNode;
  lead: ReactNode;
  ctas?: ReactNode;
  meta?: { k: string; v: string }[];
}) {
  const jumps = useJumpLinks();
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <div className="px-2 md:px-3 pt-2 md:pt-3">
      <section className="relative w-full bg-brand-dark overflow-hidden rounded-[24px] px-6 md:px-14 pt-32 md:pt-40 pb-6 md:pb-8 min-h-[640px] md:min-h-[88vh] flex flex-col">
        {/* Backdrop: deep black with a red glow and a faint grid, standing in for photography */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(130% 120% at 15% 0%, #1a1a1c 0%, #0b0b0c 55%, #050506 100%)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 60% 70% at 78% 45%, #000, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 70% at 78% 45%, #000, transparent 70%)' }} />
        <div className="absolute -right-40 top-1/4 w-[760px] h-[760px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(230,25,43,0.32) 0%, rgba(230,25,43,0.08) 40%, transparent 65%)', filter: 'blur(30px)' }} />
        <div className="absolute right-[8%] top-[22%] w-[420px] h-[420px] rounded-full border border-white/[0.07] pointer-events-none hidden lg:block" />
        <div className="absolute right-[13%] top-[31%] w-[260px] h-[260px] rounded-full border border-brand-red/25 pointer-events-none hidden lg:block" />

        <div className="relative z-10 max-w-[1240px] w-full mx-auto flex-1 flex flex-col">
          <div className="flex-1 flex flex-col justify-center max-w-[720px]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="flex flex-wrap items-center gap-3 mb-6">
              <Eyebrow dark>{eyebrow}</Eyebrow>
              {tag && <span className="text-[12px] font-medium text-white/80 bg-white/10 border border-white/10 rounded-full px-3 py-1">{tag}</span>}
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}
              className={`${HEAD} text-white leading-[1.06]`} style={{ fontSize: 'clamp(2.4rem, 4.6vw, 4.1rem)' }}>
              {title}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.7 }}
              className="mt-6 text-white/70 text-base md:text-lg max-w-[560px] leading-relaxed">
              {lead}
            </motion.p>
            {ctas && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-9 flex flex-wrap gap-3">{ctas}</motion.div>}
            {meta && (
              <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                {meta.map((m) => (
                  <div key={m.k}>
                    <dt className="text-[12px] text-white/45">{m.k}</dt>
                    <dd className="text-sm font-medium text-white">{m.v}</dd>
                  </div>
                ))}
              </motion.dl>
            )}
          </div>

          {jumps.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6, ease }}
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 max-w-[920px]">
              {jumps.map((j, i) => (
                <button key={j.id} onClick={() => go(j.id)}
                  className={`group text-left rounded-xl px-4 py-3.5 min-h-[76px] flex flex-col justify-between backdrop-blur-md border transition-colors ${i === 0 ? 'bg-brand-red border-brand-red text-white' : 'bg-white/[0.07] border-white/10 text-white/85 hover:bg-white/[0.14]'}`}>
                  <span className="flex items-center justify-between w-full">
                    <span className="text-[11px] tabular-nums opacity-60">{String(i + 1).padStart(2, '0')}</span>
                    <ArrowRight size={13} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <span className="text-[13px] font-medium leading-tight mt-2">{j.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

const TONES = {
  white: 'bg-white text-brand-dark',
  off: 'bg-transparent text-brand-dark',
  dark: 'bg-brand-dark text-white',
};

export function Section({ tone = 'white', eyebrow, title, lead, children, id }: {
  tone?: keyof typeof TONES; eyebrow?: string; title?: ReactNode; lead?: ReactNode; children?: ReactNode; id?: string;
}) {
  const dark = tone === 'dark';
  const anchor = id || (eyebrow ? slug(eyebrow) : undefined);
  return (
    <section id={anchor} data-nav={eyebrow || undefined} className="w-full px-2 md:px-3 pt-2 md:pt-3 scroll-mt-20">
      <div className={`rounded-[24px] px-6 md:px-14 py-16 md:py-24 ${TONES[tone]}`}>
        <div className="max-w-[1240px] mx-auto">
          {(eyebrow || title || lead) && (
            <div className="mb-12 md:mb-14 grid md:grid-cols-[1.25fr_1fr] gap-6 md:gap-12 md:items-end">
              <div>
                {eyebrow && <div className="mb-5"><Eyebrow dark={dark}>{eyebrow}</Eyebrow></div>}
                {title && <h2 className={`${HEAD} leading-[1.08] ${dark ? 'text-white' : 'text-brand-dark'}`} style={{ fontSize: 'clamp(2rem, 3.6vw, 3.1rem)' }}>{title}</h2>}
              </div>
              {lead && <p className={`text-[15px] md:text-base leading-relaxed max-w-md md:justify-self-end ${dark ? 'text-white/60' : 'text-brand-dark/60'}`}>{lead}</p>}
            </div>
          )}
          <ToneCtx.Provider value={tone}>{children}</ToneCtx.Provider>
        </div>
      </div>
    </section>
  );
}

export interface CardItem { title: string; body: string; tag?: string; href?: string; points?: string[] }

export function CardGrid({ items, cols = 3, dark = false }: { items: CardItem[]; cols?: 2 | 3 | 4; dark?: boolean }) {
  const sf = useSurface();
  const grid = cols === 2 ? 'md:grid-cols-2' : cols === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3';
  return (
    <div className={`grid ${grid} gap-3 md:gap-4`}>
      {items.map((it, i) => {
        const inner = (
          <>
            {it.tag && (
              <span className={`self-start text-[12px] font-medium rounded-full px-3 py-1 ${dark ? 'bg-white/10 text-white/80' : 'bg-brand-red/[0.08] text-brand-red'}`}>{it.tag}</span>
            )}
            <h3 className={`${HEAD} text-[22px] leading-tight ${it.tag ? 'mt-5' : ''} mb-3 ${dark ? 'text-white' : 'text-brand-dark'}`}>{it.title}</h3>
            <p className={`text-[15px] leading-relaxed ${dark ? 'text-white/60' : 'text-brand-dark/60'}`}>{it.body}</p>
            {it.points && (
              <ul className="mt-5 space-y-2.5">
                {it.points.map((p) => (
                  <li key={p} className={`flex gap-2.5 text-sm ${dark ? 'text-white/75' : 'text-brand-dark/75'}`}>
                    <span className="w-5 h-5 rounded-full bg-brand-red/10 grid place-items-center shrink-0"><Check size={12} className="text-brand-red" /></span>{p}
                  </li>
                ))}
              </ul>
            )}
            {it.href && (
              <span className="mt-auto pt-8 flex items-center justify-between">
                <span className={`text-sm font-medium ${dark ? 'text-white' : 'text-brand-dark'}`}>Learn more</span>
                <span className="w-9 h-9 rounded-full bg-brand-red text-white grid place-items-center group-hover:rotate-45 transition-transform duration-300"><ArrowUpRight size={16} /></span>
              </span>
            )}
          </>
        );
        const surface = dark ? 'bg-white/[0.05] hover:bg-white/[0.08]' : sf.card;
        const cls = `group h-full flex flex-col rounded-[20px] p-7 md:p-8 transition-colors duration-300 ${surface}`;
        return (
          <motion.div key={it.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 4) * 0.07, ease, duration: 0.6 }}>
            {it.href ? <Link to={it.href} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>}
          </motion.div>
        );
      })}
    </div>
  );
}

export function Steps({ steps, dark = false }: { steps: { title: string; body: string; time?: string }[]; dark?: boolean }) {
  const sf = useSurface();
  return (
    <ol className="grid gap-2 md:gap-3">
      {steps.map((s, i) => (
        <motion.li key={s.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
          className={`grid grid-cols-[44px_1fr] md:grid-cols-[64px_1fr_1.6fr_auto] items-start md:items-center gap-x-5 gap-y-2 rounded-[18px] px-5 md:px-7 py-5 md:py-6 ${dark ? 'bg-white/[0.05]' : sf.card}`}>
          <span className={`w-10 h-10 rounded-full grid place-items-center text-sm font-semibold tabular-nums ${i === 0 ? 'bg-brand-red text-white' : dark ? 'bg-white/10 text-white' : `${sf.soft} text-brand-dark`}`}>{i + 1}</span>
          <h3 className={`${HEAD} text-lg md:text-xl self-center ${dark ? 'text-white' : 'text-brand-dark'}`}>{s.title}</h3>
          <p className={`col-start-2 md:col-start-auto text-[15px] leading-relaxed ${dark ? 'text-white/60' : 'text-brand-dark/60'}`}>{s.body}</p>
          {s.time && <span className={`col-start-2 md:col-start-auto justify-self-start md:justify-self-end text-[12px] font-medium rounded-full px-3 py-1 whitespace-nowrap ${dark ? 'bg-white/10 text-white/70' : `${sf.soft} text-brand-dark/60`}`}>{s.time}</span>}
        </motion.li>
      ))}
    </ol>
  );
}

export function FAQ({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const sf = useSurface();
  return (
    <div className="grid gap-2 md:gap-3">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q} className={`rounded-[18px] transition-colors ${isOpen ? sf.open : sf.card}`}>
            <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between gap-6 px-6 md:px-7 py-5 text-left">
              <span className={`${HEAD} text-lg text-brand-dark`}>{it.q}</span>
              <span className={`w-9 h-9 rounded-full grid place-items-center shrink-0 transition-all duration-300 ${isOpen ? 'bg-brand-red text-white rotate-45' : `${sf.soft} text-brand-dark`}`}><Plus size={16} /></span>
            </button>
            {isOpen && <p className="px-6 md:px-7 pb-6 -mt-1 text-[15px] text-brand-dark/65 leading-relaxed max-w-3xl">{it.a}</p>}
          </div>
        );
      })}
    </div>
  );
}

/** Feature comparison. Cells: true / false / text. */
export function Compare({ columns, rows, highlight = 0 }: { columns: string[]; rows: { label: string; cells: (boolean | string)[] }[]; highlight?: number }) {
  const off = useContext(ToneCtx) === 'off';
  return (
    <div className={`rounded-[20px] ${off ? 'bg-white' : 'bg-[#f4f4f4]'} p-2 md:p-3 overflow-x-auto`}>
      <table className="w-full min-w-[720px] text-sm border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="w-[28%]" />
            {columns.map((c, i) => (
              <th key={c} className={`py-4 px-5 text-left ${HEAD} text-base ${i === highlight ? 'bg-brand-dark text-white rounded-t-[14px]' : 'text-brand-dark'}`}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={r.label} className="align-top">
              <td className="py-4 px-5 text-brand-dark font-medium border-t border-black/[0.06]">{r.label}</td>
              {r.cells.map((c, i) => (
                <td key={i} className={`py-4 px-5 border-t ${i === highlight ? `${off ? 'bg-[#f6f6f6]' : 'bg-white'} border-black/[0.04] ${ri === rows.length - 1 ? 'rounded-b-[14px]' : ''}` : 'border-black/[0.06]'}`}>
                  {c === true ? <span className="w-6 h-6 rounded-full bg-brand-red grid place-items-center"><Check size={13} className="text-white" /></span>
                    : c === false ? <X size={17} className="text-brand-dark/25" />
                      : <span className="text-brand-dark/70">{c}</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CTABand({ title, body, topic, label = 'Book a strategy call', secondary }: {
  title: ReactNode; body: string; topic: string; label?: string; secondary?: { to: string; label: string };
}) {
  return (
    <section className="w-full px-2 md:px-3 pt-2 md:pt-3">
      <div className="relative overflow-hidden rounded-[24px] bg-brand-red px-6 md:px-14 py-16 md:py-24">
        <div className="absolute -top-48 -right-32 w-[560px] h-[560px] rounded-full border border-white/15 pointer-events-none" />
        <div className="absolute -top-28 -right-10 w-[340px] h-[340px] rounded-full border border-white/15 pointer-events-none" />
        <div className="relative z-10 max-w-[1240px] mx-auto grid md:grid-cols-[1.4fr_1fr] gap-10 md:items-end">
          <div>
            <h2 className={`${HEAD} text-white leading-[1.06]`} style={{ fontSize: 'clamp(2.2rem, 4.4vw, 3.8rem)' }}>{title}</h2>
            <p className="text-white/80 mt-5 max-w-xl text-base md:text-lg leading-relaxed">{body}</p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 md:justify-self-end">
            <CTA to={contactHref(topic)} label={label} tone="light" id={`band-${topic}`} />
            {secondary && <CTA to={secondary.to} label={secondary.label} tone="outline-light" id={`band-${topic}-secondary`} />}
          </div>
        </div>
      </div>
    </section>
  );
}

/** "Keep exploring" row to keep every page connected. */
export function Related({ links }: { links: { to: string; label: string; body: string }[] }) {
  return (
    <section className="w-full px-2 md:px-3 py-2 md:py-3">
      <div className="rounded-[24px] bg-white px-6 md:px-14 py-14 md:py-20">
        <div className="max-w-[1240px] mx-auto">
          <h2 className={`${HEAD} text-brand-dark text-2xl md:text-3xl mb-8`}>Keep exploring.</h2>
          <div className="grid md:grid-cols-3 gap-3 md:gap-4">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="group rounded-[20px] bg-[#f4f4f4] hover:bg-brand-dark p-7 min-h-[170px] flex flex-col transition-colors duration-300">
                <span className={`${HEAD} text-xl text-brand-dark group-hover:text-white transition-colors`}>{l.label}</span>
                <p className="text-[15px] text-brand-dark/60 group-hover:text-white/60 mt-2 transition-colors">{l.body}</p>
                <span className="mt-auto pt-6 self-end w-9 h-9 rounded-full bg-white group-hover:bg-brand-red text-brand-dark group-hover:text-white grid place-items-center transition-all duration-300 group-hover:rotate-45"><ArrowUpRight size={16} /></span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="mt-8 text-[13px] text-brand-dark/50 leading-relaxed max-w-3xl">{children}</p>;
}
