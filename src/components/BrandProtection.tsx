import { motion } from 'motion/react';
import { Check } from 'lucide-react';

const actions = [
  { num: '01', label: 'Rogue-seller sweeps', badge: 'WEEKLY' },
  { num: '02', label: 'Test-buy evidence packs', badge: 'ADMISSIBLE' },
  { num: '03', label: 'MAP policy enforcement', badge: '72H SLA' },
  { num: '04', label: 'Brand registry setup', badge: 'ALL PLATFORMS' },
  { num: '05', label: 'Monthly threat reports', badge: 'PLAIN ENGLISH' },
];

const stats = [
  { source: 'UK IPO · 2025', value: '£9B', desc: 'Annual UK retail cost of counterfeit goods sold online.' },
  { source: 'OECD Consumer Study', value: '25%', desc: 'of UK consumers unknowingly bought a counterfeit in the last 12 months.' },
  { source: 'Harris Interactive', value: '52%', desc: 'lose trust in the brand after receiving a fake — regardless of where they bought it.' },
  { source: 'Brand-Owner Survey 2025', value: '34%', desc: 'less likely to repurchase after a counterfeit experience.' },
  { source: 'Enforcement SLA', value: '72H', desc: 'From breach alert to marketplace notice, follow-up and escalation.' },
  { source: 'EnforceAI (Beta)', value: '24/7', desc: 'AI continuously scans all partner listings. Team alerted on anomalies immediately.' },
];

export function BrandProtection() {
  return (
    <section className="w-full bg-brand-dark py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-red/8 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-red/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Header */}
        <div className="mb-20">
          <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-5 block">— Brand Protection</span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-5xl md:text-7xl font-medium tracking-tighter text-white leading-[1.05] max-w-3xl"
          >
            Counterfeits kill trust.<br />
            <span className="text-brand-red">We kill counterfeits.</span>
          </motion.h2>
          <p className="mt-6 text-gray-400 font-light max-w-md leading-relaxed">
            Every marketplace we sell on, we also police. Enforcement is baked into our service fee — not sold back as a separate retainer.
          </p>
        </div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* Left — checklist */}
          <div className="space-y-0">
            {actions.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center justify-between py-5 border-b border-white/8 group"
              >
                <div className="flex items-center gap-5">
                  <span className="text-[10px] font-mono text-brand-red w-6">{item.num}</span>
                  <span className="text-white font-medium text-lg">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-mono tracking-widest border border-white/15 text-white/50 px-2.5 py-1 rounded">
                    {item.badge}
                  </span>
                  <Check size={14} className="text-brand-red" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right — stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white/4 border border-white/8 rounded-2xl p-5"
              >
                <p className="text-[9px] font-mono tracking-widest text-gray-500 uppercase mb-3">{s.source}</p>
                <p className="font-display text-4xl font-bold text-white tracking-tighter mb-2">{s.value}</p>
                <p className="text-xs text-gray-400 font-light leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
