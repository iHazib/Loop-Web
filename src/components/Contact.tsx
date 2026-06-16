import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChevronDown } from 'lucide-react';

const objectives = [
  'Retail partner / wholesale model',
  'Logistics & fulfilment',
  'Distribution expansion',
  'DTC launch',
  'Brand protection',
];

export function Contact() {
  const [objective, setObjective] = useState(objectives[0]);
  const [open, setOpen] = useState(false);

  return (
    <section className="w-full bg-white py-28 px-6 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-16 items-start">

        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse inline-block" />
            Start Here
          </span>

          <h2 className="font-display text-5xl md:text-6xl font-medium tracking-tighter text-brand-dark leading-[1.05] mb-8">
            Turn marketplaces into a controlled growth engine.
          </h2>

          <p className="text-brand-dark/55 font-light leading-relaxed max-w-sm mb-14">
            Send your product category, current channels and biggest marketplace issue. The first deliverable should be a practical opportunity map — not a sales deck.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-12">
            {[
              { value: '24', sup: 'H', label: 'Response Time' },
              { value: '100', sup: '%', label: 'Senior Review' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface-offwhite border border-black/5 rounded-2xl p-6"
              >
                <p className="font-display text-5xl font-bold text-brand-dark tracking-tighter mb-2">
                  {s.value}
                  <sup className="text-brand-red text-2xl font-bold">{s.sup}</sup>
                </p>
                <p className="text-[10px] font-mono tracking-widest text-brand-dark/40 uppercase">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-brand-dark/35 text-xs font-light italic">
            Every enquiry is read by a senior operator — not passed to sales.
          </p>
        </motion.div>

        {/* Right — Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="bg-brand-dark rounded-3xl p-8 md:p-10"
        >
          <p className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-2">— Partner Request</p>
          <h3 className="font-display text-3xl font-medium text-white tracking-tight mb-8">Request an audit</h3>

          <div className="space-y-4">
            {/* Dropdown */}
            <div>
              <label className="text-[9px] font-mono tracking-widest text-white/40 uppercase block mb-2">
                Primary Objective
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpen(v => !v)}
                  className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white hover:border-brand-red/50 transition-colors"
                >
                  {objective}
                  <ChevronDown
                    size={14}
                    className={`text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                  />
                </button>
                {open && (
                  <motion.ul
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl"
                  >
                    {objectives.map(opt => (
                      <li key={opt}>
                        <button
                          type="button"
                          onClick={() => { setObjective(opt); setOpen(false); }}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                            objective === opt
                              ? 'bg-brand-red text-white'
                              : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {opt}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </div>
            </div>

            {/* Full name + Work email */}
            <div className="grid grid-cols-2 gap-4">
              {['Full name', 'Work email'].map(p => (
                <input
                  key={p}
                  type={p === 'Work email' ? 'email' : 'text'}
                  placeholder={p}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-red/60 transition-colors w-full"
                />
              ))}
            </div>

            {/* Brand / company name */}
            <input
              type="text"
              placeholder="Brand / company name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-red/60 transition-colors"
            />

            {/* Textarea */}
            <textarea
              rows={4}
              placeholder="Your SKUs, current marketplaces, region and biggest challenge"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-red/60 transition-colors resize-none"
            />

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-brand-red hover:bg-[#c0001f] transition-colors duration-300 text-white font-semibold text-sm py-4 rounded-xl flex items-center justify-center gap-2 group"
            >
              Request audit
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
