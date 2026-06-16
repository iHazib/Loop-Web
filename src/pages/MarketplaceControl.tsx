import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';

/* ─── Animated counter ─── */
function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let cur = 0;
    const step = to / 55;
    const t = setInterval(() => {
      cur += step;
      if (cur >= to) { setVal(to); clearInterval(t); }
      else setVal(Math.floor(cur));
    }, 18);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ─── Data ─── */
const sellerRisks = [
  { id: '01', label: 'Authorised', risk: 'Clean', detail: 'Brand-compliant. Your listing. Your price.', ok: true },
  { id: '02', label: 'Wholesaler', risk: 'Medium', detail: 'Slightly cheaper. Different packaging.', ok: false },
  { id: '03', label: 'Grey Market', risk: 'High', detail: 'Clearance stock. Undercuts your price.', ok: false },
  { id: '04', label: 'Unknown', risk: 'Critical', detail: 'May be counterfeit. Looks identical to buyers.', ok: false },
];

const pillars = [
  { num: '1.0', title: 'Pricing Control', body: 'MAP enforcement across every listing, every channel, in real time.' },
  { num: '2.0', title: 'Listing Ownership', body: 'Optimised titles, images, A+ content and keywords built for marketplace search.' },
  { num: '3.0', title: 'Stock Management', body: 'Demand forecasting and fulfilment coordination so you never lose rank.' },
  { num: '4.0', title: 'Seller Protection', body: 'Identify and remove unauthorised sellers undermining price and trust.' },
];

const timelineSteps = [
  { label: 'Audit', sub: 'Week 1', desc: 'Full marketplace mapping — sellers, listings, pricing gaps.' },
  { label: 'Structure', sub: 'Week 2', desc: 'Clean pricing, optimised content, stock plan.' },
  { label: 'Launch', sub: 'Week 3–4', desc: 'Go live on primary channels with ad strategy.' },
  { label: 'Operate', sub: 'Ongoing', desc: 'Active management with commercial accountability.' },
];

const serviceList = [
  'Pricing & MAP Enforcement',
  'Listing Content & Quality',
  'Stock Planning & Fulfilment',
  'Seller Identification & Removal',
  'Marketplace Ad Strategy',
  'Review Monitoring & Trust',
];

export default function MarketplaceControl() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeTimeline, setActiveTimeline] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveTimeline(i => (i + 1) % timelineSteps.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full min-h-screen bg-white font-sans overflow-x-hidden">
      <NavBar darkHero={true} />

      {/* ══════════════════════════════════════════
          1. HERO — full-viewport red statement
         ══════════════════════════════════════════ */}
      <section className="relative w-full min-h-screen bg-brand-red flex flex-col overflow-hidden px-8 pt-20 pb-8">

        {/* Orbital rings */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="720" cy="450" rx="680" ry="340" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="3 12" opacity="0.18" />
          <ellipse cx="720" cy="450" rx="440" ry="220" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15" />
          <ellipse cx="720" cy="450" rx="260" ry="130" fill="none" stroke="white" strokeWidth="0.5" opacity="0.10" />
          <circle cx="1388" cy="340" r="5" fill="white" opacity="0.5" />
          <circle cx="72" cy="580" r="3.5" fill="white" opacity="0.35" />
          <circle cx="720" cy="108" r="3" fill="white" opacity="0.3" />
        </svg>

        {/* Subtle dark vignette edges */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(150,0,10,0.35) 100%)' }} />

        {/* Top hairline */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col relative z-10">

          {/* Top rule */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex items-center justify-between py-5 border-b border-white/20">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] tracking-widest text-white">01 / 04</span>
              <span className="w-px h-3 bg-white/30" />
              <span className="font-mono text-[11px] tracking-widest text-white/85 uppercase">Marketplace Control</span>
            </div>
            <span className="hidden md:block font-mono text-[11px] tracking-widest text-white/50 uppercase">UK Market Entry</span>
            <span className="font-mono text-[11px] tracking-widest text-white/70 uppercase">Loop Retail</span>
          </motion.div>

          {/* Centered statement */}
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-display tracking-tight text-white leading-[1.12] max-w-[1000px]"
              style={{ fontSize: 'clamp(2rem, 4.2vw, 4rem)' }}>
              <span className="font-light text-white/55">Every marketplace search is a</span>{' '}
              <span className="font-bold">digital shelf.</span>{' '}
              <span className="font-light text-white/55">If you don't control it —</span>{' '}
              <span className="font-bold">someone else will.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.7 }}
              className="mt-8 text-white/65 font-light text-base md:text-lg max-w-lg leading-relaxed">
              Customers can't see backend problems. They see what's on the listing — and they judge your brand by it.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.6 }}
              className="mt-11 flex flex-col sm:flex-row items-center gap-5">
              <a href="#audit"
                className="flex items-center gap-2 bg-white text-brand-red px-8 py-3.5 rounded-full font-bold text-sm hover:bg-white/90 transition-colors group shadow-lg">
                Request audit <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a href="#how" className="font-mono text-[11px] tracking-widest text-white/70 hover:text-white transition-colors uppercase">
                How it works ↓
              </a>
            </motion.div>
          </div>

          {/* Bottom rule — channel ticker */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}
            className="border-t border-white/20 py-5 flex items-center justify-center gap-4 flex-wrap">
            <span className="font-mono text-[9px] tracking-widest text-white/80 uppercase">Channels we operate</span>
            <span className="w-px h-3 bg-white/25" />
            <div className="flex items-center gap-4 font-mono text-[10px] tracking-widest text-white/55 uppercase">
              {['Amazon', 'eBay', 'TikTok Shop', 'OnBuy', 'Argos', 'B&Q'].map((c, i) => (
                <span key={i} className="flex items-center gap-4">{c}{i < 5 && <span className="w-1 h-1 rounded-full bg-white/30" />}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. STATS STRIP — white
         ══════════════════════════════════════════ */}
      <section className="w-full bg-white border-b border-black/6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-black/5">
          {[
            { val: 82, suf: '%', caption: 'of UK shoppers check marketplace prices before any purchase' },
            { val: 9,  pre: '£', suf: 'B', caption: 'lost to counterfeit and unauthorised sellers in the UK per year' },
            { val: 142,pre: '£', suf: 'B', caption: 'UK ecommerce market — still growing faster than physical retail' },
            { val: 67, suf: '%', caption: 'of brand trust decisions happen directly on the product listing' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="px-10 py-14 hover:bg-surface-offwhite/50 transition-colors">
              <p className="font-display font-bold tracking-tighter text-brand-dark mb-3"
                style={{ fontSize: 'clamp(2.8rem, 4.5vw, 4.2rem)' }}>
                <Counter to={s.val} prefix={s.pre ?? ''} suffix={s.suf} />
              </p>
              <p className="text-xs text-brand-dark/40 font-light leading-relaxed">{s.caption}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. SERVICES LIST — dark
             Inspired by: "Services →  [list]" layout from brand guidelines
             Big word left, arrow, vertical list right
         ══════════════════════════════════════════ */}
      <section className="w-full bg-brand-dark py-24 px-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[400px] h-full bg-brand-red/5 blur-[120px] pointer-events-none" />
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-0 items-center min-h-[400px]">

            {/* Left: massive word */}
            <div className="flex flex-col justify-center py-12">
              <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-6 block">What We Control</span>
              <h2 className="font-display font-bold tracking-tighter text-white"
                style={{ fontSize: 'clamp(4rem, 9vw, 9rem)', lineHeight: 0.9 }}>
                Control.
              </h2>
              <p className="mt-6 text-gray-500 font-light text-sm max-w-xs leading-relaxed">
                End-to-end marketplace management — every lever, one partner.
              </p>
            </div>

            {/* Center: arrow */}
            <div className="hidden md:flex items-center justify-center px-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-px h-24 bg-gradient-to-b from-transparent via-brand-red/40 to-transparent" />
                <motion.div
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-10 h-10 rounded-full border border-brand-red/30 flex items-center justify-center">
                  <ArrowRight size={16} className="text-brand-red" />
                </motion.div>
                <div className="w-px h-24 bg-gradient-to-b from-transparent via-brand-red/40 to-transparent" />
              </div>
            </div>

            {/* Right: vertical service list */}
            <div className="flex flex-col justify-center py-12 border-l border-white/6 pl-0 md:pl-12">
              {serviceList.map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="group flex items-center gap-4 py-4 border-b border-white/5 last:border-0 hover:border-brand-red/20 transition-colors cursor-default">
                  <span className="text-[9px] font-mono text-white/20 group-hover:text-brand-red transition-colors">0{i + 1}</span>
                  <span className="font-display font-medium text-white/60 group-hover:text-white transition-colors"
                    style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)' }}>
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. PILLARS — 1.0 / 2.0 / 3.0 / 4.0
             Inspired by: table of contents with version numbers
             White bg, large ghost number, title, body
         ══════════════════════════════════════════ */}
      <section className="w-full bg-white py-28 px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="font-display font-bold tracking-tighter text-brand-dark"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 5rem)' }}>
              The four pillars<br />of marketplace control.
            </h2>
            <p className="text-brand-dark/40 font-light text-sm max-w-xs leading-relaxed">
              Control only works when every part of the system connects. Missing one breaks the whole.
            </p>
          </div>

          {/* 2×2 grid — different proportion to the seller section */}
          <div className="grid sm:grid-cols-2 gap-5">
            {pillars.map((p, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className={`relative border rounded-3xl overflow-hidden cursor-default transition-all duration-300 group
                  ${i === 0 ? 'bg-brand-dark border-brand-dark' : i === 3 ? 'bg-brand-red border-brand-red' : 'bg-surface-offwhite border-black/6 hover:border-brand-red/20'}`}>
                <div className="p-10 flex flex-col justify-between min-h-[220px]">
                  {/* Top row: number tag + title */}
                  <div className="flex items-start justify-between gap-4">
                    <span className={`text-[9px] font-mono tracking-widest ${i === 0 || i === 3 ? 'text-white/30' : 'text-brand-dark/25'}`}>
                      {p.num}
                    </span>
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${i === 0 ? 'border-white/10' : i === 3 ? 'border-white/20' : 'border-black/8'}`}>
                      <div className={`w-2 h-2 rounded-full ${i === 0 || i === 3 ? 'bg-white/40' : 'bg-brand-red/40'}`} />
                    </div>
                  </div>
                  {/* Bottom: title + body */}
                  <div>
                    <h3 className={`font-display font-bold text-2xl mb-2 ${i === 0 || i === 3 ? 'text-white' : 'text-brand-dark'}`}>
                      {p.title}
                    </h3>
                    <p className={`text-sm font-light leading-relaxed ${i === 0 ? 'text-gray-400' : i === 3 ? 'text-white/70' : 'text-brand-dark/50'}`}>
                      {p.body}
                    </p>
                  </div>
                </div>
                {/* Accent decoration */}
                {i === 0 && <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-brand-red/40 via-brand-red/10 to-transparent" />}
                {i === 3 && <div className="absolute top-0 right-0 w-40 h-40 bg-white/8 blur-[60px] rounded-full" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. SELLER PROBLEM — white, split spotlight
         ══════════════════════════════════════════ */}
      <section className="w-full bg-surface-offwhite/50 py-28 px-8 border-y border-black/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-14">
            <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-4 block">The Seller Problem</span>
            <h2 className="font-display font-bold tracking-tighter text-brand-dark leading-[1.0]"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 5rem)' }}>
              Control slips away<br />seller by seller.
            </h2>
          </div>

          <div className="grid md:grid-cols-[1fr_1.4fr] gap-8 items-start">

            {/* LEFT — static spotlight panel, updates on row click */}
            <div className="sticky top-24">
              <div className={`rounded-3xl p-10 border relative overflow-hidden ${
                sellerRisks[activeIdx].ok ? 'bg-brand-dark border-brand-dark' : 'bg-brand-dark border-brand-red/40'
              }`}>
                <p className="font-display font-black tracking-tighter leading-none select-none mb-6"
                  style={{ fontSize: 'clamp(5rem, 10vw, 9rem)', color: sellerRisks[activeIdx].ok ? 'rgba(255,255,255,0.06)' : 'rgba(230,25,43,0.15)' }}>
                  {sellerRisks[activeIdx].id}
                </p>

                <p className="font-display font-bold text-white text-3xl mb-3">
                  {sellerRisks[activeIdx].label}
                </p>

                <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest px-3 py-1.5 rounded-full mb-6 ${
                  sellerRisks[activeIdx].ok
                    ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                    : sellerRisks[activeIdx].risk === 'Critical'
                      ? 'bg-brand-red/15 text-brand-red border border-brand-red/25'
                      : sellerRisks[activeIdx].risk === 'High'
                        ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                        : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                }`}>
                  <span className="w-1 h-1 rounded-full bg-current" />
                  {sellerRisks[activeIdx].risk} Risk
                </span>

                <p className="text-gray-400 font-light text-base leading-relaxed">
                  {sellerRisks[activeIdx].detail}
                </p>

                {!sellerRisks[activeIdx].ok && (
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-brand-red/10 blur-[60px] rounded-full pointer-events-none" />
                )}
              </div>
            </div>

            {/* RIGHT — clickable row list */}
            <div className="flex flex-col divide-y divide-black/6 border border-black/6 rounded-3xl overflow-hidden bg-white">
              {sellerRisks.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  onClick={() => setActiveIdx(i)}
                  className={`relative w-full text-left px-8 py-6 flex items-center gap-6 transition-all duration-250 group ${
                    activeIdx === i ? 'bg-brand-dark' : 'bg-white hover:bg-surface-offwhite/80'
                  }`}
                >
                  {/* Left accent bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-300 ${
                    activeIdx === i ? 'bg-brand-red' : 'bg-transparent'
                  }`} />

                  {/* Number */}
                  <span className={`font-mono text-xs tracking-widest shrink-0 ${
                    activeIdx === i ? 'text-brand-red' : 'text-brand-dark/25 group-hover:text-brand-dark/50'
                  }`}>
                    {s.id}
                  </span>

                  {/* Label */}
                  <span className={`font-display font-bold flex-1 transition-colors ${
                    activeIdx === i ? 'text-white text-xl' : 'text-brand-dark/70 text-lg group-hover:text-brand-dark'
                  }`}>
                    {s.label}
                  </span>

                  {/* Risk pill */}
                  <span className={`text-[9px] font-mono tracking-widest px-2.5 py-1 rounded-full border shrink-0 transition-colors ${
                    activeIdx === i
                      ? s.ok
                        ? 'bg-green-500/20 text-green-400 border-green-500/20'
                        : s.risk === 'Critical'
                          ? 'bg-brand-red/20 text-brand-red border-brand-red/30'
                          : s.risk === 'High'
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/20'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
                      : 'bg-black/4 text-brand-dark/30 border-black/6'
                  }`}>
                    {s.risk}
                  </span>

                  {/* Arrow */}
                  <ArrowRight size={14} className={`shrink-0 transition-all ${
                    activeIdx === i ? 'text-brand-red translate-x-1' : 'text-brand-dark/15 group-hover:text-brand-dark/40'
                  }`} />
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. TIMELINE — white
             Inspired by: Nexora roadmap with circular nodes
             Horizontal phases, auto-cycling
         ══════════════════════════════════════════ */}
      <section id="how" className="w-full bg-white py-28 px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-20 text-center">
            <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-4 block">How We Work</span>
            <h2 className="font-display font-bold tracking-tighter text-brand-dark leading-[1.0]"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 5rem)' }}>
              We don't advise.<br />We operate.
            </h2>
          </div>

          {/* Timeline track */}
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-[2.15rem] left-[8%] right-[8%] h-px bg-black/8 hidden md:block" />
            {/* Active fill — use scaleX (GPU-accelerated) not width */}
            <motion.div
              className="absolute top-[2.15rem] left-[8%] h-px bg-brand-red hidden md:block origin-left"
              style={{ width: '84%' }}
              animate={{ scaleX: activeTimeline / (timelineSteps.length - 1) }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
              {timelineSteps.map((step, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                  onClick={() => setActiveTimeline(i)}
                  className="flex flex-col items-center md:items-start text-center md:text-left cursor-pointer group">
                  {/* Node */}
                  <div className={`w-[1.1rem] h-[1.1rem] rounded-full border-2 mb-5 flex items-center justify-center transition-all duration-400
                    ${activeTimeline >= i ? 'border-brand-red bg-brand-red' : 'border-black/15 bg-white'}`}>
                    {activeTimeline >= i && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-[9px] font-mono tracking-widest text-brand-dark/30 mb-1">{step.sub}</span>
                  <p className={`font-display font-bold text-2xl mb-2 transition-colors ${activeTimeline >= i ? 'text-brand-dark' : 'text-brand-dark/30'}`}>
                    {step.label}
                  </p>
                  <AnimatePresence mode="wait">
                    {activeTimeline === i && (
                      <motion.p
                        key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        className="text-xs text-brand-dark/50 font-light leading-relaxed">
                        {step.desc}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          8. PHOTO SPLIT — alternating bg
         ══════════════════════════════════════════ */}
      <section className="w-full bg-surface-offwhite/40 py-24 px-8 border-y border-black/5">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-6 items-stretch">
          {/* Photo */}
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden min-h-[380px]">
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1000&q=80" alt=""
              className="w-full h-full object-cover absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent" />
            <div className="absolute bottom-6 left-7">
              <span className="text-[9px] font-mono text-brand-red tracking-widest block mb-1">LOOPRETAIL — ACTIVE</span>
              <p className="text-white font-display font-semibold text-xl">Controlled marketplace.<br />Protected brand.</p>
            </div>
          </motion.div>

          {/* Dark text card */}
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="bg-brand-dark rounded-3xl p-10 flex flex-col justify-between min-h-[380px]">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-6 block">Same Sales. More Control.</span>
              <h3 className="font-display font-bold tracking-tighter text-white leading-[1.05] mb-5"
                style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>
                Many brands are already selling on marketplaces. The problem isn't sales — it's control.
              </h3>
              <p className="text-gray-400 font-light text-sm leading-relaxed">
                With Loop Retail, brands can make equal or more revenue through one accountable partner — instead of multiple unmanaged sellers quietly destroying the market.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {['Pricing', 'Listings', 'Stock', 'Sellers', 'Ads', 'Trust'].map((item, i) => (
                <div key={i}
                  className="flex items-center gap-2 border border-white/6 rounded-xl px-3 py-2.5 hover:border-brand-red/30 transition-colors">
                  <div className="w-1 h-1 rounded-full bg-brand-red shrink-0" />
                  <span className="text-white/50 text-xs font-light">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          9. CHANNELS — white
         ══════════════════════════════════════════ */}
      <section className="w-full bg-white py-20 px-8 border-b border-black/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-12">
            <h2 className="font-display font-bold tracking-tighter text-brand-dark leading-[1.0]"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.8rem)' }}>
              Amazon is the start.<br />Not the whole strategy.
            </h2>
            <p className="text-brand-dark/40 text-sm font-light max-w-xs leading-relaxed">
              We grow where your product can win — without ever losing pricing or brand control.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {['Amazon', 'eBay', 'TikTok Shop', 'OnBuy', 'Argos', 'B&Q Marketplace', 'Etsy', 'Wayfair', 'Zalando'].map((c, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 border border-black/8 rounded-full px-6 py-3 hover:border-brand-red/40 hover:bg-brand-red/4 transition-all cursor-default group">
                <span className="w-1.5 h-1.5 rounded-full bg-black/15 group-hover:bg-brand-red transition-colors" />
                <span className="text-sm font-medium text-brand-dark/65 group-hover:text-brand-red transition-colors">{c}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          10. CTA — white, centered, big type
         ══════════════════════════════════════════ */}
      <section id="audit" className="w-full bg-white py-36 px-8 relative overflow-hidden border-t border-black/5">
        {/* Orbital accent — light on white */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="720" cy="300" rx="640" ry="220" fill="none" stroke="rgba(230,25,43,0.06)" strokeWidth="1" strokeDasharray="6 14" />
          <ellipse cx="720" cy="300" rx="400" ry="140" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-brand-red/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="max-w-[1100px] mx-auto text-center relative z-10">
          <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-10 block">Ready?</span>
          <h2 className="font-display font-bold tracking-tighter text-brand-dark leading-[0.93]"
            style={{ fontSize: 'clamp(3.5rem, 9vw, 8.5rem)' }}>
            The UK marketplace<br />
            is too big to leave<br />
            <span className="text-brand-red">unmanaged.</span>
          </h2>
          <p className="text-brand-dark/45 font-light text-base mt-10 mb-12 max-w-md mx-auto leading-relaxed">
            Turn marketplace disorder into a controlled, profitable and scalable retail channel.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:hello@loopretail.io"
              className="flex items-center gap-2 bg-brand-red text-white px-10 py-4 rounded-full font-semibold text-sm hover:bg-[#c0001f] transition-colors group">
              Request a Marketplace Audit
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a href="/"
              className="text-sm font-mono text-brand-dark/30 hover:text-brand-dark/70 tracking-widest transition-colors uppercase">
              ← Back to home
            </a>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
