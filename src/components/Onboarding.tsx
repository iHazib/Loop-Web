import { motion } from 'motion/react';

const steps = [
  {
    num: '01',
    title: 'Audit',
    desc: 'Assess products, channels, pricing, competition, stock readiness and protection requirements.',
    milestone: false,
  },
  {
    num: '02',
    title: 'Commercial model',
    desc: 'Agree wholesale, managed retail, hybrid or pilot structures based on inventory and brand goals.',
    milestone: false,
  },
  {
    num: '03',
    title: 'Operational setup',
    desc: 'Receive stock, prep fulfilment, build listings and configure reporting and control layers.',
    milestone: true,
  },
  {
    num: '04',
    title: 'Launch',
    desc: 'Live across selected retail partners and owned channels with full reporting visibility.',
    milestone: false,
  },
  {
    num: '05',
    title: 'Optimise',
    desc: 'Use performance, inventory and margin signals to scale what works and protect what matters.',
    milestone: false,
  },
];

export function Onboarding() {
  return (
    <section className="w-full bg-white py-24 md:py-32 px-6">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] uppercase font-mono tracking-widest text-brand-red mb-4 block">• 30-Day Onboarding</span>
            <h2 className="font-display tracking-tight text-4xl md:text-5xl font-medium text-brand-dark leading-[1.1]">
              From audit to<br />
              <span className="text-brand-red">active pilot.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="md:text-right"
          >
            <div className="font-display text-7xl font-bold text-brand-dark/8 leading-none mb-2">30</div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-brand-dark/40 block">Days to live</span>
            <p className="text-sm text-brand-dark/60 max-w-[280px] mt-3 font-light">
              Five precision stages. One calendar month. A live operating model — fully built, configured and trading.
            </p>
          </motion.div>
        </div>

        {/* Steps grid — same card design as ProductSuite */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative rounded-3xl p-7 flex flex-col border overflow-hidden ${
                step.milestone
                  ? 'bg-brand-red text-white shadow-[0_20px_40px_-15px_rgba(230,25,43,0.4)] border-brand-red'
                  : 'bg-white text-brand-dark border-black/10 hover:shadow-xl transition-shadow'
              }`}
            >
              {step.milestone && (
                <div className="absolute top-0 right-0 w-48 h-48 border border-white/20 rounded-full translate-x-1/4 -translate-y-1/4">
                  <div className="absolute inset-4 border border-white/10 rounded-full" />
                </div>
              )}

              <span className={`text-[10px] font-mono tracking-widest mb-auto ${step.milestone ? 'text-white/50' : 'text-brand-red'}`}>
                {step.num}
              </span>

              <div className="mt-12">
                <h3 className="font-display text-lg font-medium tracking-tight mb-3">{step.title}</h3>
                <p className={`text-xs leading-relaxed font-light ${step.milestone ? 'text-white/75' : 'text-brand-dark/60'}`}>
                  {step.desc}
                </p>
                {step.milestone && (
                  <div className="mt-5 inline-flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-[9px] font-mono tracking-widest text-white/70">KEY MILESTONE</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
