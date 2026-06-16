import { motion } from 'motion/react';
import { TrendingUp, GitBranch, Package, Shield } from 'lucide-react';

const steps = [
  {
    title: "AI-powered demand forecasting.",
    desc: "Predict SKU velocity, track marketplace trends, and plan inventory before stock even lands.",
    icon: TrendingUp,
    tag: "Demand Signals",
    color: "bg-brand-red text-white",
    cardBg: "bg-brand-red text-white shadow-[0_20px_40px_-15px_rgba(230,25,43,0.4)] border-brand-red",
    pattern: true,
  },
  {
    title: "One inventory pool. Multiple channels.",
    desc: "Route products across Amazon, TikTok Shop, Wayfair, Zalando and DTC from a unified commerce layer.",
    icon: GitBranch,
    tag: "Channel Orchestration",
    color: "bg-transparent text-brand-dark",
    cardBg: "bg-white text-brand-dark border-black/10 hover:shadow-xl transition-shadow",
    pattern: false,
  },
  {
    title: "Verified, tracked, and dispatch-ready.",
    desc: "Barcode scans, weight checks, photo logging and live SLA monitoring reduce errors before parcels leave the door.",
    icon: Package,
    tag: "Smart Fulfilment",
    color: "bg-transparent text-brand-dark",
    cardBg: "bg-white text-brand-dark border-black/10 hover:shadow-xl transition-shadow",
    pattern: false,
  },
  {
    title: "Protect listings, pricing, and trust.",
    desc: "Detect rogue sellers, counterfeit risks and price breaches with automated monitoring and rapid enforcement workflows.",
    icon: Shield,
    tag: "Brand Shield AI",
    color: "bg-transparent text-brand-dark",
    cardBg: "bg-white text-brand-dark border-black/10 hover:shadow-xl transition-shadow",
    pattern: false,
  },
];

export function ProductSuite() {
  return (
    <section className="w-full bg-white py-24 md:py-32 px-6">
      <div className="max-w-[1200px] mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display tracking-tight text-4xl md:text-5xl font-medium text-brand-dark leading-[1.1]">
              Built in motion.<br/>
              Always <span className="text-brand-red">moving.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="md:text-right"
          >
            <span className="text-[10px] uppercase font-mono tracking-widest text-brand-dark/40 mb-2 block">— HOW LOOPRETAIL WORKS</span>
            <p className="text-sm text-brand-dark/60 max-w-[280px]">
              Four connected disciplines in one operating loop — demand is forecast, channels are activated, fulfilment stays synced, and brand protection stays on.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative rounded-3xl p-8 h-[360px] flex flex-col border overflow-hidden ${item.cardBg}`}
              >
                {item.pattern && (
                  <div className="absolute top-0 right-0 w-64 h-64 border border-white/20 rounded-full translate-x-1/4 -translate-y-1/4">
                    <div className="absolute inset-4 border border-white/10 rounded-full"></div>
                    <div className="absolute inset-8 border border-white/5 rounded-full"></div>
                  </div>
                )}

                <div className="relative z-10 w-10 h-10 rounded-full border border-current font-light flex items-center justify-center opacity-70 mb-auto">
                  <Icon size={18} strokeWidth={1.5} />
                </div>

                <div className="relative z-10 mt-auto">
                  <p className={`text-[9px] font-mono tracking-widest mb-2 ${item.pattern ? 'text-white/50' : 'text-brand-red'}`}>
                    {item.tag.toUpperCase()}
                  </p>
                  <h3 className="font-display text-xl font-medium tracking-tight mb-3">
                    {item.title}
                  </h3>
                  <p className={`text-sm ${item.pattern ? 'text-white/80' : 'text-brand-dark/60'} leading-relaxed font-light mb-6`}>
                    {item.desc}
                  </p>
                  <button className={`text-xs font-semibold tracking-wider font-mono uppercase ${item.pattern ? 'text-white' : 'text-brand-red'} hover:underline underline-offset-4 decoration-current`}>
                    Learn More
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
