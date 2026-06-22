import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';

const wants = [
  { k: 'Control', d: 'Over price, listings, sellers and stock.' },
  { k: 'Better margins', d: 'Growth that protects profit, not just revenue.' },
  { k: 'Cleaner channels', d: 'One coherent presence, not chaos.' },
  { k: 'Customer trust', d: 'The same brand wherever they buy.' },
];

const groundwork = ['Listing products', 'Packing orders', 'Managing stock', 'Speaking with suppliers', 'Handling customer problems', 'Learning marketplace rules', 'Fixing issues when things went wrong'];
const losingControl = ['One weak listing', 'One unauthorised seller', 'One price war', 'One poor delivery', 'One stock issue', 'One bad review'];

const systemEffects = [
  ['A listing', 'conversion'],
  ['Pricing', 'margin'],
  ['Stock', 'ranking'],
  ['Packaging', 'reviews'],
  ['Delivery', 'trust'],
  ['Seller control', 'brand value'],
];

const risks = ['Prices move without warning', 'Listings become inconsistent', 'Grey-market stock appears', 'Sellers compete against each other', 'Customers get mixed experiences', 'Retail buyers ask for proof', 'Foreign brands struggle to go local'];

const services = [
  { n: '01', title: 'Marketplace Control', body: 'Take control of pricing, listings, sellers, stock and visibility across marketplaces.', href: '/marketplace-control' },
  { n: '02', title: 'Brand Protection', body: 'Monitor unauthorised sellers, listing issues, pricing damage, grey-market and counterfeit signals before they damage trust.', href: '/brand-protection' },
  { n: '03', title: 'Retail Expansion', body: 'Help growing and foreign brands find where they can win in UK retail, prepare for buyers and build a route to market.', href: '/retail-expansion' },
  { n: '04', title: 'DTC Operations', body: 'Launch or localise a UK direct-to-consumer channel — website, local stock, fulfilment, returns and customer experience.', href: '/dtc-growth' },
  { n: '05', title: 'Fulfilment & Operations', body: 'The physical side of ecommerce — stock, packing, dispatch, returns and operational feedback.', href: null },
];

const ukList = ['Retail buyers expect proof', 'Customers expect fast delivery', 'Websites need to feel local', 'Product information must be clear', 'Returns must be simple', 'Category rules & compliance matter'];

const questions = ['Where does the product actually fit?', 'Which channel can it win on?', 'Is the pricing right?', 'Is the packaging ready?', 'Is the listing strong enough?', 'Is the stock plan reliable?', 'Are the sellers controlled?', 'Is the customer experience good enough?'];

const steps = ['Start clean', 'Learn fast', 'Protect the brand', 'Scale what works'];
const promiseItems = ['Product development', 'Supplier relationships', 'Customer trust', 'Reputation', 'Investment', 'Risk'];

export default function About() {
  return (
    <div className="w-full min-h-screen bg-white font-sans overflow-x-hidden">
      <NavBar darkHero={true} />

      {/* ── HERO ── */}
      <section className="relative w-full bg-brand-dark overflow-hidden px-8 pt-36 pb-24">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(125% 125% at 50% 0%, #171717 0%, #0b0b0b 50%, #050505 100%)' }} />
        <div className="absolute -bottom-48 -left-40 w-[900px] h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(230,25,43,0.18) 0%, transparent 60%)', filter: 'blur(60px)' }} />

        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-5">
            <span className="font-mono text-[11px] tracking-widest text-brand-red uppercase">About Loop Retail</span>
            <span className="flex-1" />
            <span className="hidden md:block font-mono text-[11px] tracking-widest text-white/30 uppercase">Est. 2018 · United Kingdom</span>
          </div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display tracking-tight text-white leading-[1.02] max-w-4xl"
            style={{ fontSize: 'clamp(2.4rem, 5.5vw, 5.2rem)' }}>
            <span className="font-light text-white/55">We help brands grow their market —</span><br />
            <span className="font-bold">without the chaos attached.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-8 text-gray-400 font-light text-lg max-w-2xl leading-relaxed">
            Loop Retail connects the full retail system around a brand — marketplace growth, brand protection, fulfilment, DTC and retail expansion — so growth comes with control, not disorder.
          </motion.p>
        </div>
      </section>

      {/* ── PURPOSE: more than sales ── */}
      <section className="w-full bg-white py-28 px-8 border-b border-black/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-[1fr_1.1fr] gap-16 items-end mb-16">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-5 block">Our Purpose</span>
              <h2 className="font-display font-bold tracking-tight text-brand-dark leading-[1.0]"
                style={{ fontSize: 'clamp(2.2rem, 4.5vw, 4rem)' }}>
                We work with brands that want more than sales.
              </h2>
            </div>
            <p className="text-brand-dark/55 font-light text-lg leading-relaxed">
              Our purpose is to help brands grow ecommerce market share while making the operation behind that growth cleaner, smarter and more cost-effective.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wants.map((w, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className={`rounded-2xl p-7 border ${i === 0 ? 'bg-brand-red border-brand-red text-white' : 'bg-surface-offwhite border-black/6'}`}>
                <span className={`font-mono text-[10px] tracking-widest ${i === 0 ? 'text-white/60' : 'text-brand-dark/30'}`}>0{i + 1}</span>
                <h3 className={`font-display font-bold text-xl mt-6 mb-2 ${i === 0 ? 'text-white' : 'text-brand-dark'}`}>{w.k}</h3>
                <p className={`text-sm font-light leading-relaxed ${i === 0 ? 'text-white/80' : 'text-brand-dark/50'}`}>{w.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ORIGIN: built from reality ── */}
      <section className="w-full bg-brand-dark py-28 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-brand-red/6 blur-[150px] pointer-events-none" />
        <div className="max-w-[1400px] mx-auto relative z-10">
          <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-6 block">Built From the Reality of Retail</span>
          <h2 className="font-display font-bold tracking-tight text-white leading-[1.05] max-w-3xl mb-6"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.6rem)' }}>
            <span className="text-white/50 font-light">Loop Retail started in 2018 with a simple belief:</span> good products should not lose online because the market around them is messy.
          </h2>
          <p className="text-gray-400 font-light text-base max-w-2xl leading-relaxed mb-16">
            We didn't start from theory. We started close to the ground — and that experience shaped how we think.
          </p>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            <div>
              <p className="text-[10px] font-mono tracking-widest text-white/40 uppercase mb-5 border-b border-white/10 pb-3">What we actually did</p>
              <div className="flex flex-wrap gap-2">
                {groundwork.map((g) => (
                  <span key={g} className="text-xs font-mono tracking-wide text-white/55 border border-white/10 rounded-full px-3.5 py-2">{g}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-5 border-b border-brand-red/20 pb-3">How control is lost</p>
              <div className="space-y-2.5">
                {losingControl.map((l) => (
                  <div key={l} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
                    <span className="text-white/70 text-sm font-light">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-14 font-display font-medium text-white text-xl md:text-2xl max-w-2xl leading-snug border-l-2 border-brand-red pl-6">
            From the outside, it can look like ecommerce growth. From the inside, it can be chaos.
          </p>
        </div>
      </section>

      {/* ── NOT JUST AN AGENCY: the system ── */}
      <section className="w-full bg-white py-28 px-8 border-b border-black/5">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-[1fr_1.2fr] gap-16 items-center">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-5 block">Not Just a Marketplace Agency</span>
            <h2 className="font-display font-bold tracking-tight text-brand-dark leading-[1.0] mb-6"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.6rem)' }}>
              Most agencies advise from the outside. We operate closer to the brand.
            </h2>
            <p className="text-brand-dark/55 font-light text-base leading-relaxed mb-4">
              Real retail doesn't work in separate boxes. We look at the whole system — because every part touches the next.
            </p>
            <p className="font-display font-semibold text-brand-dark text-lg">
              If one part breaks, the customer doesn't blame the channel. <span className="text-brand-red">They blame the brand.</span>
            </p>
          </div>

          <div className="border border-black/8 rounded-3xl overflow-hidden">
            {systemEffects.map(([a, b], i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 px-7 py-4 border-b border-black/5 last:border-0">
                <span className="font-display font-semibold text-brand-dark w-32 shrink-0">{a}</span>
                <span className="text-brand-red/40 font-mono text-xs">affects</span>
                <span className="font-display font-bold text-brand-red">{b}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RED STATEMENT: demand without control ── */}
      <section className="w-full bg-brand-red py-24 px-8 relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="720" cy="150" rx="700" ry="120" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 12" />
        </svg>
        <div className="max-w-[1400px] mx-auto relative z-10">
          <p className="font-display font-bold tracking-tight text-white leading-[1.05] max-w-3xl mb-12"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 4rem)' }}>
            Many brands already have demand.
            <span className="text-white/50 font-light"> But demand without control can become dangerous.</span>
          </p>
          <div className="flex flex-wrap gap-2.5">
            {risks.map((r) => (
              <span key={r} className="text-xs font-mono tracking-wide text-white/85 border border-white/25 bg-white/10 rounded-full px-4 py-2">{r}</span>
            ))}
          </div>
          <p className="mt-12 text-white/80 font-light text-base max-w-2xl leading-relaxed">
            Loop Retail brings structure to that environment — helping brands see where they are, where the risks sit, where the opportunities are, and how to build a cleaner route to market.
          </p>
        </div>
      </section>

      {/* ── WHAT WE DO ── */}
      <section className="w-full bg-white py-28 px-8 border-b border-black/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-14">
            <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-5 block">What We Do</span>
            <h2 className="font-display font-bold tracking-tight text-brand-dark leading-[1.0]"
              style={{ fontSize: 'clamp(2.2rem, 4.5vw, 4rem)' }}>
              Controlled, profitable, trusted<br />routes to market.
            </h2>
          </div>

          <div className="border-t border-black/10">
            {services.map((s, i) => {
              const Row = (
                <div className="group grid md:grid-cols-[auto_1fr_auto] gap-6 items-center px-2 py-7 border-b border-black/10 hover:bg-surface-offwhite/50 transition-colors">
                  <span className="font-display font-black text-brand-red/20 group-hover:text-brand-red/40 transition-colors text-4xl leading-none w-14">{s.n}</span>
                  <div>
                    <h3 className="font-display font-bold text-brand-dark text-xl md:text-2xl group-hover:text-brand-red transition-colors">{s.title}</h3>
                    <p className="text-brand-dark/55 font-light text-sm leading-relaxed mt-1 max-w-2xl">{s.body}</p>
                  </div>
                  {s.href && <ArrowRight size={18} className="text-brand-dark/20 group-hover:text-brand-red group-hover:translate-x-1 transition-all hidden md:block" />}
                </div>
              );
              return s.href ? <Link key={i} to={s.href}>{Row}</Link> : <div key={i}>{Row}</div>;
            })}
          </div>
        </div>
      </section>

      {/* ── FOREIGN BRANDS UK ── */}
      <section className="w-full bg-brand-dark py-28 px-8 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-brand-red/5 blur-[150px] pointer-events-none" />
        <div className="max-w-[1400px] mx-auto relative z-10 grid md:grid-cols-[1fr_1fr] gap-16 items-start">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-5 block">For Foreign Brands Entering the UK</span>
            <h2 className="font-display font-bold tracking-tight text-white leading-[1.05] mb-6"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}>
              A strong market — but a hard one to enter without local support.
            </h2>
            <p className="text-gray-400 font-light text-base leading-relaxed">
              Loop Retail helps foreign brands build a local UK operating layer — without immediately opening an office, hiring a team or renting a warehouse. Test, learn, fulfil, protect and scale.
            </p>
          </div>
          <div className="space-y-3 md:pt-12">
            {ukList.map((u, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 border-b border-white/8 pb-3">
                <Check size={14} className="text-brand-red shrink-0" strokeWidth={2.5} />
                <span className="text-white/75 text-sm font-light">{u}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APPROACH ── */}
      <section className="w-full bg-white py-28 px-8 border-b border-black/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-16 mb-14">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-5 block">Our Approach</span>
              <h2 className="font-display font-bold tracking-tight text-brand-dark leading-[1.0]"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.6rem)' }}>
                We believe in controlled growth.
              </h2>
              <p className="text-brand-dark/55 font-light text-base leading-relaxed mt-5">
                We don't chase every channel just because it exists. We ask better questions first — then build from there.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 self-center">
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-black/8">
                  <span className="font-mono text-[10px] text-brand-red/50 mt-1">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-brand-dark/70 text-sm font-light">{q}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {steps.map((s, i) => (
              <div key={i} className={`rounded-2xl p-6 border ${i === 3 ? 'bg-brand-dark border-brand-dark text-white' : 'bg-surface-offwhite border-black/6'}`}>
                <span className={`font-mono text-[10px] tracking-widest ${i === 3 ? 'text-brand-red' : 'text-brand-dark/30'}`}>STEP 0{i + 1}</span>
                <p className={`font-display font-bold text-lg mt-4 ${i === 3 ? 'text-white' : 'text-brand-dark'}`}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION + PROMISE ── */}
      <section className="w-full bg-brand-dark py-28 px-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-red/8 blur-[140px] rounded-full pointer-events-none" />
        <div className="max-w-[1100px] mx-auto relative z-10 text-center">
          <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-8 block">Our Mission</span>
          <h2 className="font-display font-bold tracking-tight text-white leading-[1.05]"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}>
            Not just growth.<br /><span className="text-brand-red">Growth with control.</span>
          </h2>

          <p className="mt-10 text-gray-400 font-light text-base max-w-xl mx-auto leading-relaxed">
            Every brand carries years of work. Our role is to make sure the market doesn't quietly take that value away.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {promiseItems.map((p) => (
              <span key={p} className="text-[11px] font-mono tracking-widest text-white/60 border border-white/15 rounded-full px-4 py-2">{p}</span>
            ))}
          </div>
          <p className="mt-12 font-mono text-[11px] tracking-widest text-white/40 uppercase">
            Built from retail · Driven by control · Focused on long-term brand growth
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="w-full bg-white py-32 px-8 text-center relative overflow-hidden border-t border-black/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-red/4 blur-[100px] rounded-full pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-[1000px] mx-auto relative z-10">
          <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-8 block">Ready to build a cleaner growth channel?</span>
          <h2 className="font-display font-bold tracking-tight text-brand-dark leading-[0.95]"
            style={{ fontSize: 'clamp(2.6rem, 6vw, 5.5rem)' }}>
            Grow the market.<br />Protect the brand.<br /><span className="text-brand-red">Control the channel.</span>
          </h2>
          <Link to="/contact"
            className="mt-12 inline-flex items-center gap-2 bg-brand-red text-white px-9 py-4 rounded-full font-semibold text-sm hover:bg-[#c0001f] transition-colors group">
            Talk to Loop Retail <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
