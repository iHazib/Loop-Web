import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { ArrowRight, MapPin, CheckCircle } from 'lucide-react';
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

/* ── Sector data ── */
const sectors = [
  {
    id: '01',
    name: 'Grocery & Convenience',
    score: 8,
    opp: '50,486 convenience stores · £48.8bn projected sales',
    chains: ['Tesco', 'Sainsbury\'s', 'Asda', 'Aldi', 'Lidl', 'Morrisons', 'Co-op', 'Waitrose'],
    colour: 'text-green-400',
  },
  {
    id: '02',
    name: 'Health, Beauty & Pharmacy',
    score: 7,
    opp: '49% of England pharmacies are independent (March 2025)',
    chains: ['Boots', 'Superdrug', 'Holland & Barrett', 'Sephora', 'Space NK', 'Well Pharmacy'],
    colour: 'text-green-400',
  },
  {
    id: '03',
    name: 'DIY, Hardware & Garden',
    score: 7,
    opp: 'UK DIY market £13bn+ · 5,909 hardware businesses (2024)',
    chains: ['B&Q', 'Screwfix', 'Wickes', 'Toolstation', 'Travis Perkins', 'Selco'],
    colour: 'text-green-400',
  },
  {
    id: '04',
    name: 'Pet, Garden Centre & Animal Care',
    score: 8,
    opp: '7,292 businesses · low concentration · strong indie route',
    chains: ['Pets at Home', 'Jollyes', 'Zooplus', 'Mole Valley', 'B&M', 'The Range'],
    colour: 'text-green-400',
  },
  {
    id: '05',
    name: 'Furniture, Homeware & Interiors',
    score: 6,
    opp: '9,136 businesses · moderate concentration (2025)',
    chains: ['IKEA', 'Dunelm', 'Next Home', 'John Lewis', 'Habitat', 'The Range'],
    colour: 'text-yellow-400',
  },
  {
    id: '06',
    name: 'Toys, Gifts, Books & Stationery',
    score: 6,
    opp: 'Strong testing route through independents & gifting specialists',
    chains: ['The Entertainer', 'Smyths', 'Waterstones', 'WHSmith', 'Hobbycraft', 'Card Factory'],
    colour: 'text-yellow-400',
  },
  {
    id: '07',
    name: 'Electronics & Appliances',
    score: 5,
    opp: 'UK tech market £25.4bn expected in 2025 (Insider Media)',
    chains: ['Currys', 'Argos', 'AO', 'Richer Sounds', 'Euronics', 'Hughes'],
    colour: 'text-orange-400',
  },
  {
    id: '08',
    name: 'Fashion, Footwear & Sports',
    score: 4,
    opp: 'UK clothing market £67.8bn in 2025 — chain and online heavy',
    chains: ['M&S', 'Next', 'Primark', 'Zara', 'H&M', 'JD Sports', 'TK Maxx'],
    colour: 'text-orange-400',
  },
];

const buyerChecklist = [
  'Will the product comply with UK rules?',
  'Is the packaging right for UK shelves?',
  'Is the price right for UK margins?',
  'Correct barcode, case size and carton format?',
  'Can stock be supplied reliably?',
  'Is there demand on marketplaces or independents?',
  'Can the product survive returns, reviews and retailer expectations?',
];

const services = [
  { num: '1', title: 'Market Entry Mapping', body: 'We identify the right route: chain retail, independents, pharmacy, garden centres, trade counters, marketplaces or wholesale.' },
  { num: '2', title: 'Retail Readiness Check', body: 'Packaging, pricing, barcodes, case quantities, product claims, labels, compliance, images and margin structure.' },
  { num: '3', title: 'Regulation Guidance', body: 'Labelling, product safety, UKCA/CE, cosmetics notification, food rules, importer obligations and category-specific requirements.' },
  { num: '4', title: 'Independent Retail Testing', body: 'Test through local retailers and specialist shops before approaching national chains — proof of concept first.' },
  { num: '5', title: 'Chain Buyer Preparation', body: 'Product story, commercial proposal, margin logic, proof of demand and buyer-ready presentation.' },
  { num: '6', title: 'Route to Market', body: 'Wholesale, distribution, marketplace-first, direct retail, independents or controlled operating partner model.' },
];

const regulations = [
  { label: 'Product Marking', detail: 'UKCA / CE requirements for goods placed on the Great Britain market' },
  { label: 'Food Labelling', detail: 'All prepacked food requires mandatory FSA-compliant label information' },
  { label: 'Cosmetics', detail: 'Every product needs a Responsible Person registered on UKCP notification service' },
  { label: 'General Safety', detail: 'Category-specific rules for toys, chemicals, electronics, pet products and more' },
];

export default function RetailExpansion() {
  const [activeSector, setActiveSector] = useState(0);
  const [activeService, setActiveService] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => setActiveSector(i => (i + 1) % sectors.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full min-h-screen bg-white font-sans overflow-x-hidden">
      <NavBar darkHero={true} />

      {/* ══════════════════════════════════════════
          1. HERO — dark, asymmetric
             Left: headline. Right: stats card grid
             Inspired by: highlights/pitch card grid
         ══════════════════════════════════════════ */}
      <section className="relative w-full min-h-screen bg-brand-dark flex flex-col overflow-hidden px-8 pt-20 pb-8">
        {/* Base radial depth — lifted toward the data side */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(125% 125% at 80% 0%, #171717 0%, #0b0b0b 45%, #050505 100%)' }} />
        {/* Dot grid dissolving toward the top-right */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 70% 70% at 74% 32%, #000 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 74% 32%, #000 0%, transparent 70%)',
          }} />
        {/* Red ambient glow top-right */}
        <div className="absolute -top-40 -right-40 w-[850px] h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(230,25,43,0.16) 0%, transparent 60%)', filter: 'blur(50px)' }} />
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)' }} />
        {/* Top hairline */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col relative z-10">

          {/* Top rule */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex items-center justify-between py-5 border-b border-white/8">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] tracking-widest text-brand-red">03 / 04</span>
              <span className="w-px h-3 bg-white/15" />
              <span className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-white/55 uppercase">
                <MapPin size={12} className="text-brand-red" strokeWidth={2} /> Retail Expansion
              </span>
            </div>
            <span className="hidden md:block font-mono text-[11px] tracking-widest text-white/25 uppercase">UK Market Entry</span>
            <span className="font-mono text-[11px] tracking-widest text-white/40 uppercase">Loop Retail</span>
          </motion.div>

          {/* Main */}
          <div className="flex-1 grid md:grid-cols-[1fr_1.05fr] gap-12 lg:gap-20 items-center py-14">
            {/* Left */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="font-display tracking-tight text-white leading-[1.04]"
                style={{ fontSize: 'clamp(2.4rem, 4.6vw, 4.6rem)' }}>
                <span className="font-light text-white/55">Enter the UK market</span><br />
                <span className="font-bold">without guessing it.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.7 }}
                className="mt-7 text-gray-400 font-light text-base md:text-lg max-w-md leading-relaxed">
                The UK is not a test market. It is one of the most structured, regulated and buyer-selective retail environments in the world.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-10 flex items-center gap-7">
                <a href="#map"
                  className="flex items-center gap-2 bg-white text-brand-dark px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-brand-red hover:text-white transition-colors group">
                  Explore sector map <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
                <a href="#how" className="font-mono text-[11px] tracking-widest text-white/40 hover:text-white transition-colors uppercase">
                  How we help ↓
                </a>
              </motion.div>
            </div>

            {/* Right: 2×2 stats grid — inspired by pitch deck highlights */}
            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.25 }}
              className="grid grid-cols-2 gap-3">
              {[
                { val: 517, pre: '£', suf: 'bn', label: 'UK retail sales value', sub: '2024 (House of Commons)' },
                { val: 2.6,  pre: '', suf: 'M',  label: 'Retail jobs in the UK', sub: 'Active workforce', decimals: 1 },
                { val: 304560, pre: '', suf: '', label: 'Retail businesses', sub: 'As of January 2025' },
                { val: 28.3, pre: '', suf: '%', label: 'Online share of sales', sub: 'Dec 2025 — most still in-store', decimals: 1 },
              ].map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                  className={`rounded-2xl p-6 border transition-all ${i === 0 ? 'bg-brand-red border-brand-red' : i === 3 ? 'bg-white/6 border-white/10' : 'bg-white/4 border-white/8'}`}>
                  <p className="font-display font-bold tracking-tighter text-white leading-none mb-3"
                    style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
                    <Counter to={s.val} prefix={s.pre} suffix={s.suf} decimals={s.decimals ?? 0} />
                  </p>
                  <p className={`text-sm font-medium mb-1 ${i === 0 ? 'text-white' : 'text-white/70'}`}>{s.label}</p>
                  <p className={`text-[10px] font-mono ${i === 0 ? 'text-white/60' : 'text-white/25'}`}>{s.sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Bottom rule — sector ticker */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}
            className="border-t border-white/8 py-5 flex items-center gap-4 overflow-hidden">
            <span className="font-mono text-[9px] tracking-widest text-brand-red uppercase shrink-0">8 Sectors Mapped</span>
            <span className="w-px h-3 bg-white/15 shrink-0" />
            <div className="flex items-center gap-4 font-mono text-[10px] tracking-widest text-white/35 uppercase whitespace-nowrap overflow-hidden">
              {['Grocery', 'Health & Beauty', 'DIY & Garden', 'Pet & Animal', 'Furniture', 'Toys & Gifts', 'Electronics', 'Fashion'].map((s, i) => (
                <span key={i} className="flex items-center gap-4">{s}{i < 7 && <span className="w-1 h-1 rounded-full bg-white/15" />}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. BUYER PROOF — white, left split + checklist
             Inspired by: numbered research rows (ref 3)
         ══════════════════════════════════════════ */}
      <section className="w-full bg-white py-28 px-8 border-b border-black/5">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-[1fr_1.3fr] gap-16 items-start">
          {/* Left */}
          <div className="md:sticky md:top-24">
            <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-5 block">UK Buyers</span>
            <h2 className="font-display font-bold tracking-tighter text-brand-dark leading-[0.95]"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 4.5rem)' }}>
              The UK has buyers.<br />Buyers need proof.
            </h2>
            <p className="mt-5 text-brand-dark/45 font-light text-sm leading-relaxed max-w-xs">
              Foreign brands often think UK expansion means sending samples to Tesco or Boots. That is not how it works.
            </p>
            <div className="mt-6 flex items-center gap-2 bg-surface-offwhite border border-black/6 rounded-full px-4 py-2 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
              <span className="text-[10px] font-mono tracking-widest text-brand-dark/50">Loop Retail gets you buyer-ready</span>
            </div>
          </div>

          {/* Right: numbered checklist rows — inspired by ref 3 large-number rows */}
          <div className="border border-black/6 rounded-3xl overflow-hidden">
            {buyerChecklist.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-start gap-6 px-7 py-5 border-b border-black/5 last:border-0 group hover:bg-surface-offwhite/60 transition-colors">
                {/* Large ghost number — inspired by ref 3 */}
                <span className="font-display font-black text-brand-red/15 group-hover:text-brand-red/25 transition-colors shrink-0 leading-none select-none"
                  style={{ fontSize: '3rem', lineHeight: 1 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex items-start gap-3 pt-2 flex-1">
                  <CheckCircle size={14} className="text-brand-red/40 group-hover:text-brand-red transition-colors shrink-0 mt-0.5" />
                  <p className="text-brand-dark/70 text-sm font-light leading-relaxed group-hover:text-brand-dark transition-colors">{item}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. SECTOR MAP — dark, interactive rows
             Each sector = full-width row with score
         ══════════════════════════════════════════ */}
      <section id="map" className="w-full bg-brand-dark py-24 px-8 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-brand-red/5 blur-[140px] pointer-events-none" />
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-4 block">UK Retail Sector Map</span>
              <h2 className="font-display font-bold tracking-tighter text-white leading-[1.0]"
                style={{ fontSize: 'clamp(2.2rem, 4.5vw, 4.5rem)' }}>
                Know the sector before<br />you pitch the buyer.
              </h2>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-mono tracking-widest text-white/30">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400/60" /> Score 7–8 · Strong indie route</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400/60" /> Score 5–6</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400/60" /> Score 4–5 · Chain-heavy</span>
            </div>
          </div>

          <div className="border-t border-white/6">
            {sectors.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                onClick={() => setActiveSector(i)}
                className={`relative group border-b border-white/6 cursor-pointer transition-all duration-300 ${activeSector === i ? 'bg-white/4' : 'hover:bg-white/[0.02]'}`}>
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 transition-colors duration-300 ${activeSector === i ? 'bg-brand-red' : 'bg-transparent'}`} />

                <div className="px-8 py-5 grid grid-cols-[auto_1fr_auto_auto] gap-6 items-center">
                  {/* Number */}
                  <span className={`font-mono text-xs tracking-widest w-7 transition-colors ${activeSector === i ? 'text-brand-red' : 'text-white/20'}`}>{s.id}</span>

                  {/* Sector name + detail */}
                  <div>
                    <p className={`font-display font-bold transition-colors ${activeSector === i ? 'text-white' : 'text-white/55 group-hover:text-white/80'}`}
                      style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}>
                      {s.name}
                    </p>
                    <AnimatePresence>
                      {activeSector === i && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }} className="overflow-hidden">
                          <p className="text-gray-500 text-xs font-light mt-1.5 leading-relaxed">{s.opp}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {s.chains.map(c => (
                              <span key={c} className="text-[9px] font-mono text-white/30 border border-white/8 px-2 py-0.5 rounded-full">{c}</span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Score bar */}
                  <div className="hidden md:flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, dot) => (
                        <div key={dot} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          dot < s.score
                            ? activeSector === i ? 'bg-brand-red' : 'bg-white/25'
                            : 'bg-white/6'
                        }`} />
                      ))}
                    </div>
                  </div>

                  {/* Score label */}
                  <span className={`font-display font-bold text-2xl tracking-tighter w-12 text-right transition-colors ${activeSector === i ? s.colour : 'text-white/20'}`}>
                    {s.score}/10
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="mt-4 text-[9px] font-mono text-white/20 pl-8">
            Independent Retail Score — Loop Retail proprietary measure of indie retailer viability as market entry route (1–10)
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. RED STATEMENT — full-bleed
             "We are proud…" style statement
         ══════════════════════════════════════════ */}
      <section className="w-full bg-brand-red py-24 px-8 relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="720" cy="150" rx="700" ry="120" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 12" />
          <ellipse cx="720" cy="150" rx="440" ry="75" fill="none" stroke="white" strokeWidth="0.5" />
        </svg>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-[1100px] mx-auto text-center relative z-10">
          <p className="font-display font-bold tracking-tighter text-white leading-[1.0]"
            style={{ fontSize: 'clamp(2.2rem, 5.5vw, 5.5rem)' }}>
            <span className="text-white/45 font-light">Chains bring scale.</span>{' '}
            Independents open the door.{' '}
            <span className="text-white/45 font-light">Test locally. Learn quickly.</span>{' '}
            Scale properly.
          </p>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          5. REGULATIONS — white, 4 cards + photo
         ══════════════════════════════════════════ */}
      <section className="w-full bg-white py-28 px-8 border-b border-black/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start mb-16">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-5 block">Local Compliance</span>
              <h2 className="font-display font-bold tracking-tighter text-brand-dark leading-[0.95]"
                style={{ fontSize: 'clamp(2.2rem, 4.5vw, 4.5rem)' }}>
                Regulations decide<br />whether the product<br />even enters the market.
              </h2>
            </div>
            <div className="flex flex-col justify-end gap-4">
              <p className="text-brand-dark/50 font-light text-sm leading-relaxed border-l-2 border-brand-red/30 pl-5">
                The UK has category-specific rules for product marking, labelling, food, cosmetics, electronics, toys, chemicals and more — and they differ from EU requirements.
              </p>
              {/* Photo */}
              <div className="relative rounded-2xl overflow-hidden h-36">
                <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"
                  alt="UK retail compliance" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/50 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className="text-[9px] font-mono text-white/60 tracking-widest">RETAIL READINESS</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 regulation cards — inspired by pitch deck grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {regulations.map((reg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className={`rounded-2xl p-7 border transition-all cursor-default group hover:shadow-[0_16px_40px_-10px_rgba(230,25,43,0.12)] ${i === 0 ? 'bg-brand-dark border-brand-dark' : 'bg-surface-offwhite border-black/6 hover:border-brand-red/20'}`}>
                <span className="font-display font-black text-4xl leading-none select-none mb-5 block"
                  style={{ color: i === 0 ? 'rgba(230,25,43,0.3)' : 'rgba(0,0,0,0.07)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className={`font-display font-bold text-lg mb-2 ${i === 0 ? 'text-white' : 'text-brand-dark'}`}>{reg.label}</h3>
                <p className={`text-xs font-light leading-relaxed ${i === 0 ? 'text-gray-400' : 'text-brand-dark/50'}`}>{reg.detail}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 bg-brand-dark rounded-2xl px-8 py-5 flex items-center justify-between gap-6">
            <p className="text-white font-display font-semibold text-lg">We help foreign brands become UK-retail ready. Not just sold. Not just listed. <span className="text-brand-red">Ready.</span></p>
            <a href="mailto:hello@loopretail.io"
              className="shrink-0 flex items-center gap-2 bg-brand-red text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-[#c0001f] transition-colors group">
              Get Started <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. HOW WE HELP — dark, large-number rows
             Directly inspired by ref 3 research layout
         ══════════════════════════════════════════ */}
      <section id="how" className="w-full bg-brand-dark py-24 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red/6 blur-[160px] pointer-events-none" />
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="grid md:grid-cols-[1fr_2fr] gap-16 items-start">

            {/* Left: sticky label */}
            <div className="md:sticky md:top-24">
              <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-5 block">How Loop Retail Helps</span>
              <h2 className="font-display font-bold tracking-tighter text-white leading-[1.0]"
                style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)' }}>
                Build a UK route to market.<br />
                <span className="text-brand-red/60 font-light">Not just a sales list.</span>
              </h2>
              {/* Stock image */}
              <div className="mt-8 rounded-2xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80"
                  alt="UK retail shelves" className="w-full h-40 object-cover opacity-60" />
              </div>
            </div>

            {/* Right: numbered rows — ref 3 style */}
            <div className="border-t border-white/6">
              {services.map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveService(activeService === i ? null : i)}
                  className="group border-b border-white/6 cursor-pointer hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start gap-6 px-6 py-6">
                    {/* Big ghost number — ref 3 inspired */}
                    <span className={`font-display font-black tracking-tighter leading-none select-none shrink-0 transition-colors duration-300 ${activeService === i ? 'text-brand-red/50' : 'text-white/6 group-hover:text-white/12'}`}
                      style={{ fontSize: '4.5rem', lineHeight: 0.85 }}>
                      {s.num}
                    </span>
                    <div className="flex-1 pt-1">
                      <h3 className={`font-display font-bold text-xl mb-0 transition-colors ${activeService === i ? 'text-white' : 'text-white/55 group-hover:text-white/80'}`}>
                        {s.title}
                      </h3>
                      <AnimatePresence>
                        {activeService === i && (
                          <motion.p initial={{ opacity: 0, y: 6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="text-gray-400 text-sm font-light leading-relaxed mt-2">
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
          7. PHOTO SPLIT — white
         ══════════════════════════════════════════ */}
      <section className="w-full bg-white py-24 px-8 border-b border-black/5">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-[1.2fr_1fr] gap-6 items-stretch">
          {/* Photo */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden min-h-[360px]">
            <img src="https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=900&q=80"
              alt="UK high street retail" className="w-full h-full object-cover absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent" />
            <div className="absolute bottom-6 left-7">
              <span className="text-[9px] font-mono text-brand-red tracking-widest block mb-1">UK RETAIL · LOOP RETAIL</span>
              <p className="text-white font-display font-semibold text-xl">From market map to<br />first purchase order.</p>
            </div>
          </motion.div>

          {/* Dark card */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="bg-brand-dark rounded-3xl p-10 flex flex-col justify-between min-h-[360px]">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-6 block">Test Locally. Scale Properly.</span>
              <h3 className="font-display font-bold tracking-tighter text-white leading-[1.05] mb-5"
                style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
                Start with independents. Build proof. Then approach the buyers who matter.
              </h3>
              <p className="text-gray-400 font-light text-sm leading-relaxed">
                National chains want evidence of UK demand before they take the risk. Independent retail gives you that evidence — and the real market knowledge to price and position correctly.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {['Independents first', 'Proof of demand', 'Chain-ready', 'Margin correct'].map((t, i) => (
                <span key={i} className="text-[9px] font-mono tracking-widest border border-white/8 text-white/40 px-3 py-1.5 rounded-full">{t}</span>
              ))}
            </div>
          </motion.div>
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
          <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-10 block">Ready to Enter the UK?</span>
          <h2 className="font-display font-bold tracking-tighter text-brand-dark leading-[0.93]"
            style={{ fontSize: 'clamp(3rem, 8vw, 7.5rem)' }}>
            A route to market.<br />
            Not a <span className="text-brand-red">guess.</span>
          </h2>
          <p className="text-brand-dark/40 font-light text-base mt-10 mb-12 max-w-md mx-auto leading-relaxed">
            We map the sector, check the compliance, test the market and build the buyer case — so your first step into UK retail is the right one.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:hello@loopretail.io"
              className="flex items-center gap-2 bg-brand-red text-white px-10 py-4 rounded-full font-semibold text-sm hover:bg-[#c0001f] transition-colors group">
              Start Your UK Market Entry
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
