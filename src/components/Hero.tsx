import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { NavBar } from './NavBar';

const rotatingWords = [
  'Marketplace Leadership',
  'Counterfeit Prevention',
  'Retail Expansion',
  'Fulfilment',
  'DTC Growth',
];

export function Hero() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((i) => (i + 1) % rotatingWords.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full min-h-[120vh] flex flex-col items-center bg-white overflow-hidden selection:bg-brand-red/20">
      <NavBar />
      {/* Spacer for fixed nav */}
      <div className="h-16 w-full" />

      {/* Main Content */}
      <div className="w-full max-w-[1200px] mx-auto px-6 flex flex-col items-center relative z-10 mt-12 md:mt-20">

        {/* Top Header Text */}
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end mb-16 px-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-brand-dark/40 mb-4 block">
              • End-to-End Operating Partner
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tighter text-brand-dark leading-[1.05] max-w-3xl"
            >
              For brands building<br />dominance in
              <span className="block overflow-hidden h-[1.1em] mt-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="block text-brand-red"
                  >
                    {rotatingWords[wordIndex]}.
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 md:mt-0 text-right max-w-sm flex flex-col items-end"
          >
            <p className="text-sm text-brand-dark/60 font-light mb-6 text-left md:text-right">
              Loopretail helps brands sell more, move faster, and stay protected — combining inventory buying, marketplace operations, fulfilment, retail expansion, DTC growth, and brand protection into one connected operating model.
            </p>
            <button className="bg-brand-dark text-white px-6 py-3 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-brand-red transition-colors duration-300">
              See How It Works <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>

        {/* Centerpiece Orb */}
        <div className="relative w-[300px] md:w-[500px] h-[300px] md:h-[400px] flex justify-center items-center mx-auto my-12">
          {/* Pulsing Back Glow */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full bg-brand-red blur-[80px] -z-10"
          />

          {/* Solid Core */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative w-[180px] h-[180px] md:w-[240px] md:h-[240px] rounded-full bg-gradient-to-br from-[#ff3b4f] via-brand-red to-[#990000] flex items-center justify-center shadow-[0_20px_60px_-10px_rgba(230,25,43,0.6)] overflow-hidden"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-white/10 mix-blend-overlay"></div>
            <div className="relative z-10 w-[80px] h-[80px] md:w-[110px] md:h-[110px]">
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]"
              >
                <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" />
                <motion.path
                  d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"
                  initial={{ pathLength: 0, pathOffset: 0 }}
                  animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 0.6, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  stroke="white"
                  strokeWidth="2"
                />
                <motion.path
                  d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"
                  initial={{ pathLength: 0, pathOffset: 0 }}
                  animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 0.6, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  stroke="white"
                  strokeWidth="2"
                />
              </motion.svg>
            </div>
          </motion.div>

          {/* Circular Orbit Lines */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[450px] md:h-[450px] border border-black/5 rounded-full -z-20 md:block hidden border-dashed"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] md:w-[600px] md:h-[600px] border border-black/[0.04] rounded-full -z-20 md:block hidden"
          />

          <div className="absolute left-[-100px] bottom-10 flex items-center gap-4 origin-left -rotate-90 text-[10px] font-mono tracking-widest text-brand-dark/40 hidden md:flex">
            <div className="w-12 h-[1px] bg-brand-dark/20"></div>
            SCROLL
          </div>
        </div>

        {/* Bottom Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center text-xl md:text-3xl font-display font-medium text-brand-dark max-w-4xl tracking-tight leading-snug mt-8"
        >
          One operating model. Every channel.<span className="text-black/30"> From first shipment to owned customer.</span>
        </motion.p>
      </div>
    </section>
  );
}
