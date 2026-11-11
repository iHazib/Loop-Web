import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, BarChart3, Layers, Globe, Database } from 'lucide-react';

export function FeatureCards() {
  return (
    <section className="w-full bg-[#0a0000] py-28 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-red/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-4 block">— What Loopretail Actually Does</span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-5xl md:text-6xl font-medium tracking-tighter text-white leading-[1.05]"
            >
              More than SaaS.<br />More than a reseller.
            </motion.h2>
          </div>
          <p className="text-gray-500 text-sm max-w-xs font-light">
            One operating model that replaces SaaS platforms, resellers, 3PLs, agencies and brand-protection vendors. We buy inventory, run operations and give you a real-time single view of everything.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1 — Steps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
            className="relative rounded-2xl bg-[#111] border border-white/5 p-7 flex flex-col justify-between min-h-[280px] transition-transform duration-300 hover:-translate-y-1.5 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(255,255,255,0.012)_8px,rgba(255,255,255,0.012)_9px)] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-brand-red/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center mb-6">
                <Zap size={14} className="text-white" />
              </div>
              <h3 className="font-display text-2xl font-medium text-white tracking-tight mb-6 whitespace-pre-line">
                How Loopretail{"\n"}Works in 3 Steps
              </h3>
              <div className="space-y-2.5">
                {["01  BUY", "02  OPERATE", "03  PROTECT"].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-brand-red/60 to-transparent" style={{ maxWidth: `${60 + i * 15}%` }} />
                    <span className="text-[10px] font-mono tracking-widest text-gray-400">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/how-it-works" data-cta="home-features-how" className="relative z-10 mt-6 inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-white/70 hover:text-white">HOW IT WORKS <ArrowRight size={12} /></Link>
          </motion.div>

          {/* Card 2 — We're Live */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="relative rounded-2xl overflow-hidden min-h-[280px] transition-transform duration-300 hover:-translate-y-1.5 flex flex-col justify-center items-center"
            style={{ background: 'linear-gradient(135deg, #1a0000 0%, #3d0000 40%, #000 100%)' }}
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent,transparent_12px,rgba(255,255,255,0.018)_12px,rgba(255,255,255,0.018)_13px)]" />
            <div className="absolute top-4 right-4 text-[9px] font-mono tracking-widest text-gray-500">@LOOPRETAIL</div>
            <div className="relative z-10 text-center px-6">
              <motion.p
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="font-display text-4xl font-bold text-white tracking-tight mb-4"
              >
                LIVE DATA.
              </motion.p>
              <div className="inline-flex items-center gap-2 bg-brand-red px-4 py-1.5 rounded-full">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-white"
                />
                <span className="text-[10px] font-mono tracking-widest text-white font-bold">UPDATED DAILY</span>
              </div>
              <Link to="/portal/demo/overview" data-cta="home-features-demo" className="mt-5 block text-[10px] font-mono tracking-widest text-white/70 hover:text-white">OPEN THE LIVE DEMO →</Link>
            </div>
          </motion.div>

          {/* Card 3 — Free brand report */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl bg-[#0d0000] border border-brand-red/15 p-7 flex flex-col justify-between min-h-[280px] transition-transform duration-300 hover:-translate-y-1.5 overflow-hidden"
            style={{ background: 'radial-gradient(circle at top right, rgba(139,0,0,0.25) 0%, #0a0000 60%)' }}
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(255,255,255,0.01)_8px,rgba(255,255,255,0.01)_9px)] pointer-events-none" />
            <div className="relative z-10 flex justify-between items-start">
              <span className="text-[9px] font-mono tracking-widest text-gray-500">LOOPRETAIL.IO</span>
              <span className="text-[9px] font-mono tracking-widest text-gray-500">@LOOPRETAIL</span>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-semibold tracking-widest text-white/60 uppercase mb-3">Free brand report</p>
              <p className="font-display text-3xl font-bold text-white tracking-tight leading-tight">Send your ASINs.<br />See who sells them.</p>
              <p className="text-xs text-gray-500 mt-4">Sellers, prices below your minimum and your top competitors, before you commit to anything.</p>
              <Link to="/contact?topic=dashboard-demo" data-cta="home-features-report" className="mt-5 inline-flex items-center gap-2 bg-brand-red/20 border border-brand-red/40 text-white text-[10px] font-mono tracking-widest px-3 py-1.5 rounded-full hover:bg-brand-red/40">REQUEST IT <ArrowRight size={11} /></Link>
            </div>
          </motion.div>

          {/* Card 4 — Node Intelligence */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="relative rounded-2xl overflow-hidden min-h-[280px] transition-transform duration-300 hover:-translate-y-1.5 flex flex-col justify-end p-7"
            style={{ background: 'linear-gradient(160deg, #3d0000 0%, #1a0000 50%, #000 100%)' }}
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(255,255,255,0.018)_8px,rgba(255,255,255,0.018)_9px)]" />
            <div className="absolute top-6 right-6 z-10">
              <Database size={20} className="text-white/30" />
            </div>
            <div className="absolute top-6 left-6">
              <span className="text-[9px] font-mono tracking-widest text-gray-500">@LOOPRETAIL</span>
            </div>
            <div className="relative z-10">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <Zap size={14} className="text-white" />
              </div>
              <h3 className="font-display text-3xl font-medium text-white tracking-tight mb-3 whitespace-pre-line">
                Loop{"\n"}Protect
              </h3>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                Daily checks of every seller on your Amazon UK listings. Unauthorised sellers, price breaches and listing changes open a case with evidence.
              </p>
              <Link to="/tools/loop-protect" data-cta="home-features-protect" className="mt-4 inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-white/70 hover:text-white">SEE HOW IT WORKS <ArrowRight size={12} /></Link>
            </div>
          </motion.div>

          {/* Card 5 — Product Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative rounded-2xl bg-brand-red p-7 flex flex-col justify-between min-h-[280px] transition-transform duration-300 hover:-translate-y-1.5 overflow-hidden"
            style={{ background: 'radial-gradient(circle at bottom left, #8b0000 0%, #e6192b 60%, #c0001f 100%)' }}
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(0,0,0,0.04)_8px,rgba(0,0,0,0.04)_9px)]" />
            <div className="relative z-10 flex justify-between">
              <h3 className="font-display text-2xl font-bold text-white tracking-tight">OUR<br />PRODUCT</h3>
              <span className="text-[9px] font-mono tracking-widest text-white/50">LOOPRETAIL.IO</span>
            </div>
            <div className="relative z-10 space-y-2 mt-4">
              {["01  BRAND DASHBOARD", "02  LOOP PROTECT", "03  COMPETITOR ANALYSIS", "04  AI SEARCH", "05  UK FULFILMENT"].map((f, i) => (
                <span key={i} className="inline-block bg-white/15 border border-white/20 text-white text-[9px] font-mono tracking-widest px-3 py-1.5 rounded-full mr-2">
                  {f}
                </span>
              ))}
            </div>
            <Link to="/tools" data-cta="home-features" className="relative z-10 mt-6 flex items-center gap-2 text-[10px] font-mono tracking-widest text-white/80 hover:text-white transition-colors group">
              EXPLORE OUR TOOLS <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Card 6 — All Data in One */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="relative rounded-2xl bg-[#111] border border-white/5 p-7 flex flex-col justify-between min-h-[280px] transition-transform duration-300 hover:-translate-y-1.5 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(255,255,255,0.012)_8px,rgba(255,255,255,0.012)_9px)]" />
            <div className="relative z-10 flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-brand-red flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-sm" />
                </div>
                <span className="text-xs font-semibold text-white">Loopretail</span>
              </div>
              <span className="text-[9px] font-mono tracking-widest bg-white/10 text-white/60 px-2 py-1 rounded-full border border-white/10">BRAND DASHBOARD</span>
            </div>
            <div className="relative z-10 mt-auto">
              <h3 className="font-display text-3xl font-medium text-white tracking-tighter leading-tight">
                All Your Retail<br />Data in One Place
              </h3>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-brand-red/60 to-transparent" />
                <Globe size={12} className="text-brand-red" />
              </div>
            </div>
            <div className="relative z-10 flex justify-between items-center mt-4">
              <Link to="/tools/brand-dashboard" data-cta="home-features-dashboard" className="text-[9px] font-mono tracking-widest text-white/60 hover:text-white">SEE THE DASHBOARD →</Link>
              <span className="text-[9px] font-mono tracking-widest text-gray-600">LOOPRETAIL.IO</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
