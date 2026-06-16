import { motion } from 'motion/react';
import { FaAmazon } from 'react-icons/fa';
import { SiTiktok, SiEbay, SiZalando, SiShopify } from 'react-icons/si';
import { ShoppingBag, User } from 'lucide-react';

const platforms = [
  { name: "Amazon",      icon: <FaAmazon size={28} /> },
  { name: "TikTok Shop", icon: <SiTiktok size={26} /> },
  { name: "eBay",        icon: <SiEbay size={48} /> },
  {
    name: "Wayfair",
    icon: (
      <svg width="30" height="30" viewBox="0 0 100 100" fill="currentColor">
        <path d="M50 0L93.3013 25V75L50 100L6.69873 75V25L50 0ZM50 100L93.3013 75V25L50 50L50 100ZM50 50L93.3013 25L50 0L6.69873 25L50 50Z" opacity="0.8"/>
      </svg>
    ),
  },
  { name: "Zalando",     icon: <SiZalando size={38} /> },
  {
    name: "B&Q",
    icon: (
      <div className="font-display font-black tracking-tighter text-2xl leading-none transform -skew-x-12 border-2 border-current px-1.5 py-0.5">
        B<span className="text-lg mx-0.5">&amp;</span>Q
      </div>
    ),
  },
  { name: "Shopify",     icon: <SiShopify size={32} /> },
  { name: "Retailers",   icon: <ShoppingBag size={28} strokeWidth={1.5} /> },
  { name: "DTC",         icon: <User size={28} strokeWidth={1.5} /> },
];

export function Platforms() {
  return (
    <section className="w-full bg-white py-24 md:py-32 border-b border-black/5">

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-brand-red/20 to-transparent" />

      <div className="max-w-[1200px] mx-auto px-6 mb-16 md:mb-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <span className="text-[10px] uppercase font-mono tracking-widest text-brand-red font-semibold mb-4 block">
            [ Channel Coverage ]
          </span>
          <h2 className="font-display tracking-tight text-3xl md:text-5xl font-medium text-brand-dark leading-tight max-w-2xl">
            Built to sell wherever your customer already shops.
          </h2>
          <p className="mt-5 text-sm text-brand-dark/55 font-light max-w-xl">
            Marketplace, retailer and DTC channels sit under one operational view so you can expand without losing pricing, fulfilment or brand control.
          </p>
        </motion.div>
      </div>

      {/* Full-width strip */}
      <div className="w-full border-y border-black/5 bg-surface-offwhite/40 px-12 py-7 flex items-center justify-between">
        {platforms.map((brand, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.06 }}
            className="flex flex-col items-center gap-2 text-brand-dark/25 hover:text-brand-red transition-colors duration-300 cursor-pointer group"
          >
            {brand.icon}
            <span className="text-[9px] font-mono tracking-widest opacity-0 group-hover:opacity-100 group-hover:text-brand-red transition-all duration-300">
              {brand.name}
            </span>
          </motion.div>
        ))}
      </div>

    </section>
  );
}
