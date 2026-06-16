import { motion } from 'motion/react';
import { ArrowRight, Globe2 } from 'lucide-react';

const stats = [
  { label: "RETAIL", value: "01" },
  { label: "LOGISTICS", value: "02" },
  { label: "DISTRIBUTION", value: "03" },
  { label: "DTC LAUNCH", value: "04" },
];

const services = [
  { group: ["Wholesale PO", "Retail terms", "Self-through", "Marketplace execution"] },
  { group: ["FBA prep", "Kitting", "Returns QA", "Inbound QA"] },
  { group: ["Channel rules", "Stock routing", "Margin control", "Direct channels"] },
  { group: ["Shopify", "Content", "Analytics", "Growth loops"] },
];

export function GlobalPresence() {
  return (
    <section className="w-full bg-[#EAEAEA] py-24 md:py-32 px-6 rounded-b-[3rem] shadow-sm relative z-10">
      <div className="max-w-[1200px] mx-auto">

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display tracking-tighter text-5xl md:text-7xl font-medium text-brand-dark leading-[1.05]"
        >
          One partner across<br/>retail, logistics,<br/>distribution and DTC launch.
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 relative z-20">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-6 md:p-8 flex flex-col justify-between h-[160px] md:h-[200px] shadow-sm border border-black/5"
            >
              <div className="flex justify-between items-start text-brand-dark/40">
                <span className="text-[10px] font-mono uppercase tracking-widest font-semibold">{stat.label}</span>
                {idx === 0 ? <Globe2 size={16} /> : <div className="w-2 h-2 rounded-full border border-current"></div>}
              </div>
              <div className="flex items-start">
                <span className="font-display text-4xl md:text-6xl tracking-tighter font-medium text-brand-dark">{stat.value}</span>
                <span className="text-brand-red font-display text-2xl font-bold ml-1">/</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-white/50 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/40 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden"
        >
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 800 400" className="w-[150%] h-[150%] min-w-[800px] text-brand-dark" fill="currentColor">
              <path d="M400,200 Q450,150 500,200 T600,200 T700,150" stroke="currentColor" strokeWidth="2" strokeDasharray="4 8" fill="none" />
              <path d="M200,150 C250,100 350,300 400,200" stroke="currentColor" strokeWidth="2" strokeDasharray="4 8" fill="none" />
              <circle cx="400" cy="200" r="40" fill="url(#grad1)" />
              <defs>
                <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="#e6192b" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#e6192b" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-[20%] -translate-y-[10%] w-64 h-64 bg-brand-red blur-[80px] rounded-full opacity-20"></div>
          </div>

          <div className="relative z-10 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-black/10 pb-6 mb-8 gap-4">
              <h3 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-brand-dark">One operating model</h3>
              <p className="text-sm text-brand-dark/55 font-light max-w-xs">
                Loopretail combines the work brands usually split across distributors, marketplace operators, 3PLs, agencies and brand-protection vendors.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {services.map((col, cIdx) => (
                <ul key={cIdx} className="space-y-3">
                  {col.group.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-brand-dark/80 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full border border-brand-dark/40"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
