import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowUpRight, BarChart3, Globe, Activity, Shield, TrendingUp, GitBranch, Package, RefreshCw, Users, Award, Search, Check } from 'lucide-react';
import { FaAmazon } from 'react-icons/fa';
import { SiTiktok, SiShopify } from 'react-icons/si';
import { CTA, contactHref } from '../CTA';
import { WRAP, H2, Eyebrow, Photo, photo, type PhotoKey } from '../site/Page';

/* Home page sections. Several are the earlier site's sections, rebuilt for the light theme. */

const LOOP = 'M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z';

/* ───────────────────────── Channel marks ───────────────────────── */

export function AmazonMark({ small = false }: { small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[#232f3e]">
      <FaAmazon size={small ? 16 : 22} aria-hidden="true" />
      <span className={`font-bold tracking-[-0.04em] ${small ? 'text-[14px]' : 'text-[20px]'}`}>amazon</span>
    </span>
  );
}
export function TikTokMark({ small = false }: { small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[#010101]">
      <SiTiktok size={small ? 15 : 20} aria-hidden="true" style={{ filter: 'drop-shadow(1.5px 1px 0 #ff0050) drop-shadow(-1.5px -1px 0 #00f2ea)' }} />
      <span className={`font-bold tracking-[-0.03em] ${small ? 'text-[14px]' : 'text-[19px]'}`}>TikTok Shop</span>
    </span>
  );
}
export function EbayMark({ small = false }: { small?: boolean }) {
  const s = small ? 'text-[17px]' : 'text-[25px]';
  return (
    <span className={`font-bold tracking-[-0.07em] leading-none ${s}`} aria-label="eBay">
      <span className="text-[#e53238]">e</span><span className="text-[#0064d2]">b</span><span className="text-[#f5af02]">a</span><span className="text-[#86b817]">y</span>
    </span>
  );
}
export function TemuMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`inline-grid place-items-center rounded-[6px] bg-[#fb7701] text-white font-extrabold tracking-[0.02em] ${small ? 'text-[11px] px-1.5 py-0.5' : 'text-[15px] px-2.5 py-1'}`}>TEMU</span>
  );
}
export function ShopifyMark({ small = false }: { small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <SiShopify size={small ? 16 : 22} className="text-[#95bf47]" aria-hidden="true" />
      <span className={`font-bold tracking-[-0.03em] text-[#121614] ${small ? 'text-[14px]' : 'text-[19px]'}`}>shopify</span>
    </span>
  );
}

export function ChannelLogos() {
  const marks: [string, ReactNode][] = [
    ['Amazon UK', <AmazonMark />],
    ['TikTok Shop', <TikTokMark />],
    ['eBay', <EbayMark />],
    ['Temu', <TemuMark />],
    ['Shopify and your own store', <ShopifyMark />],
  ];
  return (
    <div className={`${WRAP} pb-10 md:pb-14`}>
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 border-t border-line pt-6">
        <span className="text-[13px] text-muted shrink-0">Channels we run</span>
        <ul className="flex flex-wrap items-center gap-x-9 gap-y-4">
          {marks.map(([name, m]) => (
            <li key={name} title={name} className="grayscale-0 opacity-90 hover:opacity-100 transition-opacity">{m}<span className="sr-only">{name}</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ───────────────────────── Hero with the animated loop ───────────────────────── */

/* Channels diagram: your brand -> Loopretail -> every channel.
   Drawn on a fixed 560 x 480 stage and scaled to fit, so the SVG lines and the HTML tiles always line up.
   Animation runs for everyone (it carries the message), but stays slow and small. */
type Layout = { W: number; H: number; hub: { x: number; y: number }; brand: { x: number; y: number }; tileX: number; tileW: number; ys: number[] };
// Wide stage for desktop (the diagram runs the full width), compact stage for phones and tablets.
const WIDE: Layout = { W: 1120, H: 440, hub: { x: 540, y: 220 }, brand: { x: 150, y: 220 }, tileX: 840, tileW: 250, ys: [52, 136, 220, 304, 388] };
const NARROW: Layout = { W: 560, H: 480, hub: { x: 226, y: 240 }, brand: { x: 70, y: 240 }, tileX: 350, tileW: 194, ys: [64, 152, 240, 328, 416] };
const TILES: { name: string; mark: ReactNode; event: string }[] = [
  { name: 'Amazon UK', mark: <AmazonMark />, event: 'Order synced' },
  { name: 'TikTok Shop', mark: <TikTokMark />, event: 'Stock updated' },
  { name: 'eBay', mark: <EbayMark />, event: 'Price checked' },
  { name: 'Temu', mark: <TemuMark />, event: 'Listing live' },
  { name: 'Your own store', mark: <ShopifyMark />, event: 'Order synced' },
];

function useWidth() {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return [setEl, w] as const;
}

export function LoopFlow() {
  const [ref, width] = useWidth();
  const L = width >= 900 ? WIDE : NARROW;
  const k = width ? Math.min(1.05, width / L.W) : 1;
  const { W: STAGE_W, H: STAGE_H, hub: HUB, brand: BRAND, tileX: TILE_X } = L;
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % TILES.length), 1800);
    return () => clearInterval(t);
  }, []);
  const bend = (TILE_X - HUB.x - 62) * 0.45;
  const toTile = (y: number) => `M ${HUB.x + 62} ${HUB.y} C ${HUB.x + 62 + bend} ${HUB.y}, ${TILE_X - bend} ${y}, ${TILE_X} ${y}`;
  const fromBrand = `M ${BRAND.x + 62} ${BRAND.y} L ${HUB.x - 62} ${HUB.y}`;
  const drawIn = (d: number) => ({ initial: { pathLength: 0 }, whileInView: { pathLength: 1 }, viewport: { once: true }, transition: { duration: 0.9, delay: d, ease: [0.16, 1, 0.3, 1] as const } });
  const popIn = (d: number, x = 0) => ({ initial: { opacity: 0, x, scale: 0.92 }, whileInView: { opacity: 1, x: 0, scale: 1 }, viewport: { once: true }, transition: { duration: 0.55, delay: d, ease: [0.16, 1, 0.3, 1] as const } });
  return (
    <div ref={ref} className="relative w-full" style={{ height: STAGE_H * k }}>
      <div className="absolute top-0 left-0 origin-top-left" style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${k})` }}>
        <div aria-hidden="true" className="absolute inset-0 rounded-[28px] bg-surface border border-line overflow-hidden">
          <motion.div className="absolute inset-[-18px]" style={{ backgroundImage: 'radial-gradient(#dfe2de 1px, transparent 1px)', backgroundSize: '18px 18px' }}
            animate={{ x: [0, 18], y: [0, 18] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} />
          <motion.div className="absolute w-[320px] h-[320px] rounded-full bg-brand-red/[0.07] blur-3xl" style={{ left: HUB.x - 160, top: HUB.y - 160 }}
            animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
        </div>

        <svg key={L.W} viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} className="absolute inset-0 w-full h-full" aria-hidden="true">
          <motion.path d={fromBrand} stroke="#c9cec9" strokeWidth="1.5" fill="none" {...drawIn(0.2)} />
          {TILES.map((t, i) => <motion.path key={t.name} d={toTile(L.ys[i])} stroke="#c9cec9" strokeWidth="1.5" fill="none" {...drawIn(0.5 + i * 0.08)} />)}
          {/* the active channel's line lights up red, with a flowing dash */}
          <motion.path key={`hl-${active}-${L.W}`} d={toTile(L.ys[active])} stroke="#e6192b" strokeWidth="2" fill="none" strokeDasharray="6 8"
            initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, strokeDashoffset: [0, -28] }}
            transition={{ pathLength: { duration: 0.6, ease: 'easeOut' }, strokeDashoffset: { duration: 1, repeat: Infinity, ease: 'linear' } }} />
          <circle r="4" fill="#121614">
            <animateMotion dur={L === WIDE ? '2.4s' : '1.6s'} repeatCount="indefinite" path={fromBrand} />
          </circle>
          {TILES.map((t, i) => (
            <circle key={t.name} r={i === active ? 5 : 3.5} fill="#e6192b" opacity={i === active ? 1 : 0.55}>
              <animateMotion dur={L === WIDE ? '2.8s' : '2.2s'} begin={`${i * 0.4}s`} repeatCount="indefinite" path={toTile(L.ys[i])} />
            </circle>
          ))}
        </svg>

        {/* your brand */}
        <motion.div {...popIn(0, -16)} className="absolute w-[124px] rounded-2xl bg-surface border border-line shadow-[0_12px_30px_-18px_rgba(18,22,20,0.4)] p-3.5" style={{ left: BRAND.x - 62, top: BRAND.y - 58 }}>
          <motion.span className="w-9 h-9 rounded-lg bg-canvas border border-line grid place-items-center"
            animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.4 }}>
            <Package size={18} className="text-ink" aria-hidden="true" />
          </motion.span>
          <p className="mt-2.5 text-[15px] font-semibold leading-tight">Your brand</p>
          <p className="text-[12px] text-muted">Stock and rules</p>
        </motion.div>

        {/* Loopretail hub */}
        <motion.div {...popIn(0.25)} className="absolute w-[124px] flex flex-col items-center" style={{ left: HUB.x - 62, top: HUB.y - 56 }}>
          <span className="relative w-[112px] h-[112px]">
            {[0, 1].map((r) => (
              <motion.span key={r} aria-hidden="true" className="absolute inset-0 rounded-[28px] border-2 border-brand-red"
                animate={{ scale: [1, 1.45], opacity: [0.45, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: r * 1.2 }} />
            ))}
            <span className="absolute inset-0 rounded-[28px] bg-brand-red grid place-items-center shadow-[0_18px_40px_-16px_rgba(230,25,43,0.7)]">
              <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-[72px] h-[72px]" aria-label="Loopretail">
                <path d={LOOP} stroke="white" strokeOpacity="0.35" strokeWidth="2.2" />
                <motion.path d={LOOP} stroke="white" strokeWidth="2.6"
                  initial={{ pathLength: 0.35, pathOffset: 0 }} animate={{ pathOffset: [0, 1] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'linear' }} />
              </svg>
            </span>
          </span>
          <p className="mt-3 text-[15px] font-semibold">Loopretail</p>
          <p className="text-[12px] text-muted">One operator</p>
        </motion.div>

        {/* channels */}
        {TILES.map((t, i) => {
          const on = i === active;
          return (
            <motion.div key={t.name} {...popIn(0.55 + i * 0.08, 16)} className="absolute" style={{ left: TILE_X, top: L.ys[i] - 30, width: L.tileW }}>
              <motion.div animate={{ x: on ? -6 : 0, scale: on ? 1.03 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className={`h-[60px] rounded-2xl bg-surface border pl-4 pr-3 flex items-center justify-between gap-3 transition-[border-color,box-shadow] duration-300 ${on ? 'border-brand-red/50 shadow-[0_16px_34px_-16px_rgba(230,25,43,0.45)]' : 'border-line shadow-[0_12px_30px_-18px_rgba(18,22,20,0.4)]'}`}>
                <span className="flex items-center min-w-0">{t.mark}<span className="sr-only">{t.name}</span></span>
                <span className="relative flex w-2 h-2 shrink-0" aria-hidden="true">
                  <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-50" />
                  <span className="relative w-2 h-2 rounded-full bg-success" />
                </span>
              </motion.div>
              <AnimatePresence>
                {on && (
                  <motion.span key={`ev-${active}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}
                    className="absolute -top-3 right-6 rounded-full bg-ink text-white text-[11px] font-medium px-2 py-0.5 whitespace-nowrap">
                    {t.event}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* Replaces the "Channels we run" logo row: heading, full width diagram, then the description. */
export function ChannelsSection() {
  return (
    <section className={`${WRAP} py-12 md:py-16 overflow-x-clip`}>
      <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        className={`${H2} max-w-[760px] mb-8 md:mb-10`}>One operator between your brand and every channel.</motion.h2>
      <LoopFlow />
      <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8 text-[16px] md:text-[17px] leading-[26px] text-muted max-w-[720px]">
        Your stock and your rules go in once. We run Amazon UK, TikTok Shop, eBay, Temu and your own store from them, and send orders, prices and seller checks back to you in one dashboard.
      </motion.p>
    </section>
  );
}

/* Home hero: same copy and buttons, now over a full width photo. */
export function HomeHero() {
  return (
    <section className="px-2 md:px-3 pt-2">
      <div className="relative rounded-[28px] overflow-hidden min-h-[560px] md:min-h-[620px] flex items-center">
        <motion.img
          src={photo('floor', 2200, 1200)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-[70%_50%]"
          initial={{ scale: 1.12 }}
          animate={{ scale: [1.12, 1.04] }}
          transition={{ duration: 14, ease: 'easeOut' }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/90 to-canvas/20 md:via-canvas/80 md:to-transparent" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-canvas/70 to-transparent" />
        <div className={`${WRAP} relative w-full py-14 md:py-20`}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-6 max-w-[620px]">
            <Eyebrow>Brand commerce partner for the UK</Eyebrow>
            <h1 className="font-semibold tracking-[-0.045em] text-balance text-[42px] leading-[46px] md:text-[68px] md:leading-[68px]">Your brand, run properly in the UK.</h1>
            <p className="text-[17px] md:text-[19px] leading-[28px] md:leading-[30px] text-ink/75 max-w-[540px] text-pretty">
              We sell your products on Amazon, TikTok Shop, eBay and your own store, keep unauthorised sellers off your listings, and report every number in one dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <CTA to={contactHref('strategy-call')} label="Book a strategy call" id="home-hero" />
              <CTA to="/portal/demo/home" label="Open the live demo" tone="outline-dark" id="home-hero-demo" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Built in motion. Always moving. ───────────────────────── */

type Suite = { tag: string; title: string; body: string; to: string; cta: string; icon: typeof TrendingUp; variant: 'red' | 'image' | 'plain'; image?: PhotoKey; imageAlt?: string };
const SUITE: Suite[] = [
  { tag: 'Demand signals', title: 'Demand forecasting before stock lands.', body: 'SKU velocity, marketplace trends and rank movement turned into a buying plan, so stock arrives where it will sell.', to: '/retail-expansion', cta: 'Retail expansion', icon: TrendingUp, variant: 'red' },
  { tag: 'Channel orchestration', title: 'One inventory pool. Every channel.', body: 'Products routed across Amazon, TikTok Shop, eBay, Temu and your own store from one stock position.', to: '/marketplace-control', cta: 'Marketplace control', icon: GitBranch, variant: 'image', image: 'amazon', imageAlt: 'Two Amazon shipping boxes' },
  { tag: 'Smart fulfilment', title: 'Checked, tracked and ready to ship.', body: 'Barcode scans, weight checks and photo logs on every order, with dispatch times tracked against the promise.', to: '/dtc-growth', cta: 'DTC growth', icon: Package, variant: 'image', image: 'van', imageAlt: 'Parcels stacked in the back of a delivery van' },
  { tag: 'Brand shield', title: 'Listings, price and trust protected.', body: 'Unauthorised sellers, grey market stock and price breaches found daily and taken to enforcement.', to: '/brand-protection', cta: 'Brand protection', icon: Shield, variant: 'plain' },
];

export function MotionSuite() {
  const still = useReducedMotion();
  return (
    <section className="px-2 md:px-3 my-3">
      <div className="rounded-[24px] bg-surface">
        <div className={`${WRAP} py-12 md:py-[72px]`}>
          <div className="mb-8 md:mb-10 grid md:grid-cols-[1.25fr_1fr] gap-4 md:gap-12 md:items-end">
            <div className="flex flex-col gap-3">
              <Eyebrow>How Loopretail works</Eyebrow>
              <h2 className={`${H2} md:text-[46px] md:leading-[48px]`}>Built in motion.<br />Always moving.</h2>
            </div>
            <p className="text-[16px] leading-[25px] text-muted max-w-[460px] md:justify-self-end">
              Four connected jobs in one operating loop. Demand is forecast, channels are switched on, fulfilment stays in sync and protection never switches off.
            </p>
          </div>

          {/* the loop track: a red pulse travels across all four stages */}
          <div aria-hidden="true" className="hidden lg:block relative h-6 mb-3 mx-[12.5%]">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-line" />
            {SUITE.map((s, i) => (
              <span key={s.tag} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-surface border-2 border-control" style={{ left: `${(i / (SUITE.length - 1)) * 100}%` }} />
            ))}
            {!still && (
              <motion.span
                className="absolute top-1/2 -translate-y-1/2 -ml-[30px] w-[60px] h-[3px] rounded-full bg-gradient-to-r from-transparent via-brand-red to-transparent"
                animate={{ left: ['0%', '100%'] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }}
              />
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {SUITE.map((s, i) => {
              const Icon = s.icon;
              const red = s.variant === 'red';
              return (
                <motion.div
                  key={s.tag}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className={`group relative rounded-2xl overflow-hidden flex flex-col min-h-[400px] transition-transform duration-300 hover:-translate-y-1 ${red ? 'text-white' : 'bg-canvas text-ink'}`}
                  style={red ? { background: 'radial-gradient(circle at top right, #ff2d40 0%, #e6192b 48%, #b8001d 100%)' } : undefined}
                >
                  {red && (
                    <motion.div
                      aria-hidden="true"
                      className="absolute top-0 right-0 w-64 h-64 border border-white/20 rounded-full translate-x-1/4 -translate-y-1/4"
                      animate={still ? undefined : { scale: [1, 1.06, 1] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <div className="absolute inset-5 border border-white/10 rounded-full" />
                      <div className="absolute inset-10 border border-white/5 rounded-full" />
                    </motion.div>
                  )}
                  {s.variant === 'image' && s.image && (
                    <div className="relative h-40 overflow-hidden shrink-0">
                      <Photo k={s.image} alt={s.imageAlt ?? ''} w={700} h={400} className="grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/10 to-transparent" />
                      <span className="absolute -bottom-5 left-6 w-11 h-11 rounded-xl bg-surface border border-line shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)] grid place-items-center">
                        <Icon size={18} className="text-brand-red" aria-hidden="true" />
                      </span>
                    </div>
                  )}
                  <div className="relative p-6 flex flex-col flex-1">
                    {s.variant !== 'image' && (
                      <span className={`w-11 h-11 rounded-xl grid place-items-center ${red ? 'bg-white/15 border border-white/25' : 'bg-red-tint'}`}>
                        <Icon size={18} className={red ? 'text-white' : 'text-brand-red'} aria-hidden="true" />
                      </span>
                    )}
                    <div className="mt-auto pt-8">
                      <p className={`text-[13px] font-medium mb-2 ${red ? 'text-white/75' : 'text-red-text'}`}>{s.tag}</p>
                      <h3 className="text-[20px] leading-[25px] font-semibold tracking-[-0.02em]">{s.title}</h3>
                      <p className={`mt-2.5 text-[15px] leading-[23px] ${red ? 'text-white/85' : 'text-muted'}`}>{s.body}</p>
                      <Link to={s.to} className={`mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium ${red ? 'text-white' : 'text-red-text'}`}>
                        {s.cta} <ArrowUpRight size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <CTA to="/services" label="See all six services" tone="dark" id="home-suite-services" />
            <CTA to={contactHref('strategy-call')} label="Talk to us about your brand" tone="outline-dark" id="home-suite" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Tools: tab bar and live previews ───────────────────────── */

const TABS = [
  { id: 'dashboard', label: 'Brand Dashboard', icon: BarChart3, href: '/tools/brand-dashboard' },
  { id: 'protect', label: 'Loop Protect', icon: Shield, href: '/tools/loop-protect' },
  { id: 'competitor', label: 'Competitor Analysis', icon: Search, href: '/tools/competitor-analysis' },
] as const;
type TabId = typeof TABS[number]['id'];

function smooth(p: { x: number; y: number }[]) {
  let d = `M ${p[0].x} ${p[0].y}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] ?? p2;
    d += ` C ${(p1.x + (p2.x - p0.x) / 6).toFixed(2)} ${(p1.y + (p2.y - p0.y) / 6).toFixed(2)}, ${(p2.x - (p3.x - p1.x) / 6).toFixed(2)} ${(p2.y - (p3.y - p1.y) / 6).toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}
const SERIES = [40, 55, 50, 70, 65, 80, 75, 88, 85, 95, 90, 100];
const PTS = SERIES.map((v, i) => ({ x: (i / (SERIES.length - 1)) * 100, y: 36 - (v / 100) * 32 }));
const LINE = smooth(PTS);
const AREA = `${LINE} L 100 40 L 0 40 Z`;
const spark = (vals: number[]) => {
  const mx = Math.max(...vals), mn = Math.min(...vals), r = mx - mn || 1;
  return smooth(vals.map((v, i) => ({ x: (i / (vals.length - 1)) * 100, y: 28 - ((v - mn) / r) * 26 })));
};

const METRICS = [
  { label: 'Revenue', value: '£47,820', change: 'Up 12.4%', icon: Globe, s: [30, 38, 35, 48, 52, 60, 72, 85] },
  { label: 'Margin after fees', value: '31.2%', change: 'Up 2.1 pts', icon: Activity, s: [50, 52, 49, 55, 58, 60, 63, 68] },
  { label: 'Sell through', value: '82%', change: 'Up 4.7 pts', icon: TrendingUp, s: [60, 64, 62, 70, 74, 78, 80, 86] },
  { label: 'Open cases', value: '3', change: '1 high', icon: Shield, s: [44, 40, 43, 36, 38, 32, 30, 26], warn: true },
];
const FEED = [
  { node: 'Amazon UK', event: 'Listing sync complete', time: '2m', tone: 'bg-success' },
  { node: 'TikTok Shop', event: 'Demand spike on Oat Bites 500g', time: '8m', tone: 'bg-warning' },
  { node: 'Loop Protect', event: 'New seller below minimum price', time: '14m', tone: 'bg-danger' },
  { node: 'UK warehouse', event: '42 orders dispatched', time: '1h', tone: 'bg-success' },
  { node: 'Own store', event: 'New order #10482', time: '2h', tone: 'bg-petrol' },
];

function DashboardPreview() {
  const [nav, setNav] = useState('Overview');
  const [hover, setHover] = useState<number | null>(null);
  const still = useReducedMotion();
  const navs: [string, typeof BarChart3][] = [['Overview', BarChart3], ['Channels', Globe], ['Ads', Activity], ['Stock', Package], ['Protection', Shield]];
  return (
    <div className="flex text-ink">
      <aside className="hidden md:flex w-52 shrink-0 flex-col gap-1 border-r border-line p-3">
        <div className="flex items-center gap-2 px-2 py-2 mb-3">
          <span className="w-7 h-7 rounded-lg bg-brand-red text-white grid place-items-center text-[12px] font-semibold">H</span>
          <span><span className="block text-[13px] font-semibold leading-tight">Halcyon Foods</span><span className="text-[11px] text-muted">Example brand</span></span>
        </div>
        {navs.map(([n, I]) => (
          <button key={n} type="button" onClick={() => setNav(n)} className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-left transition-colors ${nav === n ? 'bg-red-tint text-red-text' : 'text-muted hover:bg-canvas hover:text-ink'}`}>
            <I size={14} aria-hidden="true" />{n}
          </button>
        ))}
      </aside>
      <div className="flex-1 min-w-0 p-4 md:p-5 bg-canvas/60">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <p className="text-[16px] font-semibold tracking-[-0.01em]">{nav}</p>
            <p className="text-[12px] text-muted">All channels, last 28 days</p>
          </div>
          <Link to="/portal/demo/overview" className="text-[12px] font-medium text-red-text border border-brand-red/30 rounded-lg px-2.5 py-1.5 hover:bg-red-tint inline-flex items-center gap-1">Full report <ArrowUpRight size={12} aria-hidden="true" /></Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3">
          {METRICS.map((m) => {
            const I = m.icon;
            return (
              <div key={m.label} className="rounded-xl bg-surface border border-line p-3 group">
                <div className="flex items-center justify-between mb-2">
                  <I size={14} className="text-muted group-hover:text-brand-red transition-colors" aria-hidden="true" />
                  <span className={`text-[11px] font-medium ${m.warn ? 'text-danger' : 'text-success'}`}>{m.change}</span>
                </div>
                <p className="text-[19px] font-semibold tracking-[-0.02em] tnum">{m.value}</p>
                <p className="text-[11px] text-muted">{m.label}</p>
                <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-6 mt-2 text-control group-hover:text-brand-red transition-colors" aria-hidden="true">
                  <path d={spark(m.s)} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
            );
          })}
        </div>
        <div className="grid md:grid-cols-5 gap-2.5">
          <div className="md:col-span-3 rounded-xl bg-surface border border-line p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[12px] font-medium">Weekly revenue, all channels</p>
                <p className="mt-1 flex items-baseline gap-2"><span className="text-[22px] font-semibold tracking-[-0.02em] tnum">Up 150%</span><span className="text-[11px] text-success">since week 1</span></p>
              </div>
              <span className="text-[11px] text-muted">12 weeks</span>
            </div>
            <div className="relative h-28">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full overflow-visible" aria-label="Revenue rising over 12 weeks">
                <defs>
                  <linearGradient id="hp-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(230,25,43,0.22)" /><stop offset="100%" stopColor="rgba(230,25,43,0)" /></linearGradient>
                </defs>
                {[4, 14, 24, 34].map((y) => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#dfe2de" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />)}
                <path d={AREA} fill="url(#hp-area)" />
                <motion.path d={LINE} fill="none" stroke="#e6192b" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: still ? 1 : 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }} />
              </svg>
              <div className="absolute inset-0 flex">
                {SERIES.map((_, i) => <div key={i} className="flex-1" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />)}
              </div>
              {(() => {
                const i = hover ?? SERIES.length - 1;
                const left = `${PTS[i].x}%`, top = `${(PTS[i].y / 40) * 100}%`;
                return (
                  <div className="absolute inset-0 pointer-events-none">
                    {hover !== null && <div className="absolute top-0 bottom-0 w-px bg-ink/15" style={{ left }} />}
                    <span className="absolute w-2.5 h-2.5 -ml-[5px] -mt-[5px] rounded-full bg-brand-red ring-4 ring-brand-red/20" style={{ left, top }} />
                    {hover === null && !still && <span className="absolute w-2.5 h-2.5 -ml-[5px] -mt-[5px] rounded-full bg-brand-red animate-ping" style={{ left, top }} />}
                    {hover !== null && <span className="absolute -translate-x-1/2 -translate-y-[calc(100%+12px)] bg-ink text-white text-[11px] font-medium px-2 py-1 rounded-md whitespace-nowrap tnum" style={{ left, top }}>Week {i + 1}</span>}
                  </div>
                );
              })()}
            </div>
          </div>
          <div className="md:col-span-2 rounded-xl bg-surface border border-line p-4">
            <p className="text-[12px] font-medium mb-3">Activity</p>
            <ul className="grid gap-2.5">
              {FEED.map((f) => (
                <li key={f.event} className="flex items-start gap-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${f.tone}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1"><span className="block text-[12px] font-medium truncate">{f.node}</span><span className="block text-[11px] text-muted truncate">{f.event}</span></span>
                  <span className="text-[11px] text-muted shrink-0 tnum">{f.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProtectPreview() {
  const rows = [
    { sev: 'High', seller: 'QuickDeals Trading', product: 'Oat Bites 500g', issue: '£4.97, below your £5.49 minimum', status: 'Notice sent' },
    { sev: 'Medium', seller: 'EuroStock GmbH', product: 'Granola Mix 1kg', issue: 'EU label on UK listing, likely grey market', status: 'Test buy ordered' },
    { sev: 'Medium', seller: 'Bargain Hub UK', product: 'Oat Bites 500g', issue: 'New seller, not on your authorised list', status: 'Evidence gathered' },
    { sev: 'Low', seller: 'Prime Seller 22', product: 'Snack Box 12', issue: 'Title changed on your listing', status: 'Reverted' },
  ];
  const tone: Record<string, string> = { High: 'bg-red-tint text-danger', Medium: 'bg-[#fdf1e3] text-warning', Low: 'bg-sunken text-muted' };
  return (
    <div className="p-4 md:p-5 bg-canvas/60">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div><p className="text-[16px] font-semibold">Open cases</p><p className="text-[12px] text-muted">Checked today on Amazon UK</p></div>
        <div className="flex gap-2 text-[12px]">
          {[['Sellers on your listings', '9'], ['Authorised', '6'], ['Below minimum', '1']].map(([k, v]) => (
            <span key={k} className="rounded-lg bg-surface border border-line px-2.5 py-1.5"><span className="font-semibold tnum">{v}</span> <span className="text-muted">{k}</span></span>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-surface border border-line overflow-x-auto">
        <table className="w-full min-w-[620px] text-[13px]">
          <thead className="text-left text-muted"><tr><th className="font-medium px-4 py-2.5">Severity</th><th className="font-medium px-4 py-2.5">Seller</th><th className="font-medium px-4 py-2.5">What we found</th><th className="font-medium px-4 py-2.5">Status</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.seller} className="border-t border-line align-top">
                <td className="px-4 py-3"><span className={`text-[11px] font-semibold rounded px-1.5 py-0.5 ${tone[r.sev]}`}>{r.sev}</span></td>
                <td className="px-4 py-3"><span className="font-medium">{r.seller}</span><br /><span className="text-muted">{r.product}</span></td>
                <td className="px-4 py-3 text-muted">{r.issue}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompetitorPreview() {
  const rows = [
    { name: 'Your listing: Oat Bites 500g', price: '£5.49', rank: '1,204', move: 'Steady', you: true },
    { name: 'Brand A Oat Clusters 450g', price: '£4.99', rank: '860', move: 'Up 310 places' },
    { name: 'Brand B Honey Oat Bites 500g', price: '£5.25', rank: '1,950', move: 'Down 120 places' },
    { name: 'Brand C Oat Squares 6 pack', price: '£6.10', rank: '2,410', move: 'New this month' },
  ];
  return (
    <div className="p-4 md:p-5 bg-canvas/60">
      <div className="flex items-center gap-2 rounded-xl bg-surface border border-line px-3 py-2.5 mb-4 text-[14px] text-muted"><Search size={15} aria-hidden="true" />oat bites</div>
      <div className="rounded-xl bg-surface border border-line overflow-x-auto">
        <table className="w-full min-w-[560px] text-[13px]">
          <thead className="text-left text-muted"><tr><th className="font-medium px-4 py-2.5">Product</th><th className="font-medium px-4 py-2.5">Price</th><th className="font-medium px-4 py-2.5">Sales rank</th><th className="font-medium px-4 py-2.5">This month</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className={`border-t border-line ${r.you ? 'bg-red-tint/50' : ''}`}>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 tnum">{r.price}</td>
                <td className="px-4 py-3 tnum">{r.rank}</td>
                <td className={`px-4 py-3 ${r.move.startsWith('Up') ? 'text-success' : r.move.startsWith('Down') ? 'text-danger' : 'text-muted'}`}>{r.move}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12px] text-muted">Market data from Keepa. Competitor names are hidden in this example.</p>
    </div>
  );
}

export function ToolsPreview({ dark = false }: { dark?: boolean }) {
  const [tab, setTab] = useState<TabId>('dashboard');
  const current = TABS.find((t) => t.id === tab)!;
  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div role="tablist" aria-label="Loopretail tools" className={`inline-flex flex-wrap gap-1 rounded-xl p-1 ${dark ? 'bg-white/10' : 'bg-sunken'}`}>
          {TABS.map((t) => {
            const I = t.icon;
            const on = t.id === tab;
            return (
              <button key={t.id} role="tab" aria-selected={on} aria-controls="tool-panel" type="button" onClick={() => setTab(t.id)}
                className={`relative inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[14px] font-medium transition-colors ${on ? 'text-ink' : dark ? 'text-white/80 hover:text-white' : 'text-muted hover:text-ink'}`}>
                {on && <motion.span layoutId="tool-tab" className="absolute inset-0 rounded-lg bg-surface shadow-[0_2px_8px_-2px_rgba(18,22,20,0.18)]" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <I size={15} className={`relative ${on ? 'text-brand-red' : ''}`} aria-hidden="true" /><span className="relative">{t.label}</span>
              </button>
            );
          })}
        </div>
        <Link to={current.href} className={`text-[14px] font-medium inline-flex items-center gap-1 hover:underline ${dark ? 'text-white' : 'text-red-text'}`}>About {current.label} <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </div>

      <div id="tool-panel" role="tabpanel" className="rounded-2xl bg-surface border border-line overflow-hidden shadow-[0_30px_70px_-34px_rgba(18,22,20,0.35)]">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line text-ink">
          <div className="flex gap-1.5" aria-hidden="true"><span className="w-3 h-3 rounded-full bg-[#ff5f57]" /><span className="w-3 h-3 rounded-full bg-[#febc2e]" /><span className="w-3 h-3 rounded-full bg-[#28c840]" /></div>
          <span className="flex items-center gap-2 rounded-lg bg-canvas border border-line px-3 py-1 text-[12px] text-muted"><span className="w-1.5 h-1.5 rounded-full bg-brand-red" />loopretail.io/portal/{tab === 'dashboard' ? 'overview' : tab === 'protect' ? 'protection' : 'competitors'}</span>
          <span className="hidden sm:flex items-center gap-1.5 text-[12px] text-muted"><RefreshCw size={12} className="animate-spin [animation-duration:3s]" aria-hidden="true" />Live</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
            {tab === 'dashboard' ? <DashboardPreview /> : tab === 'protect' ? <ProtectPreview /> : <CompetitorPreview />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ───────────────────────── From audit to active pilot ───────────────────────── */

const STAGES = [
  { name: 'Audit', days: 'Days 1 to 7', body: 'Products, channels, pricing, competitors, stock readiness and protection needs.', h: 'h-24' },
  { name: 'Commercial', days: 'Days 2 to 7', body: 'Wholesale, managed retail, hybrid or pilot structure agreed around your stock and goals.', h: 'h-36' },
  { name: 'Setup', days: 'Days 8 to 14', body: 'Stock received, fulfilment prepared, listings built, reporting and seller rules loaded.', h: 'h-48' },
  { name: 'Launch', days: 'Days 15 to 28', body: 'Live on the agreed marketplaces and your own channels, with full reporting.', h: 'h-60' },
  { name: 'Live', days: 'Day 30', body: 'Sales, stock and margin signals used to scale what works and protect what matters.', h: 'h-72' },
];
const BUILT = [
  'Seller sweeps across every marketplace we sell on, every week.',
  'Test buy evidence packs ready for marketplace enforcement.',
  'Minimum price enforcement, 72 hours from breach to marketplace notice.',
  'Brand Registry set up on Amazon, TikTok Shop, eBay and more.',
  'Monthly threat report in plain English, included in the fee.',
];

export function AuditToPilot() {
  const [bar, setBar] = useState(0);
  const [item, setItem] = useState(0);
  const still = useReducedMotion();
  useEffect(() => {
    const a = setInterval(() => setBar((i) => (i + 1) % STAGES.length), 2400);
    const b = setInterval(() => setItem((i) => (i + 1) % BUILT.length), 2100);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);
  const s = STAGES[bar];
  return (
    <section className={`${WRAP} py-12 md:py-[72px]`}>
      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-12 items-start">
        <div className="min-w-0">
          <Eyebrow>Operating model</Eyebrow>
          <h2 className={`${H2} mt-3 md:text-[46px] md:leading-[48px]`}>From audit to<br />active pilot.</h2>
          <p className="mt-4 text-[16px] leading-[25px] text-muted max-w-[440px]">Five stages, one calendar month. A live operating model, built, configured and trading.</p>

          <div className="mt-8 h-16" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div key={bar} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="flex gap-3">
                <span className="text-[13px] font-semibold text-red-text tnum mt-0.5">{bar + 1}/5</span>
                <p className="text-[15px] leading-[22px]"><span className="font-semibold">{s.name}, {s.days.toLowerCase()}.</span> <span className="text-muted">{s.body}</span></p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-end gap-1.5 md:gap-2.5 h-72">
            {STAGES.map((st, i) => {
              const on = i === bar;
              const last = i === STAGES.length - 1;
              return (
                <motion.button
                  type="button"
                  key={st.name}
                  onClick={() => setBar(i)}
                  aria-pressed={on}
                  initial={{ opacity: 0, scaleY: 0 }}
                  whileInView={{ opacity: 1, scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.08 }}
                  style={{ originY: 1 }}
                  className={`flex-1 min-w-0 ${st.h} rounded-t-xl p-2 sm:p-3 flex flex-col text-left transition-colors duration-500 ${on ? 'bg-brand-red text-white' : last ? 'bg-red-tint text-red-text' : 'bg-surface border border-line text-ink hover:border-ink/30'}`}
                >
                  <span className="text-[11px] sm:text-[14px] lg:text-[15px] font-semibold tracking-[-0.02em] break-words hyphens-auto">{st.name}</span>
                  <span className={`text-[11px] md:text-[12px] mt-0.5 ${on ? 'text-white/70' : 'text-muted'}`}>{st.days.replace('Days ', '').replace('Day ', '')}</span>
                </motion.button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between text-[12px] text-muted border-t border-line pt-3">
            <span>Day 1</span><span className="hidden sm:inline">Day 7</span><span>Day 14</span><span className="hidden sm:inline">Day 28</span><span className="text-red-text font-medium">Day 30, live</span>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {['Fully managed', 'No long contracts', 'One monthly fee', 'Full reporting'].map((t) => (
              <span key={t} className="text-[13px] font-medium rounded-full border border-line bg-surface px-3 py-1.5">{t}</span>
            ))}
          </div>
          <div className="mt-6"><CTA to={contactHref('onboarding')} label="Start your 30 day onboarding" id="home-pilot" /></div>
        </div>

        <div className="rounded-[24px] bg-surface border border-line p-6 md:p-10 relative overflow-hidden">
          <div aria-hidden="true" className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-red/10 blur-[70px]" />
          <h3 className="relative text-[30px] leading-[34px] md:text-[42px] md:leading-[44px] font-semibold tracking-[-0.035em]">One partner.<br />Every channel.</h3>
          <div className="relative mt-8 rounded-2xl bg-canvas p-6 md:p-7">
            <p className="text-[13px] font-medium text-muted">Why Loopretail</p>
            <p className="mt-1 text-[24px] leading-[28px] font-semibold tracking-[-0.025em]">Built different. By design.</p>
            <div className="flex gap-1.5 mt-5 mb-4">
              {BUILT.map((_, i) => (
                <button key={i} type="button" aria-label={`Show point ${i + 1}`} onClick={() => setItem(i)} className={`h-1 rounded-full transition-all duration-300 ${item === i ? 'w-6 bg-brand-red' : 'w-1.5 bg-ink/15'}`} />
              ))}
            </div>
            <ol className="grid gap-2">
              {BUILT.map((t, i) => {
                const on = item === i;
                return (
                  <motion.li key={t} onClick={() => setItem(i)}
                    animate={{ opacity: on ? 1 : Math.abs(item - i) === 1 ? 0.55 : 0.35, scale: on ? 1 : 0.985 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-4 rounded-xl px-4 py-3 cursor-pointer ${on ? 'bg-brand-red text-white' : 'bg-surface'}`}>
                    <span className="text-[18px] font-semibold tnum shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[14px] leading-[19px]">{t}</span>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── The numbers behind the loop ───────────────────────── */

const NUMBERS = [
  { value: '£9bn', label: 'Yearly UK cost of counterfeit goods', icon: RefreshCw },
  { value: '100+', label: 'Brand partners onboarded', icon: Users },
  { value: '£500m+', label: 'Total sales managed', icon: Globe },
  { value: '72h', label: 'Breach to marketplace notice', icon: Award },
];

export function NumbersLoop() {
  const still = useReducedMotion();
  return (
    <section className="px-2 md:px-3 my-3">
      <div className="relative rounded-[24px] bg-surface overflow-hidden">
        <div aria-hidden="true" className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-[140%] h-[360px] rounded-[100%] bg-red-tint blur-2xl" />
        <div aria-hidden="true" className="absolute -bottom-72 left-1/2 -translate-x-1/2 w-[120%] h-[400px] rounded-[100%] border-t border-brand-red/30" />
        <div className={`${WRAP} relative py-14 md:py-24`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
            <h2 className="text-[40px] leading-[42px] md:text-[72px] md:leading-[70px] font-semibold tracking-[-0.045em]">The numbers<br />behind the loop.</h2>
            <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" className="w-24 h-24 md:w-32 md:h-32 shrink-0" aria-hidden="true">
              <path d={LOOP} stroke="#e6192b" strokeOpacity="0.18" strokeWidth="1.8" />
              <motion.path d={LOOP} stroke="#e6192b" strokeWidth="2.2"
                initial={{ pathLength: still ? 1 : 0.35, pathOffset: 0 }} animate={still ? undefined : { pathOffset: [0, 1] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }} />
            </svg>
          </div>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {NUMBERS.map((n, i) => {
              const I = n.icon;
              return (
                <motion.div key={n.label} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl p-5 md:p-6 flex flex-col ${i === 0 ? 'bg-brand-red text-white' : 'bg-canvas'}`}>
                  <I size={22} className={`mb-8 ${i === 0 ? 'text-white' : 'text-brand-red'}`} aria-hidden="true" />
                  <dd className="text-[40px] md:text-[56px] leading-none font-semibold tracking-[-0.045em] tnum">{n.value}</dd>
                  <dt className={`mt-3 text-[14px] leading-[20px] max-w-[190px] ${i === 0 ? 'text-white/85' : 'text-muted'}`}>{n.label}</dt>
                </motion.div>
              );
            })}
          </dl>
          <div className="mt-10 md:mt-14"><CTA to={contactHref('strategy-call')} label="Get results like these" tone="dark" id="home-numbers" /></div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Turn ___ into a controlled growth engine ───────────────────────── */

const ENGINE_WORDS = ['marketplaces', 'your website', 'your D2C store'];
const OBJECTIVES: [string, string][] = [
  ['Marketplace control', 'marketplace-audit'],
  ['Brand protection', 'protection-audit'],
  ['D2C launch', 'dtc'],
  ['Retail expansion', 'retail-expansion'],
  ['Fulfilment', 'onboarding'],
];

export function GrowthEngine() {
  const [w, setW] = useState(0);
  const [obj, setObj] = useState(0);
  const still = useReducedMotion();
  useEffect(() => {
    const t = setInterval(() => setW((i) => (i + 1) % ENGINE_WORDS.length), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <section className={`${WRAP} py-12 md:py-[72px]`}>
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        <div>
          <span className="inline-flex items-center gap-2 text-[14px] font-medium text-red-text">
            <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-brand-red animate-ping opacity-60" /><span className="relative w-2 h-2 rounded-full bg-brand-red" /></span>
            Start here
          </span>
          <h2 className="mt-4 text-[38px] leading-[42px] md:text-[60px] md:leading-[62px] font-semibold tracking-[-0.045em]">
            Turn{' '}
            <span className="inline-grid align-bottom overflow-hidden">
              {ENGINE_WORDS.map((word, i) => (
                <motion.span key={word} aria-hidden={i !== w} className="[grid-area:1/1] text-brand-red whitespace-nowrap"
                  initial={false}
                  animate={{ y: i === w ? '0%' : '-110%', opacity: i === w ? 1 : 0 }}
                  transition={still ? { duration: 0 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                  {word}
                </motion.span>
              ))}
            </span>
            <br />into a controlled growth engine.
          </h2>
          <p className="mt-6 text-[16px] leading-[25px] text-muted max-w-[460px]">
            Send your product category, current channels and the biggest issue you face today. The first thing you get back is a practical opportunity map, not a sales deck.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 max-w-[460px]">
            {[['24', 'h', 'Reply time'], ['100', '%', 'Read by a senior operator']].map(([v, sup, l]) => (
              <div key={l} className="rounded-2xl bg-surface border border-line p-5">
                <p className="text-[44px] leading-none font-semibold tracking-[-0.045em] tnum">{v}<sup className="text-brand-red text-[22px] ml-0.5">{sup}</sup></p>
                <p className="mt-2 text-[13px] text-muted">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] bg-surface border border-line p-6 md:p-10">
          <p className="text-[14px] font-medium text-muted">Partner request</p>
          <h3 className="mt-1 text-[28px] leading-[32px] font-semibold tracking-[-0.03em]">Request an audit</h3>
          <p className="mt-6 text-[14px] text-muted" id="obj-label">What do you want to fix first?</p>
          <div role="radiogroup" aria-labelledby="obj-label" className="mt-3 flex flex-wrap gap-2">
            {OBJECTIVES.map(([label], i) => (
              <button key={label} type="button" role="radio" aria-checked={obj === i} onClick={() => setObj(i)}
                className={`rounded-full px-3.5 py-2 text-[14px] font-medium border transition-colors ${obj === i ? 'bg-ink text-white border-ink' : 'bg-canvas border-line text-ink hover:border-ink/40'}`}>
                {obj === i && <Check size={14} className="inline -mt-0.5 mr-1 text-brand-red" aria-hidden="true" />}{label}
              </button>
            ))}
          </div>
          <ul className="mt-8 grid gap-3 text-[15px] text-ink">
            {['Who sells your products today, and at what price', 'Which channel to open or fix first', 'What it costs to run, in one monthly fee'].map((t) => (
              <li key={t} className="flex gap-2.5"><Check size={17} className="text-brand-red shrink-0 mt-0.5" aria-hidden="true" />{t}</li>
            ))}
          </ul>
          <div className="mt-8"><CTA to={contactHref(OBJECTIVES[obj][1])} label="Request my audit" id="home-engine" /></div>
        </div>
      </div>
    </section>
  );
}
