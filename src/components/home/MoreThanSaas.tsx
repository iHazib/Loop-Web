import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Zap, Database, Globe } from 'lucide-react';
import { WRAP, H2, Eyebrow } from '../site/Page';

/* The earlier site's "More than SaaS" section, rebuilt for the light theme. Lives on About. */

const card = 'relative rounded-2xl p-6 md:p-7 flex flex-col min-h-[280px] overflow-hidden transition-transform duration-300 hover:-translate-y-1';
const link = 'mt-auto pt-6 inline-flex items-center gap-1.5 text-[14px] font-medium';

export function MoreThanSaas() {
  const still = useReducedMotion();
  const enter = (i: number) => ({ initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: i * 0.05 } });
  return (
    <section className="px-2 md:px-3 my-3">
      <div className="relative rounded-[24px] bg-ink text-white overflow-hidden">
        <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-red/15 blur-[120px] rounded-full" />
        <div className={`${WRAP} relative py-12 md:py-[72px]`}>
          <div className="mb-10 grid md:grid-cols-[1.25fr_1fr] gap-4 md:gap-12 md:items-end">
            <div className="flex flex-col gap-3">
              <Eyebrow dark>What Loopretail actually does</Eyebrow>
              <h2 className={`${H2} md:text-[50px] md:leading-[52px]`}>More than SaaS.<br />More than a reseller.</h2>
            </div>
            <p className="text-[16px] leading-[25px] text-white/70 max-w-[460px] md:justify-self-end">
              One operating model in place of separate software, resellers, 3PLs, agencies and brand protection vendors. We buy stock, run the operation and show you all of it in one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <motion.div {...enter(0)} className={`${card} bg-white/[0.06] border border-white/10`}>
              <span className="w-9 h-9 rounded-lg bg-brand-red grid place-items-center mb-6"><Zap size={16} aria-hidden="true" /></span>
              <h3 className="text-[22px] leading-[27px] font-semibold tracking-[-0.02em]">How Loopretail works, in three steps</h3>
              <ol className="mt-6 grid gap-3">
                {['Buy', 'Operate', 'Protect'].map((s, i) => (
                  <li key={s} className="flex items-center gap-3">
                    <span className="text-[13px] font-semibold text-white/60 tnum w-5">{i + 1}</span>
                    <span className="h-px bg-gradient-to-r from-brand-red to-transparent" style={{ width: `${45 + i * 18}%` }} />
                    <span className="text-[14px] font-medium">{s}</span>
                  </li>
                ))}
              </ol>
              <Link to="/how-it-works" className={`${link} text-white`}>How it works <ArrowUpRight size={15} aria-hidden="true" /></Link>
            </motion.div>

            <motion.div {...enter(1)} className={`${card} items-center justify-center text-center`} style={{ background: 'linear-gradient(135deg, #2a0a0e 0%, #5a0f18 45%, #121614 100%)' }}>
              <motion.p className="text-[40px] font-bold tracking-[-0.04em]" animate={still ? undefined : { opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity }}>Live data.</motion.p>
              <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-red px-3.5 py-1.5 text-[13px] font-medium">
                <motion.span className="w-1.5 h-1.5 rounded-full bg-white" animate={still ? undefined : { opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />Updated daily
              </span>
              <Link to="/portal/demo/overview" className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-white/85 hover:text-white">Open the live demo <ArrowUpRight size={15} aria-hidden="true" /></Link>
            </motion.div>

            <motion.div {...enter(2)} className={`${card} bg-white/[0.06] border border-brand-red/25`} style={{ background: 'radial-gradient(circle at top right, rgba(230,25,43,0.22) 0%, rgba(255,255,255,0.04) 60%)' }}>
              <p className="text-[13px] font-medium text-white/60">Free brand report</p>
              <p className="mt-auto text-[28px] leading-[32px] font-semibold tracking-[-0.03em]">Send your ASINs.<br />See who sells them.</p>
              <p className="mt-3 text-[14px] leading-[21px] text-white/65">Every seller, every price below your minimum and your closest competitors, before you commit to anything.</p>
              <Link to="/contact?topic=dashboard-demo" className="mt-5 self-start inline-flex items-center gap-1.5 rounded-full border border-brand-red/50 bg-brand-red/20 px-3.5 py-1.5 text-[14px] font-medium hover:bg-brand-red/40">Request it <ArrowUpRight size={14} aria-hidden="true" /></Link>
            </motion.div>

            <motion.div {...enter(3)} className={`${card} justify-end`} style={{ background: 'linear-gradient(160deg, #5a0f18 0%, #2a0a0e 50%, #121614 100%)' }}>
              <Database size={20} className="absolute top-6 right-6 text-white/30" aria-hidden="true" />
              <h3 className="text-[30px] leading-[32px] font-semibold tracking-[-0.03em]">Loop Protect</h3>
              <p className="mt-3 text-[15px] leading-[23px] text-white/70">Every seller on your Amazon UK listings checked daily. Unauthorised sellers, price breaches and listing changes open a case with evidence.</p>
              <Link to="/tools/loop-protect" className={`${link} pt-5 text-white`}>See how it works <ArrowUpRight size={15} aria-hidden="true" /></Link>
            </motion.div>

            <motion.div {...enter(4)} className={card} style={{ background: 'radial-gradient(circle at bottom left, #8b0012 0%, #e6192b 60%, #c0001f 100%)' }}>
              <h3 className="text-[24px] leading-[28px] font-semibold tracking-[-0.02em]">Our product</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {['Brand Dashboard', 'Loop Protect', 'Competitor Analysis', 'AI search', 'UK fulfilment'].map((f) => (
                  <li key={f} className="rounded-full bg-white/15 border border-white/25 px-3 py-1.5 text-[13px] font-medium">{f}</li>
                ))}
              </ul>
              <Link to="/tools" className={`${link} text-white`}>Explore our tools <ArrowUpRight size={15} aria-hidden="true" /></Link>
            </motion.div>

            <motion.div {...enter(5)} className={`${card} bg-white/[0.06] border border-white/10`}>
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold">Loopretail</span>
                <span className="rounded-full bg-white/10 border border-white/10 px-2.5 py-1 text-[12px] text-white/70">Brand Dashboard</span>
              </div>
              <h3 className="mt-auto text-[28px] leading-[32px] font-semibold tracking-[-0.03em]">All your retail data in one place</h3>
              <div className="mt-4 flex items-center gap-2"><span className="flex-1 h-px bg-gradient-to-r from-brand-red to-transparent" /><Globe size={13} className="text-brand-red" aria-hidden="true" /></div>
              <Link to="/tools/brand-dashboard" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-white">See the dashboard <ArrowUpRight size={15} aria-hidden="true" /></Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
