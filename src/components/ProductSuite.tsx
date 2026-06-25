import { motion } from 'motion/react';
import { TrendingUp, GitBranch, Package, Shield } from 'lucide-react';

type Step = {
  title: string;
  desc: string;
  icon: typeof TrendingUp;
  tag: string;
  variant: 'red' | 'image' | 'plain';
  image?: string;
};

const steps: Step[] = [
  {
    title: 'AI-powered demand forecasting.',
    desc: 'Predict SKU velocity, track marketplace trends, and plan inventory before stock even lands.',
    icon: TrendingUp,
    tag: 'Demand Signals',
    variant: 'red',
  },
  {
    title: 'One inventory pool. Multiple channels.',
    desc: 'Route products across Amazon, TikTok Shop, Wayfair, Zalando and DTC from a unified commerce layer.',
    icon: GitBranch,
    tag: 'Channel Orchestration',
    variant: 'image',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=80',
  },
  {
    title: 'Verified, tracked, and dispatch-ready.',
    desc: 'Barcode scans, weight checks, photo logging and live SLA monitoring reduce errors before parcels leave the door.',
    icon: Package,
    tag: 'Smart Fulfilment',
    variant: 'image',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=700&q=80',
  },
  {
    title: 'Protect listings, pricing, and trust.',
    desc: 'Detect rogue sellers, counterfeit risks and price breaches with automated monitoring and rapid enforcement.',
    icon: Shield,
    tag: 'Brand Shield AI',
    variant: 'plain',
  },
];

export function ProductSuite() {
  return (
    <section className="w-full bg-white py-24 md:py-32 px-6">
      <div className="max-w-[1200px] mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display tracking-tight text-4xl md:text-5xl font-medium text-brand-dark leading-[1.1]">
              Built in motion.<br />
              Always <span className="text-brand-red">moving.</span>
            </h2>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="md:text-right">
            <span className="text-[10px] uppercase font-mono tracking-widest text-brand-dark/40 mb-2 block">— HOW LOOPRETAIL WORKS</span>
            <p className="text-sm text-brand-dark/60 max-w-[280px]">
              Four connected disciplines in one operating loop — demand is forecast, channels are activated, fulfilment stays synced, and brand protection stays on.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            const isRed = item.variant === 'red';

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`group relative rounded-3xl overflow-hidden flex flex-col min-h-[380px] transition-all duration-300 hover:-translate-y-1.5 ${
                  isRed
                    ? 'text-white ring-1 ring-white/10 shadow-[0_30px_60px_-26px_rgba(230,25,43,0.6)] hover:shadow-[0_38px_70px_-26px_rgba(230,25,43,0.75)]'
                    : 'bg-gradient-to-b from-white to-[#f3f2ee] text-brand-dark border border-black/8 ring-1 ring-black/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_22px_46px_-30px_rgba(0,0,0,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_30px_60px_-28px_rgba(0,0,0,0.45)]'
                }`}
                style={isRed ? { background: 'radial-gradient(circle at top right, #ff2d40 0%, #e6192b 48%, #c0001f 100%)' } : undefined}
              >
                {/* Red card decorative rings */}
                {isRed && (
                  <div className="absolute top-0 right-0 w-64 h-64 border border-white/20 rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none">
                    <div className="absolute inset-4 border border-white/10 rounded-full" />
                    <div className="absolute inset-8 border border-white/5 rounded-full" />
                  </div>
                )}

                {/* Image header */}
                {item.variant === 'image' && item.image && (
                  <div className="relative h-36 overflow-hidden shrink-0">
                    <img src={item.image} alt={item.tag}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[700ms] ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/15 to-transparent" />
                    {/* glass icon badge */}
                    <div className="absolute -bottom-5 left-7 w-11 h-11 rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)] flex items-center justify-center">
                      <Icon size={17} strokeWidth={1.75} className="text-brand-red" />
                    </div>
                  </div>
                )}

                <div className="relative z-10 p-7 flex flex-col flex-1">
                  {/* Icon for non-image cards */}
                  {item.variant !== 'image' && (
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-auto ${isRed ? 'bg-white/15 border border-white/20' : 'bg-brand-red/8 border border-brand-red/15'}`}>
                      <Icon size={18} strokeWidth={1.5} className={isRed ? 'text-white' : 'text-brand-red'} />
                    </div>
                  )}

                  <div className="mt-auto">
                    <p className={`text-[9px] font-mono tracking-widest mb-2 ${isRed ? 'text-white/55' : 'text-brand-red'}`}>
                      {item.tag.toUpperCase()}
                    </p>
                    <h3 className="font-display text-xl font-medium tracking-tight mb-3 leading-snug">{item.title}</h3>
                    <p className={`text-sm leading-relaxed font-light mb-6 ${isRed ? 'text-white/80' : 'text-brand-dark/55'}`}>
                      {item.desc}
                    </p>
                    <button className={`text-xs font-semibold tracking-wider font-mono uppercase inline-flex items-center gap-1.5 transition-all group/btn ${isRed ? 'text-white' : 'text-brand-red'}`}>
                      Learn More
                      <span className="group-hover/btn:translate-x-0.5 transition-transform">→</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
