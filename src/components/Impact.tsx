import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Users, Globe, Award } from 'lucide-react';

const stats = [
  { value: "£9B", label: "Annual UK cost of\ncounterfeit goods", icon: RefreshCw },
  { value: "100+", label: "Brand Partners\nOnboarded", icon: Users },
  { value: "500M+", label: "Total GMV\nManaged", icon: Globe },
  { value: "72H", label: "Enforcement\nSLA", icon: Award },
];

const milestones = [
  { year: "Audit", title: "Day 1–7", desc: "Assess products, channels, pricing, competition, stock readiness and protection requirements.", height: "h-20", activeBg: "bg-surface-offwhite", text: "text-brand-dark" },
  { year: "Commercial", title: "Day 2–7", desc: "Agree wholesale, managed retail, hybrid or pilot structures based on inventory and brand goals.", height: "h-32", activeBg: "bg-brand-dark", text: "text-white" },
  { year: "Setup", title: "Day 8–14", desc: "Receive stock, prep fulfilment, build listings and configure reporting and control layers.", height: "h-44", activeBg: "bg-brand-dark", text: "text-white" },
  { year: "Launch", title: "Day 15–28", desc: "Live across selected retail partners and owned channels with full reporting visibility.", height: "h-56", activeBg: "bg-brand-dark", text: "text-white" },
  { year: "Live", title: "Day 30", desc: "Use performance, inventory and margin signals to scale what works and protect what matters.", height: "h-72", activeBg: "bg-brand-red", text: "text-white" },
];

const protectionItems = [
  { num: "01", text: "Rogue-seller sweeps — weekly enforcement across every marketplace we sell on.", bg: "bg-brand-red text-white" },
  { num: "02", text: "Test-buy evidence packs compiled as admissible enforcement documentation.", bg: "bg-brand-dark text-white" },
  { num: "03", text: "MAP policy enforcement with 72H SLA from breach alert to marketplace notice.", bg: "bg-brand-dark text-white" },
  { num: "04", text: "Brand registry setup across all platforms — Amazon, TikTok Shop, eBay and more.", bg: "bg-brand-dark text-white" },
  { num: "05", text: "Monthly threat reports in plain English — no retainer, baked into the fee.", bg: "bg-gray-200 text-brand-dark" },
];

export function ImpactSection() {
  const [activeBar, setActiveBar] = useState(0);
  const [activeItem, setActiveItem] = useState(0);

  // Auto-cycle milestone bars
  useEffect(() => {
    const t = setInterval(() => setActiveBar(i => (i + 1) % milestones.length), 2200);
    return () => clearInterval(t);
  }, []);

  // Auto-cycle protection items
  useEffect(() => {
    const t = setInterval(() => setActiveItem(i => (i + 1) % protectionItems.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="bg-brand-dark w-full relative">

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 grid lg:grid-cols-2 gap-16 lg:gap-8">

        {/* Left Side: Milestones */}
        <div>
          <div className="flex items-center gap-4 text-xs font-mono tracking-widest uppercase text-gray-400 mb-8 border-b border-white/10 pb-4">
            <span>Loopretail</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
            <span>Operating Model</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
            <span>2025</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-white tracking-tight leading-[1.1] mb-12">
            From audit to<br/>active pilot.
          </h2>

          <p className="text-gray-400 max-w-sm mb-16 font-light">
            Five precision stages. One calendar month. A live operating model — fully built, configured and trading.
          </p>

          {/* Active stage detail — animates above bars */}
          <div className="mb-4 h-14">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeBar}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3"
              >
                <span className="text-brand-red font-mono text-[10px] tracking-widest mt-0.5 shrink-0">
                  {String(activeBar + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-white text-sm font-medium mb-0.5">{milestones[activeBar].year} · {milestones[activeBar].title}</p>
                  <p className="text-gray-400 text-xs font-light leading-relaxed">{milestones[activeBar].desc}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-end gap-2 md:gap-3 h-72">
            {milestones.map((m, i) => (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                whileInView={{ opacity: 1, scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{ originY: 1 }}
                key={i}
                onClick={() => setActiveBar(i)}
                className={`flex-1 ${m.height} ${m.text} p-4 rounded-t-xl flex flex-col relative cursor-pointer transition-all duration-500 ${
                  activeBar === i ? m.activeBg + ' scale-[1.03] shadow-lg' : 'bg-white/5 opacity-50'
                }`}
              >
                <p className="font-display text-base md:text-xl font-medium tracking-tight">{m.year}</p>
                <p className="text-[9px] font-mono mt-1 opacity-60">{m.title}</p>
                {activeBar === i && (
                  <motion.div
                    layoutId="activeBarIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red rounded-full"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side: Core Values */}
        <div className="bg-[#110505] rounded-3xl p-8 md:p-12 relative overflow-hidden border border-brand-red/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-red/20 via-transparent to-transparent opacity-80 pointer-events-none"></div>

          <h2 className="text-4xl md:text-6xl font-display font-medium text-white tracking-tighter leading-[1.05] mb-12 relative z-10 drop-shadow-md">
            One partner.<br/>Every channel.
          </h2>

          <div className="mt-20 relative z-10 bg-white rounded-2xl p-8 text-brand-dark shadow-2xl">
            <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-400 mb-4">[WHY LOOPRETAIL]</p>
            <h3 className="text-3xl md:text-4xl font-display font-semibold tracking-tight leading-tight mb-6">
              Built different.<br/>By design.
            </h3>

            {/* Progress dots */}
            <div className="flex gap-1.5 mb-5">
              {protectionItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveItem(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    activeItem === i ? 'w-6 bg-brand-red' : 'w-1.5 bg-black/15'
                  }`}
                />
              ))}
            </div>

            <div className="space-y-2 relative">
              {protectionItems.map((val, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: activeItem === i ? 1 : activeItem === i - 1 || activeItem === i + 1 ? 0.4 : 0.2,
                    scale: activeItem === i ? 1 : 0.98,
                  }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setActiveItem(i)}
                  className={`${val.bg} p-4 rounded flex items-center gap-4 cursor-pointer transition-all duration-300 ${
                    activeItem === i ? 'shadow-md' : ''
                  }`}
                >
                  <span className="font-display text-xl font-medium shrink-0">{val.num}</span>
                  <p className="text-xs sm:text-sm leading-tight opacity-90">{val.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Half */}
      <div className="w-full bg-gradient-to-b from-[#1E0505] to-[#0A0000] relative overflow-hidden pt-24 pb-48 px-6">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150%] h-[500px] bg-gradient-to-t from-brand-red/20 to-brand-red/0 rounded-[100%] blur-3xl opacity-50"></div>
        <div className="absolute -bottom-64 left-1/2 -translate-x-1/2 w-[120%] h-[400px] border-t border-brand-red/40 rounded-[100%] bg-gradient-to-b from-[#2A0505] to-black shadow-[0_-20px_60px_-15px_rgba(230,25,43,0.3)]"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  key={i}
                  className="flex flex-col relative border-l border-white/10 pl-6 border-dashed"
                >
                  <Icon className="text-brand-red mb-6" size={24} strokeWidth={1.5} />
                  <h4 className="font-display text-4xl md:text-5xl tracking-tighter text-white mb-3 font-semibold">{stat.value}</h4>
                  <p className="text-xs uppercase tracking-wider text-gray-400 whitespace-pre-line leading-relaxed font-medium">
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-32">
            <h2 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter mb-4 drop-shadow-xl inline-block relative">
              The numbers<br/>behind the loop.
              <span className="absolute -inset-8 bg-brand-red/20 blur-3xl rounded-full -z-10 mix-blend-screen opacity-50"></span>
            </h2>
          </div>
        </div>
      </div>

    </section>
  );
}
