import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';
import { getPublishedPosts, usePosts, useReady, formatDate, BLOG_CATEGORIES, type BlogPost } from '../lib/store';

function PostCard({ post, large = false }: { post: BlogPost; large?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Link to={`/blog/${post.slug}`} className="group block">
        <div className={`relative rounded-2xl overflow-hidden mb-5 ${large ? 'aspect-[16/9]' : 'aspect-[3/2]'}`}>
          <img src={post.coverImage} alt={post.title}
            className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent" />
          <span className="absolute top-4 left-4 text-[9px] font-mono tracking-widest uppercase bg-white/90 backdrop-blur-sm text-brand-dark px-3 py-1.5 rounded-full">
            {post.category}
          </span>
        </div>
        <div className="flex items-center gap-3 mb-3 text-[10px] font-mono tracking-widest text-brand-dark/35 uppercase">
          <span>{formatDate(post.publishedAt)}</span>
          <span className="w-1 h-1 rounded-full bg-brand-red/40" />
          <span>{post.readMinutes} min read</span>
        </div>
        <h3 className={`font-display font-bold tracking-tight text-brand-dark group-hover:text-brand-red transition-colors leading-tight mb-2 ${large ? 'text-3xl md:text-4xl' : 'text-xl'}`}>
          {post.title}
        </h3>
        <p className={`text-brand-dark/50 font-light leading-relaxed ${large ? 'text-base max-w-xl' : 'text-sm line-clamp-2'}`}>
          {post.excerpt}
        </p>
      </Link>
    </motion.div>
  );
}

export default function Blog() {
  usePosts(); // subscribe to store changes
  const ready = useReady();
  const all = getPublishedPosts();
  const [active, setActive] = useState<string>('All');
  const [q, setQ] = useState('');

  const featured = all.find((p) => p.featured) ?? all[0];
  const rest = all.filter((p) => p.id !== featured?.id);

  const filtered = useMemo<BlogPost[]>(() => {
    return rest.filter((p) => {
      const catOk = active === 'All' || p.category === active;
      const term = q.trim().toLowerCase();
      const qOk =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.excerpt.toLowerCase().includes(term) ||
        p.tags.some((t) => t.toLowerCase().includes(term));
      return catOk && qOk;
    });
  }, [rest, active, q]);

  return (
    <div className="w-full min-h-screen bg-white font-sans overflow-x-hidden">
      <NavBar />

      {/* Header */}
      <section className="w-full bg-white pt-36 pb-16 px-8 border-b border-black/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[11px] tracking-widest text-brand-red uppercase">Loop Retail — Journal</span>
            <span className="flex-1 h-px bg-black/8" />
          </div>
          <h1 className="font-display font-bold tracking-tight text-brand-dark leading-[1.0]"
            style={{ fontSize: 'clamp(2.6rem, 6vw, 5.5rem)' }}>
            Notes on <span className="text-brand-red">UK retail.</span>
          </h1>
          <p className="mt-6 text-brand-dark/50 font-light text-lg max-w-xl leading-relaxed">
            Practical thinking on marketplace control, brand protection, retail expansion and DTC growth — written by the people who run it.
          </p>
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="w-full bg-white py-16 px-8 border-b border-black/5">
          <div className="max-w-[1400px] mx-auto">
            <span className="font-mono text-[10px] tracking-widest text-brand-dark/35 uppercase mb-6 block">Featured</span>
            <PostCard post={featured} large />
          </div>
        </section>
      )}

      {/* Filters + grid */}
      <section className="w-full bg-white py-16 px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-12">
            <div className="flex flex-wrap gap-2">
              {['All', ...BLOG_CATEGORIES].map((c) => (
                <button key={c} onClick={() => setActive(c)}
                  className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                    active === c
                      ? 'bg-brand-dark text-white border-brand-dark'
                      : 'bg-white text-brand-dark/55 border-black/10 hover:border-brand-red/40 hover:text-brand-dark'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
            <div className="relative shrink-0 lg:w-72">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…"
                className="w-full bg-surface-offwhite border border-black/8 rounded-full pl-10 pr-4 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:border-brand-red/40" />
            </div>
          </div>

          {/* Grid */}
          {!ready ? (
            <div className="py-24 text-center">
              <p className="font-mono text-[11px] tracking-widest text-brand-dark/30 uppercase animate-pulse">Loading articles…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display font-semibold text-brand-dark/40 text-xl">No articles found.</p>
              <p className="text-brand-dark/30 text-sm mt-2">Try a different category or search term.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {filtered.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-surface-offwhite/50 py-24 px-8 border-t border-black/5">
        <div className="max-w-[1100px] mx-auto text-center">
          <h2 className="font-display font-bold tracking-tight text-brand-dark leading-[1.0]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            Have a UK retail challenge?
          </h2>
          <Link to="/contact"
            className="mt-8 inline-flex items-center gap-2 bg-brand-red text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-[#c0001f] transition-colors group">
            Talk to Loop Retail <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
