import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { ArrowRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';

/* ── Animated counter ── */
function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let cur = 0; const step = to / 55;
    const t = setInterval(() => { cur += step; if (cur >= to) { setVal(to); clearInterval(t); } else setVal(Math.floor(cur)); }, 18);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ── Threat items ── */
const threats = [
  'Old stock', 'Damaged packaging', 'Grey-market supply',
  'Copied listings', 'Wrong images', 'Unauthorised sellers',
  'Price drops', 'Fake reviews', 'Counterfeit copies',
];

/* ── Watch categories ── */
const watchItems = [
  {
    num: '01',
    title: 'Seller Activity',
    body: 'Who is selling your products, where they appear, and whether they look authorised, unknown, grey-market or high-risk.',
    status: 'ACTIVE',
  },
  {
    num: '02',
    title: 'Pricing Movement',
    body: 'Sudden price drops, undercutting, MAP breaches and sellers damaging the value of your product.',
    status: 'MONITORING',
  },
  {
    num: '03',
    title: 'Listing Changes',
    body: 'Poor content, wrong images, hijacked listings, duplicate pages, keyword misuse and inconsistent brand presentation.',
    status: 'WATCHING',
  },
  {
    num: '04',
    title: 'Stock Behaviour',
    body: 'Suspicious quantities, old stock patterns, clearance supply, mixed inventory and availability anomalies.',
    status: 'TRACKING',
  },
  {
    num: '05',
    title: 'Counterfeit Signals',
    body: 'Listings and sellers that may need test buys, packaging checks, batch-code review or takedown action.',
    status: 'FLAGGING',
  },
];

/* ── Evidence types ── */
const evidenceTypes = [
  'Test-buy records', 'Seller screenshots', 'Pricing history',
  'Packaging comparisons', 'Batch-code checks', 'Listing snapshots',
  'Marketplace-ready evidence packs',
];

export default function BrandProtection() {
  const [activeWatch, setActiveWatch] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveWatch(i => (i + 1) % watchItems.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full min-h-screen bg-white font-sans overflow-x-hidden">
      <NavBar />

      {/* ══════════════════════════════════════════
          1. HERO — white, left-aligned, asymmetric
             Different from MC's centered red hero
         ══════════════════════════════════════════ */}
      <section className="relative w-full min-h-screen bg-white flex flex-col overflow-hidden px-8 pt-20 pb-8">
        {/* Soft light base */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(120% 120% at 70% 10%, #ffffff 0%, #f4f4f4 60%, #ececec 100%)' }} />
        {/* Dot grid dissolving toward the shield */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(10,10,10,0.06) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            maskImage: 'radial-gradient(ellipse 60% 70% at 72% 45%, #000 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 70% at 72% 45%, #000 0%, transparent 70%)',
          }} />
        {/* Faint red glow behind the shield */}
        <div className="absolute top-10 -right-20 w-[650px] h-[650px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(230,25,43,0.08) 0%, transparent 60%)', filter: 'blur(40px)' }} />
        {/* Top hairline */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent pointer-events-none" />

        <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col relative z-10">

          {/* Top rule */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex items-center justify-between py-5 border-b border-black/10">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] tracking-widest text-brand-red">02 / 04</span>
              <span className="w-px h-3 bg-black/15" />
              <span className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-brand-dark/55 uppercase">
                <Shield size={12} className="text-brand-red" strokeWidth={2} /> Brand Protection
              </span>
            </div>
            <span className="hidden md:block font-mono text-[11px] tracking-widest text-brand-dark/30 uppercase">Loop Protect</span>
            <span className="font-mono text-[11px] tracking-widest text-brand-dark/40 uppercase">Loop Retail</span>
          </motion.div>

          {/* Main */}
          <div className="flex-1 grid md:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center py-14">
            {/* Left */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="font-display tracking-tight text-brand-dark leading-[1.04]"
                style={{ fontSize: 'clamp(2.4rem, 4.8vw, 4.8rem)' }}>
                <span className="font-light text-brand-dark/45">Protect the brand</span><br />
                <span className="font-bold">before the market </span>
                <span className="font-bold text-brand-red">rewrites it.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.7 }}
                className="mt-7 text-brand-dark/50 font-light text-base md:text-lg max-w-md leading-relaxed">
                A marketplace can grow your brand quickly. It can also damage it quietly — and the customer blames you, not the seller.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-10 flex items-center gap-7">
                <a href="#protect"
                  className="flex items-center gap-2 bg-brand-dark text-white px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-brand-red transition-colors group">
                  See Loop Protect <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
                <a href="#watch" className="font-mono text-[11px] tracking-widest text-brand-dark/40 hover:text-brand-dark transition-colors uppercase">
                  What we watch ↓
                </a>
              </motion.div>
            </div>

          {/* Right: animated threat shield visual */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
            className="relative flex items-center justify-center min-h-[380px]">

            {/* Shield core */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {/* Outer glow ring — opacity only (GPU-accelerated, no repaint) */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <motion.div
                  animate={{ opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-[-12px] rounded-full bg-brand-red blur-xl pointer-events-none"
                  style={{ willChange: 'opacity' }}
                />
                <div className="relative w-28 h-28 rounded-full bg-white border-2 border-brand-red/20 flex items-center justify-center">
                  <Shield size={44} className="text-brand-red" strokeWidth={1.5} />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.12, 0, 0.12] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-brand-red"
                    style={{ willChange: 'transform, opacity' }}
                  />
                </div>
              </div>

              {/* Status badge */}
              <div className="mt-4 flex items-center gap-2 bg-brand-dark text-white text-[9px] font-mono tracking-widest px-4 py-2 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                LOOP PROTECT — ACTIVE
              </div>
            </div>

            {/* Orbiting threat tags */}
            {threats.slice(0, 6).map((threat, i) => {
              const angle = (i / 6) * 2 * Math.PI;
              const r = 170;
              const x = Math.cos(angle) * r;
              const y = Math.sin(angle) * r;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.12 }}
                  style={{ position: 'absolute', left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%, -50%)' }}
                  className="text-[9px] font-mono tracking-wide bg-surface-offwhite border border-black/8 text-brand-dark/50 px-2.5 py-1.5 rounded-full whitespace-nowrap"
                >
                  {threat}
                </motion.div>
              );
            })}

            {/* Connecting lines SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 420" style={{ overflow: 'visible' }}>
              {threats.slice(0, 6).map((_, i) => {
                const angle = (i / 6) * 2 * Math.PI;
                const r = 170;
                const x = 200 + Math.cos(angle) * r;
                const y = 210 + Math.sin(angle) * r;
                return (
                  <motion.line key={i}
                    x1="200" y1="210" x2={x} y2={y}
                    stroke="rgba(230,25,43,0.08)" strokeWidth="1" strokeDasharray="3 5"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ delay: 1 + i * 0.1, duration: 0.6 }}
                  />
                );
              })}
            </svg>
          </motion.div>
          </div>

          {/* Bottom rule — protection facts */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 border-t border-black/10 divide-x divide-black/8">
            {[
              { k: 'Sellers',      v: 'Monitored'    },
              { k: 'Pricing',      v: 'MAP enforced' },
              { k: 'Listings',     v: 'Protected'    },
              { k: 'Counterfeits', v: 'Flagged'      },
            ].map((f, i) => (
              <div key={i} className="px-5 md:px-6 py-5 first:pl-0">
                <p className="font-mono text-[9px] tracking-widest text-brand-dark/35 uppercase mb-1.5">{f.k}</p>
                <p className="font-display font-semibold text-brand-dark text-sm">{f.v}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. PROBLEM — dark, threat grid
         ══════════════════════════════════════════ */}
      <section className="w-full bg-brand-dark py-24 px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-brand-red/6 blur-[130px] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto relative z-10 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-5 block">The Problem</span>
            <h2 className="font-display font-bold tracking-tighter text-white leading-[1.0] mb-6"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)' }}>
              The customer doesn't see the supply chain.
            </h2>
            <p className="text-gray-400 font-light leading-relaxed border-l-2 border-brand-red/30 pl-5">
              They see your brand name. And if something feels wrong, your brand takes the blame — not the seller.
            </p>
          </div>

          {/* Threat grid — floating tags */}
          <div className="flex flex-wrap gap-2.5">
            {threats.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.05, borderColor: 'rgba(230,25,43,0.5)', color: '#e6192b' }}
                className="text-xs font-mono tracking-wide border border-white/8 text-white/40 px-4 py-2.5 rounded-full bg-white/3 transition-all cursor-default">
                {t}
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.7 }}
              className="text-xs font-mono tracking-wide border border-brand-red/30 text-brand-red px-4 py-2.5 rounded-full bg-brand-red/5">
              + more
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. STATS — red full-bleed
         ══════════════════════════════════════════ */}
      <section className="w-full bg-brand-red relative overflow-hidden">
        {/* Orbital ring */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15" viewBox="0 0 1440 280" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="720" cy="140" rx="700" ry="120" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 12" />
        </svg>
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/15 relative z-10">
          {[
            { val: 467, pre: '$', suf: 'B', caption: 'global trade in fake goods — 2.3% of all imports (OECD)' },
            { val: 9,   pre: '£', suf: 'B', caption: 'annual UK loss from counterfeiting and piracy' },
            { val: 24,       suf: '%', caption: 'of UK consumers knowingly bought a counterfeit product (IPO 2025)' },
            { val: 17,       suf: '%', caption: 'bought one without realising — rising to 25.5% for ages 25–34' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="px-8 py-14">
              <p className="font-display font-bold tracking-tighter text-white mb-2"
                style={{ fontSize: 'clamp(2.4rem, 4vw, 3.8rem)' }}>
                <Counter to={s.val} prefix={s.pre ?? ''} suffix={s.suf} />
              </p>
              <p className="text-white/55 text-xs font-light leading-relaxed">{s.caption}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. LOOP PROTECT — dark, radar of monitored signals
         ══════════════════════════════════════════ */}
      <section id="protect" className="w-full bg-[#0c0c0d] py-28 px-6 md:px-8 relative overflow-hidden">
        <div className="absolute -bottom-40 right-0 w-[760px] h-[620px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(230,25,43,0.18) 0%, transparent 62%)', filter: 'blur(40px)' }} />
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-[1fr_1.05fr] gap-14 items-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-6 block">Loop Protect</span>
            <h2 className="font-display font-bold tracking-tighter leading-[0.98] text-white" style={{ fontSize: 'clamp(2.8rem, 5.4vw, 5rem)' }}>
              Your brand creates demand.<br /><span className="text-brand-red">Know what happens next.</span>
            </h2>
            <p className="mt-7 text-white/60 font-light text-base md:text-lg leading-relaxed max-w-lg">
              A new seller. A lookalike pack. A genuine product with an unclear supply route. Loop Protect brings the evidence together and helps us take the right next step.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/tools/loop-protect" className="inline-flex items-center gap-2 rounded-full bg-brand-red px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#c0001f] transition-colors">
                Explore a protection scenario <ArrowRight size={15} />
              </Link>
              <Link to="/how-it-works" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white hover:text-brand-dark transition-colors">
                How we work <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
            className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.07]">
              <span className="w-2 h-2 rounded-full bg-brand-red" /><span className="w-2 h-2 rounded-full bg-white/20" /><span className="w-2 h-2 rounded-full bg-white/20" />
              <span className="flex-1 text-center text-[11px] font-mono text-white/50">loop protect / monitored signals</span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-red/30 bg-brand-red/10 px-2 py-1 text-[9px] font-mono tracking-widest text-white/70"><span className="w-1.5 h-1.5 rounded-full bg-brand-red" />ILLUSTRATIVE DATA</span>
            </div>
            <div className="relative mx-auto my-6 aspect-square w-[min(calc(100%-3rem),380px)]">
              {[100, 66, 33].map((size) => (
                <div key={size} className="absolute rounded-full border border-white/10" style={{ width: `${size}%`, height: `${size}%`, left: `${(100 - size) / 2}%`, top: `${(100 - size) / 2}%` }} />
              ))}
              <motion.div className="absolute inset-0 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{ background: 'conic-gradient(from 0deg, rgba(230,25,43,0.45), rgba(230,25,43,0) 55deg, transparent 360deg)', maskImage: 'radial-gradient(circle, #000 69%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle, #000 69%, transparent 70%)' }} />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[17%] h-[17%] rounded-full border border-brand-red/70 bg-brand-red/10 flex items-center justify-center text-white text-lg">∞</div>
              {[
                { label: 'Known seller', x: 24, y: 24, color: '#34D399', align: 'above' },
                { label: 'Review signal', x: 82, y: 39, color: '#E6192B', align: 'left' },
                { label: 'Compatible listing', x: 41, y: 78, color: '#F5B85A', align: 'below' },
              ].map((d, i) => (
                <div key={d.label} className="absolute" style={{ left: `${d.x}%`, top: `${d.y}%` }}>
                  <motion.span className="block w-3 h-3 -ml-1.5 -mt-1.5 rounded-full" style={{ background: d.color, boxShadow: `0 0 14px ${d.color}` }}
                    animate={{ scale: [1, 1.35, 1] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6 }} />
                  <span className={`absolute whitespace-nowrap text-[10px] font-mono text-white/70 ${d.align === 'above' ? '-top-6 -left-8' : d.align === 'left' ? 'top-2 right-2' : 'top-3 -left-10'}`}>{d.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-4 px-6 py-5 border-t border-white/[0.07]">
              <span className="text-xs text-white/55">See the signal. Verify the facts.</span>
              <Link to="/portal/demo/protection" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white hover:bg-white hover:text-brand-dark transition-colors">Open cases <ArrowRight size={13} /></Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. WHAT WE WATCH — dark, editorial rows
             Full-width items, not cards
         ══════════════════════════════════════════ */}
      <section id="watch" className="w-full bg-brand-dark py-24 px-8 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-brand-red/5 blur-[130px] pointer-events-none" />
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <h2 className="font-display font-bold tracking-tighter text-white leading-[1.0]"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 5rem)' }}>
              What Loop Protect<br />watches.
            </h2>
            <p className="text-gray-500 font-light text-sm max-w-xs leading-relaxed">
              Five layers of continuous protection, running across every channel you operate on.
            </p>
          </div>

          {/* Full-width editorial rows */}
          <div className="border-t border-white/6">
            {watchItems.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                onClick={() => setActiveWatch(i)}
                className={`group relative border-b border-white/6 cursor-pointer transition-all duration-300 ${activeWatch === i ? 'bg-white/3' : 'hover:bg-white/[0.015]'}`}>

                {/* Active left bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-300 ${activeWatch === i ? 'bg-brand-red' : 'bg-transparent'}`} />

                <div className="px-8 py-7 flex items-start gap-8">
                  {/* Number */}
                  <span className={`font-mono text-xs tracking-widest shrink-0 mt-1 w-6 transition-colors ${activeWatch === i ? 'text-brand-red' : 'text-white/20 group-hover:text-white/40'}`}>
                    {item.num}
                  </span>

                  {/* Title */}
                  <h3 className={`font-display font-bold shrink-0 transition-colors w-52 ${activeWatch === i ? 'text-white' : 'text-white/50 group-hover:text-white/75'}`}
                    style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }}>
                    {item.title}
                  </h3>

                  {/* Body — expands when active */}
                  <AnimatePresence>
                    {activeWatch === i ? (
                      <motion.p key="body" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-gray-400 font-light text-sm leading-relaxed flex-1 mt-0.5">
                        {item.body}
                      </motion.p>
                    ) : (
                      <div className="flex-1" />
                    )}
                  </AnimatePresence>

                  {/* Status */}
                  <span className={`text-[8px] font-mono tracking-widest px-3 py-1.5 rounded-full border shrink-0 transition-all ${
                    activeWatch === i
                      ? 'bg-brand-red/15 text-brand-red border-brand-red/25'
                      : 'bg-white/3 text-white/20 border-white/6'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. EVIDENCE — white, tag cloud
         ══════════════════════════════════════════ */}
      <section className="w-full bg-white py-24 px-8 border-b border-black/5">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-5 block">Evidence Before Action</span>
            <h2 className="font-display font-bold tracking-tighter text-brand-dark leading-[1.0] mb-6"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)' }}>
              Marketplaces need proof.<br />We build it properly.
            </h2>
            <div className="space-y-3">
              {['Do not argue with the marketplace.', 'Show the proof.'].map((line, i) => (
                <p key={i} className={`font-display font-bold text-xl ${i === 0 ? 'text-brand-dark/30' : 'text-brand-dark'}`}>{line}</p>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[9px] font-mono tracking-widest text-brand-dark/30 uppercase mb-5">Evidence types we compile</p>
            <div className="flex flex-wrap gap-2.5">
              {evidenceTypes.map((e, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.05, borderColor: 'rgba(230,25,43,0.4)' }}
                  className="flex items-center gap-2 border border-black/8 rounded-full px-5 py-3 hover:bg-brand-red/3 transition-all cursor-default">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-red/40" />
                  <span className="text-sm font-medium text-brand-dark/65">{e}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. BUILT-IN MODEL — brand-red, bold statement
         ══════════════════════════════════════════ */}
      <section className="w-full bg-brand-red py-24 px-8 relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 1440 280" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="720" cy="140" rx="680" ry="110" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="3 10" />
          <ellipse cx="720" cy="140" rx="420" ry="70" fill="none" stroke="white" strokeWidth="0.5" />
        </svg>
        <div className="max-w-[1100px] mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="font-display font-bold tracking-tighter text-white leading-[1.0]"
              style={{ fontSize: 'clamp(2rem, 5vw, 5rem)' }}>
              <span className="text-white/45 font-light">Most agencies sell brand protection as an add-on.</span>{' '}
              Loop Retail builds it into the operating model.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {['Fewer unknown sellers', 'Cleaner pricing', 'Stronger listings', 'Better packaging', 'More reliable stock', 'Faster action'].map((item, i) => (
                <motion.span key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="text-[11px] font-mono tracking-widest text-white/70 border border-white/20 px-4 py-2 rounded-full bg-white/8">
                  {item}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          8. CTA — white
         ══════════════════════════════════════════ */}
      <section id="audit" className="w-full bg-white py-36 px-8 relative overflow-hidden border-t border-black/5">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="720" cy="300" rx="640" ry="200" fill="none" stroke="rgba(230,25,43,0.05)" strokeWidth="1" strokeDasharray="6 14" />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-red/4 blur-[100px] rounded-full pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="max-w-[1000px] mx-auto text-center relative z-10">
          <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-10 block">Protect the Margin</span>
          <h2 className="font-display font-bold tracking-tighter text-brand-dark leading-[0.93]"
            style={{ fontSize: 'clamp(3rem, 8vw, 7.5rem)' }}>
            Your brand already<br />has value.<br />
            <span className="text-brand-red">Don't let the marketplace take it.</span>
          </h2>
          <p className="text-brand-dark/40 font-light text-base mt-10 mb-12 max-w-md mx-auto leading-relaxed">
            Loop Protect helps make sure the marketplace doesn't quietly erode what you've built.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:hello@loopretail.io"
              className="flex items-center gap-2 bg-brand-red text-white px-10 py-4 rounded-full font-semibold text-sm hover:bg-[#c0001f] transition-colors group">
              Request a Brand Audit
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a href="/"
              className="text-sm font-mono text-brand-dark/30 hover:text-brand-dark/60 tracking-widest transition-colors uppercase">
              ← Back to home
            </a>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
