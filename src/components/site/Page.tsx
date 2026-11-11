import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Minus, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { NavBar } from '../NavBar';
import { Footer } from '../Footer';
import { CTA, contactHref } from '../CTA';

/* Shared building blocks for the detail pages (services, tools, guides).
   Same visual language as About / service pages: dark hero, mono eyebrows, red accent. */

const DOT_GRID = 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)';
const ease = [0.16, 1, 0.3, 1] as const;

export function SitePage({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-white font-sans overflow-x-hidden">
      <NavBar darkHero />
      {children}
      <Footer />
    </div>
  );
}

export function PageHero({ eyebrow, tag, title, lead, ctas, meta }: {
  eyebrow: string;
  tag?: string;
  title: ReactNode;
  lead: ReactNode;
  ctas?: ReactNode;
  meta?: { k: string; v: string }[];
}) {
  return (
    <section className="relative w-full bg-brand-dark overflow-hidden px-6 md:px-8 pt-36 pb-20">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(120% 120% at 50% -10%, #18181a 0%, #0b0b0c 55%, #050506 100%)' }} />
      <div className="absolute inset-0 pointer-events-none opacity-70"
        style={{ backgroundImage: DOT_GRID, backgroundSize: '30px 30px', maskImage: 'radial-gradient(ellipse 70% 60% at 30% 20%, #000, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 30% 20%, #000, transparent 75%)' }} />
      <div className="absolute -bottom-56 -left-44 w-[820px] h-[640px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(230,25,43,0.22) 0%, transparent 60%)', filter: 'blur(50px)' }} />
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-12 gap-4">
          <span className="font-mono text-[11px] tracking-widest text-brand-red uppercase">{eyebrow}</span>
          {tag && <span className="hidden sm:block font-mono text-[11px] tracking-widest text-white/30 uppercase">{tag}</span>}
        </div>
        <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}
          className="font-display tracking-tight text-white leading-[1.04] max-w-4xl" style={{ fontSize: 'clamp(2.4rem, 5.2vw, 4.6rem)' }}>
          {title}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-7 text-white/55 font-light text-lg max-w-2xl leading-relaxed">
          {lead}
        </motion.p>
        {ctas && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-10 flex flex-wrap gap-3">{ctas}</motion.div>}
        {meta && (
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 max-w-3xl border-t border-white/10">
            {meta.map((m) => (
              <div key={m.k} className="py-5 pr-5">
                <p className="font-mono text-[9px] tracking-widest text-white/35 uppercase mb-1.5">{m.k}</p>
                <p className="font-display font-semibold text-white text-sm md:text-base">{m.v}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const TONES = {
  white: 'bg-white text-brand-dark',
  off: 'bg-surface-light text-brand-dark',
  dark: 'bg-brand-dark text-white',
};

export function Section({ tone = 'white', eyebrow, title, lead, children, id }: {
  tone?: keyof typeof TONES; eyebrow?: string; title?: ReactNode; lead?: ReactNode; children?: ReactNode; id?: string;
}) {
  const dark = tone === 'dark';
  return (
    <section id={id} className={`w-full px-6 md:px-8 py-24 ${TONES[tone]} ${dark ? '' : 'border-b border-black/5'}`}>
      <div className="max-w-[1200px] mx-auto">
        {(eyebrow || title || lead) && (
          <div className="mb-14 grid md:grid-cols-[1.2fr_1fr] gap-6 md:items-end">
            <div>
              {eyebrow && <span className="block font-mono text-[10px] tracking-widest text-brand-red uppercase mb-4">{eyebrow}</span>}
              {title && <h2 className={`font-display font-bold tracking-tighter leading-[1.02] ${dark ? 'text-white' : 'text-brand-dark'}`} style={{ fontSize: 'clamp(2rem, 4vw, 3.6rem)' }}>{title}</h2>}
            </div>
            {lead && <p className={`text-sm md:text-base font-light leading-relaxed max-w-md md:justify-self-end ${dark ? 'text-white/50' : 'text-brand-dark/55'}`}>{lead}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export interface CardItem { title: string; body: string; tag?: string; href?: string; points?: string[] }

export function CardGrid({ items, cols = 3, dark = false }: { items: CardItem[]; cols?: 2 | 3 | 4; dark?: boolean }) {
  const grid = cols === 2 ? 'md:grid-cols-2' : cols === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3';
  return (
    <div className={`grid ${grid} gap-5`}>
      {items.map((it, i) => {
        const inner = (
          <>
            {it.tag && <span className={`font-mono text-[9px] tracking-widest uppercase ${dark ? 'text-brand-red' : 'text-brand-red'}`}>{it.tag}</span>}
            <h3 className={`font-display font-bold text-xl mt-2 mb-2.5 ${dark ? 'text-white' : 'text-brand-dark'}`}>{it.title}</h3>
            <p className={`text-sm font-light leading-relaxed ${dark ? 'text-white/55' : 'text-brand-dark/60'}`}>{it.body}</p>
            {it.points && (
              <ul className="mt-4 space-y-2">
                {it.points.map((p) => (
                  <li key={p} className={`flex gap-2 text-sm ${dark ? 'text-white/70' : 'text-brand-dark/70'}`}><Check size={15} className="text-brand-red shrink-0 mt-0.5" />{p}</li>
                ))}
              </ul>
            )}
            {it.href && <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-red">Learn more <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" /></span>}
          </>
        );
        const cls = `group block rounded-3xl border p-8 transition-colors ${dark ? 'bg-white/[0.03] border-white/10 hover:border-brand-red/40' : 'bg-surface-offwhite/60 border-black/6 hover:border-brand-red/25'}`;
        return (
          <motion.div key={it.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 4) * 0.07 }}>
            {it.href ? <Link to={it.href} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>}
          </motion.div>
        );
      })}
    </div>
  );
}

export function Steps({ steps, dark = false }: { steps: { title: string; body: string; time?: string }[]; dark?: boolean }) {
  return (
    <ol className={`border-t ${dark ? 'border-white/10' : 'border-black/10'}`}>
      {steps.map((s, i) => (
        <motion.li key={s.title} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
          className={`grid grid-cols-[48px_1fr] md:grid-cols-[80px_1.1fr_2fr_120px] gap-x-6 gap-y-2 py-7 border-b ${dark ? 'border-white/10' : 'border-black/10'}`}>
          <span className="font-mono text-sm text-brand-red">{String(i + 1).padStart(2, '0')}</span>
          <h3 className={`font-display font-bold text-lg ${dark ? 'text-white' : 'text-brand-dark'}`}>{s.title}</h3>
          <p className={`col-start-2 md:col-start-auto text-sm font-light leading-relaxed ${dark ? 'text-white/55' : 'text-brand-dark/60'}`}>{s.body}</p>
          {s.time && <span className={`col-start-2 md:col-start-auto font-mono text-[11px] tracking-widest uppercase md:text-right ${dark ? 'text-white/35' : 'text-brand-dark/40'}`}>{s.time}</span>}
        </motion.li>
      ))}
    </ol>
  );
}

export function FAQ({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-t border-black/10">
      {items.map((it, i) => (
        <div key={it.q} className="border-b border-black/10">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-6 py-6 text-left">
            <span className="font-display font-semibold text-lg text-brand-dark">{it.q}</span>
            {open === i ? <Minus size={18} className="text-brand-red shrink-0" /> : <Plus size={18} className="text-brand-dark/40 shrink-0" />}
          </button>
          {open === i && <p className="pb-6 -mt-2 text-sm text-brand-dark/60 font-light leading-relaxed max-w-3xl">{it.a}</p>}
        </div>
      ))}
    </div>
  );
}

/** Feature comparison. Cells: true / false / text. */
export function Compare({ columns, rows, highlight = 0 }: { columns: string[]; rows: { label: string; cells: (boolean | string)[] }[]; highlight?: number }) {
  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr>
            <th className="text-left py-4 pr-4 font-mono text-[10px] tracking-widest uppercase text-brand-dark/40 font-medium w-[28%]" />
            {columns.map((c, i) => (
              <th key={c} className={`py-4 px-4 text-left font-display font-bold ${i === highlight ? 'text-brand-red' : 'text-brand-dark'}`}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-black/8 align-top">
              <td className="py-4 pr-4 text-brand-dark font-medium">{r.label}</td>
              {r.cells.map((c, i) => (
                <td key={i} className={`py-4 px-4 ${i === highlight ? 'bg-brand-red/[0.04]' : ''}`}>
                  {c === true ? <Check size={17} className="text-brand-red" /> : c === false ? <X size={17} className="text-brand-dark/25" /> : <span className="text-brand-dark/65 font-light">{c}</span>}
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
    <section className="w-full bg-brand-red px-6 md:px-8 py-24 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-white/10 blur-[90px] pointer-events-none" />
      <div className="max-w-[1000px] mx-auto text-center relative z-10">
        <h2 className="font-display font-bold tracking-tighter text-white leading-[1.0]" style={{ fontSize: 'clamp(2.2rem, 5vw, 4.4rem)' }}>{title}</h2>
        <p className="text-white/75 font-light mt-6 max-w-xl mx-auto leading-relaxed">{body}</p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <CTA to={contactHref(topic)} label={label} tone="dark" id={`band-${topic}`} />
          {secondary && <CTA to={secondary.to} label={secondary.label} tone="outline-light" id={`band-${topic}-secondary`} />}
        </div>
      </div>
    </section>
  );
}

/** Small "related pages" row to keep every page connected. */
export function Related({ links }: { links: { to: string; label: string; body: string }[] }) {
  return (
    <section className="w-full bg-white px-6 md:px-8 py-20 border-t border-black/5">
      <div className="max-w-[1200px] mx-auto">
        <span className="block font-mono text-[10px] tracking-widest text-brand-red uppercase mb-6">Keep exploring</span>
        <div className="grid md:grid-cols-3 gap-4">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="group rounded-2xl border border-black/8 p-6 hover:border-brand-red/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-brand-dark group-hover:text-brand-red transition-colors">{l.label}</span>
                <ArrowRight size={15} className="text-brand-dark/30 group-hover:text-brand-red group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-sm text-brand-dark/55 font-light mt-2">{l.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="mt-8 text-xs text-brand-dark/45 font-light leading-relaxed max-w-3xl">{children}</p>;
}
