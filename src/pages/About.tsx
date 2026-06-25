import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';

const meta = [
  { k: 'Founded', v: '2018' },
  { k: 'Based', v: 'United Kingdom' },
  { k: 'Focus', v: 'Controlled growth' },
];

const beliefs = [
  { k: 'Control', d: 'Over price, listings, sellers and stock.' },
  { k: 'Margins', d: 'Profit, not just revenue.' },
  { k: 'Clean channels', d: 'One coherent presence.' },
  { k: 'Trust', d: 'The same brand everywhere.' },
];

const services = [
  { n: '01', title: 'Marketplace Control', body: 'Own pricing, listings, sellers and stock across every marketplace.', href: '/marketplace-control' },
  { n: '02', title: 'Brand Protection', body: 'Catch unauthorised sellers, grey-market and counterfeits before they cost trust.', href: '/brand-protection' },
  { n: '03', title: 'Retail Expansion', body: 'Find where a brand wins in UK retail — and get it buyer-ready.', href: '/retail-expansion' },
  { n: '04', title: 'DTC Operations', body: 'A local UK direct channel: site, stock, fulfilment and returns.', href: '/dtc-growth' },
  { n: '05', title: 'Fulfilment & Operations', body: 'Stock, pick, pack, dispatch and returns — handled.', href: null },
];

const steps = [
  { k: 'Start clean', d: 'Audit, structure, fix the basics.' },
  { k: 'Learn fast', d: 'Test on the right channel first.' },
  { k: 'Protect the brand', d: 'Pricing, sellers, listings, trust.' },
  { k: 'Scale what works', d: 'Grow on data, not guesses.' },
];

const DOT_GRID =
  'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)';

export default function About() {
  return (
    <div className="w-full min-h-screen bg-white font-sans overflow-x-hidden">
      <NavBar darkHero={true} />

      {/* ───────────── HERO ───────────── */}
      <section className="relative w-full bg-brand-dark overflow-hidden px-8 pt-36 pb-20">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(120% 120% at 50% -10%, #18181a 0%, #0b0b0c 55%, #050506 100%)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-70"
          style={{ backgroundImage: DOT_GRID, backgroundSize: '30px 30px', maskImage: 'radial-gradient(ellipse 70% 60% at 30% 20%, #000, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 30% 20%, #000, transparent 75%)' }} />
        <div className="absolute -bottom-56 -left-44 w-[820px] h-[640px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(230,25,43,0.22) 0%, transparent 60%)', filter: 'blur(50px)' }} />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-12">
            <span className="font-mono text-[11px] tracking-widest text-brand-red uppercase">About · Loop Retail</span>
            <span className="font-mono text-[11px] tracking-widest text-white/30 uppercase">Est. 2018 — UK</span>
          </div>

          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display tracking-tight text-white leading-[1.04] max-w-3xl"
            style={{ fontSize: 'clamp(2.4rem, 5.2vw, 4.6rem)' }}>
            <span className="font-light text-white/50">An end-to-end</span><br />retail operating partner.
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.7 }}
            className="mt-7 text-white/55 font-light text-lg max-w-xl leading-relaxed">
            We connect marketplaces, brand protection, fulfilment, DTC and retail expansion into one system — so brands grow without losing control.
          </motion.p>

          {/* meta row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-14 grid grid-cols-3 max-w-2xl border-t border-white/10 divide-x divide-white/10">
            {meta.map((m) => (
              <div key={m.k} className="py-5 px-5 first:pl-0">
                <p className="font-mono text-[9px] tracking-widest text-white/35 uppercase mb-1.5">{m.k}</p>
                <p className="font-display font-semibold text-white text-sm md:text-base">{m.v}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────── BELIEF ───────────── */}
      <section className="relative w-full bg-[#f6f5f1] py-28 px-8 border-b border-black/5">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-2xl mb-14">
            <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-5 block">What we believe</span>
            <h2 className="font-display font-bold tracking-tight text-brand-dark leading-[1.05]"
              style={{ fontSize: 'clamp(1.9rem, 3.6vw, 3rem)' }}>
              Brands don't just want sales.<br /><span className="text-brand-dark/40">They want control.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {beliefs.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className={`group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${
                  i === 0
                    ? 'bg-gradient-to-b from-[#ff2d40] to-brand-red text-white shadow-[0_24px_50px_-22px_rgba(230,25,43,0.55)]'
                    : 'bg-gradient-to-b from-white to-[#efeee9] border border-black/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_22px_44px_-30px_rgba(0,0,0,0.3)]'
                }`}>
                <span className={`font-mono text-[10px] tracking-widest ${i === 0 ? 'text-white/55' : 'text-brand-dark/25'}`}>0{i + 1}</span>
                <h3 className={`font-display font-bold text-lg mt-8 mb-1.5 ${i === 0 ? 'text-white' : 'text-brand-dark'}`}>{b.k}</h3>
                <p className={`text-sm font-light leading-relaxed ${i === 0 ? 'text-white/80' : 'text-brand-dark/50'}`}>{b.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── WHAT WE DO ───────────── */}
      <section className="w-full bg-white py-28 px-8 border-b border-black/5">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-5 block">What we do</span>
              <h2 className="font-display font-bold tracking-tight text-brand-dark leading-[1.05]"
                style={{ fontSize: 'clamp(1.9rem, 3.6vw, 3rem)' }}>
                One connected operating model.
              </h2>
            </div>
            <p className="text-brand-dark/45 font-light text-sm max-w-xs leading-relaxed">
              Five capabilities, run as one system — not five disconnected services.
            </p>
          </div>

          <div className="border-t border-black/10">
            {services.map((s, i) => {
              const inner = (
                <div className="group grid grid-cols-[auto_1fr_auto] gap-5 md:gap-8 items-center py-6 border-b border-black/10 transition-colors hover:bg-[#f6f5f1]/70 -mx-4 px-4">
                  <span className="font-display font-black text-2xl md:text-3xl leading-none text-brand-red/15 group-hover:text-brand-red transition-colors w-10">{s.n}</span>
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-brand-dark text-lg md:text-xl group-hover:text-brand-red transition-colors">{s.title}</h3>
                    <p className="text-brand-dark/50 font-light text-sm leading-relaxed mt-0.5 max-w-xl">{s.body}</p>
                  </div>
                  {s.href
                    ? <ArrowUpRight size={18} className="text-brand-dark/20 group-hover:text-brand-red group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                    : <span className="font-mono text-[9px] tracking-widest text-brand-dark/25 uppercase shrink-0 hidden md:block">In-house</span>}
                </div>
              );
              return s.href ? <Link key={i} to={s.href} className="block">{inner}</Link> : <div key={i}>{inner}</div>;
            })}
          </div>
        </div>
      </section>

      {/* ───────────── APPROACH ───────────── */}
      <section className="relative w-full bg-brand-dark py-28 px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(110% 110% at 80% 0%, #161618 0%, #0a0a0b 60%, #050506 100%)' }} />
        <div className="absolute -bottom-40 right-0 w-[600px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(230,25,43,0.16) 0%, transparent 60%)', filter: 'blur(60px)' }} />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="max-w-2xl mb-14">
            <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-5 block">How we work</span>
            <h2 className="font-display font-bold tracking-tight text-white leading-[1.05]"
              style={{ fontSize: 'clamp(1.9rem, 3.6vw, 3rem)' }}>
              Controlled growth, in four moves.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-6 bg-white/[0.04] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
                <span className="font-mono text-[9px] tracking-widest text-brand-red uppercase">Step 0{i + 1}</span>
                <h3 className="font-display font-bold text-white text-lg mt-7 mb-1.5">{s.k}</h3>
                <p className="text-white/45 text-sm font-light leading-relaxed">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── MISSION ───────────── */}
      <section className="relative w-full bg-brand-red py-28 px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.12]"
          style={{ background: 'radial-gradient(120% 120% at 50% 120%, rgba(0,0,0,0.6), transparent 60%)' }} />
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="720" cy="160" rx="680" ry="130" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="3 12" />
          <ellipse cx="720" cy="160" rx="420" ry="80" fill="none" stroke="white" strokeWidth="0.5" />
        </svg>
        <div className="max-w-[1000px] mx-auto relative z-10 text-center">
          <span className="text-[10px] font-mono tracking-widest text-white/60 uppercase mb-8 block">Our mission</span>
          <h2 className="font-display font-bold tracking-tight text-white leading-[1.0]"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)' }}>
            Not just growth.<br /><span className="text-white/55 font-light">Growth with control.</span>
          </h2>
          <p className="mt-10 font-mono text-[11px] tracking-widest text-white/65 uppercase">
            Built from retail · Driven by control
          </p>
        </div>
      </section>

      {/* ───────────── CTA ───────────── */}
      <section className="relative w-full bg-[#f6f5f1] py-32 px-8 text-center overflow-hidden border-t border-black/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-red/5 blur-[110px] rounded-full pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-[900px] mx-auto relative z-10">
          <h2 className="font-display font-bold tracking-tight text-brand-dark leading-[0.98]"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4.2rem)' }}>
            Grow the market.<br />Protect the brand.<br /><span className="text-brand-red">Control the channel.</span>
          </h2>
          <Link to="/contact"
            className="mt-11 inline-flex items-center gap-2 bg-brand-red text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-[#c0001f] transition-colors group shadow-[0_18px_40px_-18px_rgba(230,25,43,0.5)]">
            Talk to Loop Retail <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
