import { motion } from 'motion/react';
import { Target, ArrowRight, UserCheck, Clock, Activity, BarChart3, Database } from 'lucide-react';

export function BentoGrid() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <section className="w-full bg-[#E5E5E5] py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 flex justify-between items-end">
          <div>
             <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-brand-dark mb-4 drop-shadow-sm">System Insights</h2>
             <p className="text-gray-600 max-w-md">Comprehensive view of our global infrastructure, metrics, and future roadmaps.</p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-sm font-medium px-4 py-2 border rounded-full border-black/20 hover:bg-black/5 hover:border-black/40 transition-all">
            Full Report <ArrowRight size={16} />
          </button>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[240px]"
        >
          {/* Card 1: Two-tone dark/gray */}
          <motion.div variants={item} className="col-span-1 lg:col-span-2 row-span-1 bg-white rounded-3xl p-2 flex gap-2 shadow-sm border border-black/5">
            <div className="flex-1 bg-brand-dark text-white rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
              <Activity className="text-gray-400 mb-4" size={24} />
              <div>
                <p className="font-display text-[2.5rem] leading-none mb-2 tracking-tight">2 B<span className="text-xl ml-2 font-normal text-gray-400">users</span></p>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-400">worldwide</p>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <UserCheck size={14} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-[0.6] bg-[#C1C1C1] text-brand-dark rounded-2xl p-6 flex flex-col justify-between shadow-inner">
               <Clock className="text-brand-dark/50 mb-4" size={24} />
               <div>
                <p className="font-display text-4xl leading-none mb-1 tracking-tight">365<br/>days</p>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs uppercase tracking-wider font-semibold opacity-60">year around</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Pain Points (Nested) */}
          <motion.div variants={item} className="col-span-1 lg:col-span-2 row-span-1 bg-brand-dark text-white rounded-3xl p-6 relative overflow-hidden shadow-xl">
             <div className="absolute top-6 right-6 border border-white/20 rounded-full px-3 py-1 text-[10px] uppercase tracking-widest font-mono">Mission</div>
             <h3 className="text-2xl font-display mb-6 tracking-tight font-medium">Pain Points</h3>
             <div className="grid grid-cols-2 gap-3 h-[130px]">
                <div className="bg-[#EAEAEA] rounded-xl p-4 flex flex-col justify-between text-brand-dark shadow-inner">
                  <div className="self-end"><Target size={16} /></div>
                  <div>
                    <h4 className="text-4xl font-display font-medium leading-none mb-2">1</h4>
                    <p className="text-xs font-medium opacity-70">Latency Issues</p>
                  </div>
                </div>
                <div className="bg-[#A4A4A4] rounded-xl p-4 flex flex-col justify-between text-brand-dark shadow-inner">
                  <div className="self-end text-black/40"><Database size={16} /></div>
                  <div>
                    <h4 className="text-4xl font-display font-medium leading-none mb-2 text-white/90">2</h4>
                    <p className="text-xs font-medium text-white/80">Data Silos</p>
                  </div>
                </div>
             </div>
          </motion.div>

          {/* Card 3: Large Number Dark */}
          <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-brand-dark rounded-3xl flex flex-col p-8 overflow-hidden relative shadow-2xl">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
             <div className="flex-1 flex items-center justify-center">
               <h2 className="font-display text-[12rem] leading-none tracking-tighter text-white drop-shadow-md">03</h2>
             </div>
             <div className="relative z-10 w-full flex justify-end">
               <div className="max-w-[200px] text-right">
                 <p className="text-[10px] uppercase tracking-widest text-brand-red font-bold mb-1">[ CORE PILLAR ]</p>
                 <p className="text-xs text-gray-400 font-light leading-relaxed">
                   Delivering unparalleled precision in real-time predictive analytics across distributed clusters.
                 </p>
               </div>
             </div>
          </motion.div>

          {/* Card 4: Business Presentation */}
          <motion.div variants={item} className="col-span-1 lg:col-span-2 row-span-1 bg-white rounded-3xl p-6 md:p-8 flex flex-col justify-between border border-black/5 shadow-sm">
             <div className="flex justify-between items-start mb-6">
               <div className="flex gap-2 items-center text-brand-dark font-semibold">
                 <div className="w-5 h-5 rounded bg-brand-dark text-white flex items-center justify-center text-[10px]">N</div>
                 Nexus
               </div>
               <div className="border border-black/20 rounded-full px-3 py-1 text-[10px] uppercase tracking-widest font-mono text-gray-500">Presentation</div>
             </div>
             <h2 className="font-display text-4xl md:text-5xl lg:text-7xl tracking-tighter text-brand-dark leading-none -ml-1">Business P.</h2>
             <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                <div>
                  <p className="font-semibold text-brand-dark mb-0.5">Contact</p>
                  <p>hi@nexus.ai</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-brand-dark mb-0.5">Date</p>
                  <p>Mar 2026</p>
                </div>
             </div>
          </motion.div>

          {/* Card 5: Horizontal Bar Chart representation */}
          <motion.div variants={item} className="col-span-1 lg:col-span-2 row-span-1 bg-white rounded-3xl p-6 md:p-8 flex flex-col justify-between border border-black/5 shadow-sm">
             <div className="flex gap-2 flex-col w-full mt-4">
                <div className="w-full h-8 bg-brand-dark rounded-full relative overflow-hidden flex items-center px-4">
                   <div className="absolute right-4 text-white text-xs font-medium">92%</div>
                </div>
                <div className="w-[85%] h-8 bg-[#A8A8A8] rounded-full"></div>
                <div className="w-[45%] h-8 bg-[#EAEAEA] rounded-full"></div>
             </div>
             <div className="flex justify-between items-end w-full mt-6">
                <h3 className="font-display text-4xl font-medium tracking-tight text-brand-dark">2.32<span className="text-xl ml-1">B</span></h3>
                <p className="text-sm text-gray-500 font-medium">Estimated Revenue</p>
             </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
