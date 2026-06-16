import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { ArrowRight, Globe, ShoppingCart, TrendingUp, Package, Truck, Check, X } from 'lucide-react';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';

/* ── Counter ── */
function Counter({ to, prefix = '', suffix = '', decimals = 0 }: { to: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let cur = 0; const step = to / 60;
    const t = setInterval(() => {
      cur += step;
      if (cur >= to) { setVal(to); clearInterval(t); } else setVal(cur);
    }, 16);
    return () => clearInterval(t);
  }, [inView, to]);
  const display = decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString();
  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

/* ── Hero visual: the UK operating layer (editorial image) ── */
const layerChips = ['UK Warehouse', 'Next-day dispatch', 'Local returns'];

function LocalLayerCard() {
  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)] aspect-[4/5]">
      {/* Image — desaturated, red/black duotone keeps it on-theme */}
      <img
        src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&q=80"
        alt="Loop Retail fulfilling UK orders from local stock"
        className="absolute inset-0 w-full h-full object-cover grayscale"
      />
      <div className="absolute inset-0 bg-brand-red/25 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-brand-dark/5" />
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5" />

      {/* Top tag */}
      <div className="absolute top-5 left-5 flex items-center gap-2 bg-black/35 backdrop-blur-md border border-white/15 rounded-full px-4 py-2">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
        <span className="text-[10px] font-mono tracking-widest text-white uppercase">UK Operating Layer</span>
      </div>

      {/* Bottom caption + chips */}
      <div className="absolute inset-x-0 bottom-0 p-7">
        <p className="font-display font-bold text-white leading-[1.05] mb-4"
          style={{ fontSize: 'clamp(1.5rem, 2.2vw, 2.1rem)' }}>
          Stock held in the UK.<br />Orders shipped locally.
        </p>
        <div className="flex flex-wrap gap-2">
          {layerChips.map((t) => (
            <span key={t}
              className="text-[10px] font-mono tracking-widest text-white/80 border border-white/20 bg-white/[0.06] backdrop-blur-sm rounded-full px-3 py-1.5">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Trust comparison data (Foreign site vs Loop Retail layer) ── */
const trustFactors = [
  { factor: 'Local UK pricing (GBP)',   loop: 'GBP, local number format'       },
  { factor: 'Fast UK delivery',         loop: 'Local stock, next-day dispatch' },
  { factor: 'Clear returns process',    loop: '14-day returns, handled locally'},
  { factor: 'UK contact route',         loop: 'Local customer support layer'   },
  { factor: 'Local stock holding',      loop: 'UK warehouse, pick & pack'      },
  { factor: 'Checkout confidence',      loop: 'Trust signals, secure, local'   },
];

/* ── Trust questions (sequential reveal) ── */
const trustQuestions = [
  'Is this brand real?',
  'Will my order arrive quickly?',
  'Can I return it easily?',
  'Is the product suitable for the UK?',
  'Can I trust the price, quality and delivery?',
];

function TrustReveal() {
  const [visible, setVisible] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || visible >= trustQuestions.length) return;
    const t = setTimeout(() => setVisible(v => v + 1), 550);
    return () => clearTimeout(t);
  }, [inView, visible]);

  return (
    <div ref={ref}>
      {trustQuestions.map((q, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={visible > i ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-5 py-5 border-b border-white/8 last:border-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={visible > i ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.28, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'transform' }}
            className="w-6 h-6 rounded-full bg-brand-red/15 border border-brand-red/30 flex items-center justify-center shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-red" />
          </motion.div>
          <span className={`font-display font-semibold transition-colors duration-400 ${visible > i ? 'text-white' : 'text-white/12'}`}
            style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}>
            {q}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Order journey ── */
const orderSteps = [
  { label: 'Order Placed',   time: 'Instant',   desc: 'Customer confirms on UK-localised site'     },
  { label: 'Picked & Packed', time: 'Same day',  desc: 'Fulfilled from UK stock holding'            },
  { label: 'Dispatched',     time: '< 24h',      desc: 'Shipped via local carrier network'          },
  { label: 'In Transit',     time: '1–2 days',   desc: 'UK standard delivery timeline'              },
  { label: 'Delivered',      time: 'UK-speed',   desc: 'Review captured, feedback fed back to brand'},
];

/* ── Services ── */
const services = [
  { num: '1', title: 'Website Setup or Localisation', body: 'UK-facing pages, GBP pricing, local product content, compliance copy and checkout configuration.' },
  { num: '2', title: 'Stock Holding',                 body: 'We hold your inventory in the UK so every order ships the same day — no cross-border delays.' },
  { num: '3', title: 'Pick, Pack & Dispatch',         body: 'Orders fulfilled from UK stock. Faster delivery, better experience, cleaner reviews.' },
  { num: '4', title: 'Returns Management',            body: 'Compliant UK distance-selling returns handled locally. 14-day cancellation rights managed properly.' },
  { num: '5', title: 'Customer Experience Layer',     body: "Local support so customers feel they're buying from a UK brand, not an overseas website." },
  { num: '6', title: 'Market Feedback Loop',          body: "Real data on what sells, what doesn't, how packaging performs — evidence for retail buyers." },
];

/* ── DTC-as-proof: what direct orders reveal (grouped) ── */
const proofReveals = [
  { tag: 'Demand',     items: ['Which products sell', 'What price actually works'] },
  { tag: 'Operations', items: ['How packaging performs', 'How often returns happen'] },
  { tag: 'Market Fit', items: ['What customers complain about', 'Whether real UK demand exists'] },
];

/* ── The result — what it gives retail buyers ── */
const proofOutcomes = [
  { n: '1', title: 'Proof of real demand',   body: 'Actual UK orders — not forecasts or assumptions.' },
  { n: '2', title: 'Confidence for buyers',  body: 'Evidence that removes the risk retail buyers fear.' },
  { n: '3', title: 'A stronger position',    body: 'Enter retail talks with data, not hope.' },
];

export default function DTCGrowth() {
  const [activeStep, setActiveStep] = useState(0);
  const [activeService, setActiveService] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(i => (i + 1) % orderSteps.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full min-h-screen bg-white font-sans overflow-x-hidden">
      <NavBar darkHero={true} />

      {/* ══════════════════════════════════════════
          1. HERO — dark, headline + dashboard card
         ══════════════════════════════════════════ */}
      <section className="relative w-full min-h-screen bg-brand-dark flex flex-col overflow-hidden px-8 pt-20 pb-8">
        {/* Base radial depth — subtle lift in the centre */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(125% 125% at 50% 0%, #171717 0%, #0b0b0b 45%, #050505 100%)' }} />

        {/* Dot grid that dissolves toward the edges */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 75% 65% at 42% 38%, #000 0%, transparent 72%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 42% 38%, #000 0%, transparent 72%)',
          }} />

        {/* Soft red ambient glow behind the headline */}
        <div className="absolute -bottom-48 -left-48 w-[950px] h-[750px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(230,25,43,0.20) 0%, transparent 60%)', filter: 'blur(50px)' }} />

        {/* Vignette frame */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)' }} />

        {/* Hairline top accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col relative z-10">

          {/* Top rule — index + breadcrumb */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex items-center justify-between py-5 border-b border-white/8">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] tracking-widest text-brand-red">04 / 04</span>
              <span className="w-px h-3 bg-white/15" />
              <span className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-white/55 uppercase">
                <Globe size={12} className="text-brand-red" strokeWidth={2} /> DTC Growth
              </span>
            </div>
            <span className="hidden md:block font-mono text-[11px] tracking-widest text-white/25 uppercase">UK Market Entry</span>
            <span className="font-mono text-[11px] tracking-widest text-white/40 uppercase">Loop Retail</span>
          </motion.div>

          {/* Main */}
          <div className="flex-1 grid md:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center py-14">
            {/* Left */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="font-display tracking-tight text-white leading-[1.04]"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}>
                <span className="font-light text-white/55">Launch in the UK</span><br />
                <span className="font-bold">without a local office.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.7 }}
                className="mt-7 text-gray-400 font-light text-base md:text-lg max-w-md leading-relaxed">
                DTC is the cleanest way to enter the UK without a full local setup. Loop Retail becomes your operating layer on the ground.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-10 flex items-center gap-7">
                <a href="#how"
                  className="flex items-center gap-2 bg-white text-brand-dark px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-brand-red hover:text-white transition-colors group">
                  See how it works <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
                <a href="#proof" className="font-mono text-[11px] tracking-widest text-white/40 hover:text-white transition-colors uppercase">
                  DTC as proof ↓
                </a>
              </motion.div>
            </div>

            {/* Right: editorial image */}
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}>
              <LocalLayerCard />
            </motion.div>
          </div>

          {/* Bottom rule — metadata facts */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 border-t border-white/8 divide-x divide-white/8">
            {[
              { k: 'Setup',    v: 'No UK office'    },
              { k: 'Stock',    v: 'Held locally'    },
              { k: 'Dispatch', v: 'Next-day UK'     },
              { k: 'Returns',  v: '14-day, handled' },
            ].map((f, i) => (
              <div key={i} className="px-5 md:px-6 py-5 first:pl-0">
                <p className="font-mono text-[9px] tracking-widest text-white/35 uppercase mb-1.5">{f.k}</p>
                <p className="font-display font-semibold text-white text-sm">{f.v}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. IMPACT IN NUMBERS — dark, stats descending
             into a red curved horizon
             Inspired by: "Our Impact in Numbers" (Tradebox)
         ══════════════════════════════════════════ */}
      <section className="w-full bg-brand-dark relative overflow-hidden pt-24 pb-0">
        {/* Red curved horizon glow at the bottom */}
        <div className="absolute -bottom-[280px] left-1/2 -translate-x-1/2 w-[1500px] h-[560px] rounded-[50%] bg-gradient-to-t from-brand-red via-brand-red/60 to-transparent blur-[40px] pointer-events-none" />
        <div className="absolute -bottom-[260px] left-1/2 -translate-x-1/2 w-[1300px] h-[520px] rounded-[50%] border-t border-white/10 pointer-events-none" />

        <div className="max-w-[1400px] mx-auto relative z-10 px-8">
          <div className="flex items-center gap-3 mb-16">
            <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase">The UK Customer Is Already Buying Online</span>
            <span className="flex-1 h-px bg-white/8" />
          </div>

          {/* Stats with descending connector lines */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {[
              { val: 28.3, suf: '%', caption: 'of UK retail sales were online — December 2025',   decimals: 1, Icon: ShoppingCart },
              { val: 11.1, suf: '%', caption: 'YoY growth in online sales value — December 2025', decimals: 1, Icon: TrendingUp },
              { val: 4.2,  suf: 'B', caption: 'UK parcel items delivered in 2024–25',              decimals: 1, Icon: Package },
              { val: 7.1,  suf: '%', caption: 'YoY growth in UK parcel volumes',                   decimals: 1, Icon: Truck },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-11 h-11 rounded-full border border-white/12 flex items-center justify-center mb-5">
                  <s.Icon size={16} className="text-brand-red" strokeWidth={1.75} />
                </div>
                {/* Number */}
                <p className="font-display font-bold tracking-tighter text-white mb-2"
                  style={{ fontSize: 'clamp(2.4rem, 4vw, 3.6rem)' }}>
                  <Counter to={s.val} suffix={s.suf} decimals={s.decimals} />
                </p>
                <p className="text-white/50 text-xs font-light leading-relaxed max-w-[170px] mb-6">{s.caption}</p>
                {/* Descending connector line into the horizon */}
                <motion.div
                  initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
                  className="w-px h-20 bg-gradient-to-b from-white/20 to-transparent origin-top"
                  style={{ willChange: 'transform' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-brand-red shadow-[0_0_12px_rgba(230,25,43,0.8)]" />
              </motion.div>
            ))}
          </div>

          {/* Bottom headline sitting over the horizon */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="text-center pt-16 pb-28">
            <h2 className="font-display font-bold tracking-tighter text-white leading-[1.0] mx-auto max-w-3xl"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 4rem)' }}>
              The UK is already an<br />online-first market.
            </h2>
            <p className="mt-6 text-white/70 font-light text-sm max-w-md mx-auto leading-relaxed">
              The real question isn't whether UK customers will buy online.
              It's whether your brand feels <span className="text-white font-medium">local enough to trust.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. THE GAP — white, comparison table
             Inspired by: "Competitive Landscape" (Stream)
         ══════════════════════════════════════════ */}
      <section className="w-full bg-white py-28 px-8 border-b border-black/5">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-5 block">The Trust Gap</span>
              <h2 className="font-display font-bold tracking-tighter text-brand-dark leading-[0.95]"
                style={{ fontSize: 'clamp(2.2rem, 4.5vw, 4.2rem)' }}>
                A foreign website can<br />feel distant very quickly.
              </h2>
            </div>
            <p className="text-brand-dark/45 font-light text-sm leading-relaxed border-l-2 border-brand-red/30 pl-5 max-w-xs">
              Small trust gaps reduce conversion. Loop Retail closes every one of them.
            </p>
          </div>

          {/* Comparison table */}
          <div className="border border-black/8 rounded-3xl overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[1.4fr_1fr_1.6fr] items-stretch bg-surface-offwhite/60 border-b border-black/8">
              <div className="px-7 py-5" />
              <div className="px-4 py-5 flex items-center justify-center border-l border-black/6">
                <span className="text-[10px] md:text-xs font-mono tracking-widest text-brand-dark/40 uppercase text-center">Foreign Website</span>
              </div>
              <div className="px-4 py-4 flex items-center justify-center border-l border-black/6">
                <span className="flex items-center gap-2 bg-brand-dark text-white rounded-full px-4 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                  <span className="text-[10px] md:text-xs font-mono tracking-widest uppercase">Loop Retail UK Layer</span>
                </span>
              </div>
            </div>

            {/* Rows */}
            {trustFactors.map((row, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="grid grid-cols-[1.4fr_1fr_1.6fr] items-stretch border-b border-black/5 last:border-0 group">
                {/* Factor label */}
                <div className="px-7 py-5 flex items-center">
                  <span className="text-sm font-medium text-brand-dark/75">{row.factor}</span>
                </div>
                {/* Foreign — cross */}
                <div className="px-4 py-5 flex items-center justify-center border-l border-black/6">
                  <div className="w-7 h-7 rounded-full bg-black/4 flex items-center justify-center">
                    <X size={13} className="text-brand-dark/25" strokeWidth={2.5} />
                  </div>
                </div>
                {/* Loop — check + detail (highlighted column) */}
                <div className="px-5 py-5 flex items-center gap-3 border-l border-black/6 bg-brand-red/[0.03] group-hover:bg-brand-red/[0.06] transition-colors">
                  <div className="w-7 h-7 rounded-full bg-brand-red flex items-center justify-center shrink-0 shadow-[0_4px_12px_-2px_rgba(230,25,43,0.4)]">
                    <Check size={13} className="text-white" strokeWidth={3} />
                  </div>
                  <span className="text-sm font-medium text-brand-dark">{row.loop}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="mt-5 text-center text-xs font-light text-brand-dark/40">
            The brand stays yours. <span className="text-brand-dark/70 font-medium">The UK operation becomes local.</span>
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. TRUST — dark, sequential question reveal
         ══════════════════════════════════════════ */}
      <section className="w-full bg-brand-dark py-28 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-brand-red/5 blur-[150px] pointer-events-none" />
        <div className="max-w-[1400px] mx-auto relative z-10 grid md:grid-cols-[1fr_1.3fr] gap-16 items-center">

          <div>
            <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-5 block">Customer Confidence</span>
            <h2 className="font-display font-bold tracking-tighter text-white leading-[1.0]"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)' }}>
              UK customers don't just want a nice website.
              <br /><span className="text-brand-red/60 font-light">They want confidence.</span>
            </h2>
            <p className="mt-6 text-gray-500 font-light text-sm leading-relaxed max-w-xs">
              A good DTC site answers five questions before the customer even asks them.
            </p>
          </div>

          <TrustReveal />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. ORDER JOURNEY — white, animated flow
         ══════════════════════════════════════════ */}
      <section className="w-full bg-white py-28 px-8 border-b border-black/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-16 text-center">
            <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-4 block">Fulfilment, Returns & Trust</span>
            <h2 className="font-display font-bold tracking-tighter text-brand-dark leading-[1.0]"
              style={{ fontSize: 'clamp(2.2rem, 4.5vw, 4.5rem)' }}>
              DTC is not a website project.<br />It is an operations project.
            </h2>
          </div>

          {/* Journey track — scaleX not width */}
          <div className="relative mb-8">
            <div className="absolute top-[1.35rem] left-[8%] right-[8%] h-px bg-black/8 hidden md:block" />
            <motion.div
              className="absolute top-[1.35rem] left-[8%] h-px bg-brand-red hidden md:block origin-left"
              style={{ width: '84%', willChange: 'transform' }}
              animate={{ scaleX: activeStep / (orderSteps.length - 1) }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 relative z-10">
              {orderSteps.map((step, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveStep(i)}
                  className="flex flex-col items-center text-center cursor-pointer group">
                  <div className={`w-[1.1rem] h-[1.1rem] rounded-full border-2 mb-4 transition-all duration-300
                    ${activeStep >= i ? 'border-brand-red bg-brand-red' : 'border-black/15 bg-white'}`} />
                  <span className="text-[9px] font-mono tracking-widest text-brand-dark/30 mb-1">{step.time}</span>
                  <p className={`font-display font-bold text-base mb-2 transition-colors ${activeStep >= i ? 'text-brand-dark' : 'text-brand-dark/25'}`}>
                    {step.label}
                  </p>
                  {/* Always in DOM — opacity swap avoids layout shift */}
                  <p className={`text-xs font-light leading-relaxed transition-colors duration-300 ${activeStep === i ? 'text-brand-dark/55' : 'text-transparent select-none'}`}>
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 14-day compliance callout */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="mt-6 bg-surface-offwhite border border-black/6 rounded-2xl px-8 py-5 flex items-start gap-4">
            <div className="w-0.5 self-stretch bg-brand-red rounded-full shrink-0" />
            <div>
              <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase block mb-1">UK Distance Selling Rules</span>
              <p className="text-brand-dark/55 text-sm font-light leading-relaxed">
                UK customers must be told they can cancel an online order up to 14 days after delivery. If not explained properly, cancellation rights can extend further. Local fulfilment means this is always handled correctly.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. HOW WE HELP — dark, numbered rows
             Same pattern as RetailExpansion
         ══════════════════════════════════════════ */}
      <section id="how" className="w-full bg-brand-dark py-24 px-8 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-brand-red/5 blur-[140px] pointer-events-none" />
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="grid md:grid-cols-[1fr_2fr] gap-16 items-start">

            <div className="md:sticky md:top-24">
              <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-5 block">How Loop Retail Helps</span>
              <h2 className="font-display font-bold tracking-tighter text-white leading-[1.0]"
                style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)' }}>
                We run the UK DTC channel.<br />
                <span className="text-brand-red/60 font-light">You own the brand.</span>
              </h2>
              <div className="mt-8 rounded-2xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80"
                  alt="UK warehouse fulfilment" className="w-full h-40 object-cover opacity-45" />
              </div>
            </div>

            <div className="border-t border-white/6">
              {services.map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveService(activeService === i ? null : i)}
                  className="group border-b border-white/6 cursor-pointer hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start gap-6 px-6 py-6">
                    <span className={`font-display font-black tracking-tighter leading-none select-none shrink-0 transition-colors duration-300 ${activeService === i ? 'text-brand-red/50' : 'text-white/6 group-hover:text-white/12'}`}
                      style={{ fontSize: '4.5rem', lineHeight: 0.85 }}>
                      {s.num}
                    </span>
                    <div className="flex-1 pt-1">
                      <h3 className={`font-display font-bold text-xl transition-colors ${activeService === i ? 'text-white' : 'text-white/55 group-hover:text-white/80'}`}>
                        {s.title}
                      </h3>
                      <AnimatePresence>
                        {activeService === i && (
                          <motion.p key="body"
                            initial={{ opacity: 0, y: 6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="text-gray-400 text-sm font-light leading-relaxed mt-2 overflow-hidden">
                            {s.body}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <span className={`font-mono text-xs tracking-widest shrink-0 mt-1 transition-colors ${activeService === i ? 'text-brand-red' : 'text-white/15'}`}>
                      {activeService === i ? '—' : '+'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. DTC AS PROOF — red, dark cards + RESULT divider
             Inspired by: "Result / numbered cards" (POSI)
         ══════════════════════════════════════════ */}
      <section id="proof" className="w-full bg-brand-red py-24 px-8 relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08]" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="1200" cy="60" rx="500" ry="400" fill="none" stroke="white" strokeWidth="0.5" />
          <ellipse cx="1200" cy="60" rx="340" ry="280" fill="none" stroke="white" strokeWidth="0.5" />
        </svg>

        <div className="max-w-[1400px] mx-auto relative z-10">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mb-12">
            <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase mb-6 block">From First UK Order to Retail-Ready Proof</span>
            <h2 className="font-display font-bold tracking-tighter text-white leading-[1.0]"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 4.6rem)' }}>
              DTC is not only a sales channel.
              <br /><span className="text-white/45 font-light">It is the first serious UK market test.</span>
            </h2>
          </motion.div>

          {/* Top row: 3 dark cards — what DTC reveals */}
          <div className="grid md:grid-cols-3 gap-4">
            {proofReveals.map((card, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-brand-dark border border-white/8 rounded-2xl p-7">
                <span className="inline-block text-[9px] font-mono tracking-widest text-brand-red uppercase border border-brand-red/30 rounded-full px-3 py-1 mb-6">
                  {card.tag}
                </span>
                <div className="space-y-3">
                  {card.items.map((it, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0 mt-1.5" />
                      <span className="text-white/70 text-sm font-light leading-relaxed">{it}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* RESULT divider */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="flex items-center gap-5 my-8">
            <span className="flex items-center gap-2 bg-brand-dark text-white rounded-lg px-4 py-2 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
              <span className="text-[10px] font-mono tracking-widest uppercase">Result</span>
            </span>
            <span className="text-white font-display font-semibold text-base md:text-lg shrink-0">
              Loop Retail turns direct orders into retail-ready evidence.
            </span>
            <span className="flex-1 h-px bg-white/20 hidden md:block" />
          </motion.div>

          {/* Bottom row: 3 numbered outcome cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {proofOutcomes.map((card, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-brand-dark border border-white/8 rounded-2xl p-7 flex items-start gap-4">
                <span className="w-9 h-9 rounded-lg bg-brand-red flex items-center justify-center shrink-0 font-display font-bold text-white text-lg shadow-[0_4px_14px_-2px_rgba(0,0,0,0.4)]">
                  {card.n}
                </span>
                <div>
                  <h3 className="font-display font-bold text-white text-lg mb-1.5">{card.title}</h3>
                  <p className="text-white/55 text-sm font-light leading-relaxed">{card.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          8. CTA — white
         ══════════════════════════════════════════ */}
      <section className="w-full bg-white py-36 px-8 relative overflow-hidden border-t border-black/5">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="720" cy="300" rx="640" ry="200" fill="none" stroke="rgba(230,25,43,0.05)" strokeWidth="1" strokeDasharray="6 14" />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-red/4 blur-[100px] rounded-full pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="max-w-[1000px] mx-auto text-center relative z-10">
          <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-10 block">Enter the UK. Start Selling.</span>
          <h2 className="font-display font-bold tracking-tighter text-brand-dark leading-[0.93]"
            style={{ fontSize: 'clamp(3rem, 8vw, 7.5rem)' }}>
            The brand stays yours.<br />
            The UK operation<br />becomes <span className="text-brand-red">local.</span>
          </h2>
          <p className="text-brand-dark/40 font-light text-base mt-10 mb-12 max-w-md mx-auto leading-relaxed">
            No UK office. No internal warehouse team. No slow cross-border deliveries. Just Loop Retail running your local layer from day one.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:hello@loopretail.io"
              className="flex items-center gap-2 bg-brand-red text-white px-10 py-4 rounded-full font-semibold text-sm hover:bg-[#c0001f] transition-colors group">
              Start Your UK DTC Launch
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a href="/" className="text-sm font-mono text-brand-dark/30 hover:text-brand-dark/60 tracking-widest transition-colors uppercase">
              ← Back to home
            </a>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
