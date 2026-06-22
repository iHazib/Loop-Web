import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';
import { getPostBySlug, getPublishedPosts, usePosts, useReady, formatDate } from '../lib/store';
import { renderMarkdown } from '../lib/markdown';

const PAPER = 'bg-[#f6f5f1]';

export default function BlogPost() {
  usePosts();
  const ready = useReady();
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!ready) {
    return (
      <div className={`w-full min-h-screen ${PAPER} font-sans`}>
        <NavBar />
        <div className="max-w-[760px] mx-auto px-6 pt-44 pb-32 flex justify-center">
          <span className="font-mono text-[11px] tracking-widest text-brand-dark/30 uppercase animate-pulse">Setting the press…</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post || post.status !== 'published') {
    return (
      <div className={`w-full min-h-screen ${PAPER} font-sans`}>
        <NavBar />
        <div className="max-w-[760px] mx-auto px-6 pt-44 pb-32 text-center">
          <span className="font-mono text-[11px] tracking-widest text-brand-red uppercase">404</span>
          <h1 className="font-display font-bold tracking-tight text-brand-dark text-4xl mt-4 mb-6">Article not found.</h1>
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-mono tracking-widest text-brand-dark/50 hover:text-brand-red uppercase">
            <ArrowLeft size={14} /> Back to the journal
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const related = getPublishedPosts().filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);

  return (
    <div className={`w-full min-h-screen ${PAPER} font-sans overflow-x-hidden`}>
      <NavBar />

      <div className="max-w-[1000px] mx-auto px-6 pt-28 pb-20">

        {/* Masthead strip */}
        <div className="flex items-center justify-between border-y-2 border-black py-1.5 text-[10px] font-mono tracking-widest uppercase text-brand-dark">
          <Link to="/blog" className="inline-flex items-center gap-1.5 hover:text-brand-red transition-colors">
            <ArrowLeft size={12} /> The Loop Journal
          </Link>
          <span className="hidden sm:block text-brand-red">{post.category}</span>
          <span>{formatDate(post.publishedAt)}</span>
        </div>

        {/* Article header */}
        <header className="max-w-[760px] mx-auto text-center pt-12">
          <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase">
            {post.category} · {post.readMinutes} min read
          </span>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="font-display font-bold tracking-tight text-brand-dark leading-[1.02] mt-3 mb-5"
            style={{ fontSize: 'clamp(2.1rem, 5vw, 4rem)' }}>
            {post.title}
          </motion.h1>
          <p className="text-brand-dark/65 font-light text-lg leading-relaxed">{post.excerpt}</p>

          {/* Byline bar */}
          <div className="flex items-center justify-between border-y border-black/20 mt-8 py-3 text-[10px] font-mono tracking-widest uppercase text-brand-dark/55">
            <span>By {post.author}</span>
            <span>Filed {formatDate(post.publishedAt)}</span>
          </div>
        </header>

        {/* Cover */}
        {post.coverImage && (
          <figure className="mt-10">
            <div className="aspect-[21/9] overflow-hidden border border-black/15">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover grayscale" />
            </div>
            <figcaption className="text-[10px] font-mono tracking-widest text-brand-dark/40 uppercase mt-2 text-center italic">
              {post.category} — Loopretail Journal
            </figcaption>
          </figure>
        )}

        {/* Body */}
        <div
          className="max-w-[680px] mx-auto py-14 text-brand-dark/80 text-[1.06rem] leading-[1.8]
            [&_h2]:font-display [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-brand-dark [&_h2]:text-2xl [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:pt-6 [&_h2]:border-t [&_h2]:border-black/15
            [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-brand-dark [&_h3]:text-lg [&_h3]:mt-9 [&_h3]:mb-2.5
            [&_p]:mb-6
            [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:font-display [&>p:first-of-type]:first-letter:font-bold [&>p:first-of-type]:first-letter:text-brand-red [&>p:first-of-type]:first-letter:text-[4.2rem] [&>p:first-of-type]:first-letter:leading-[0.78] [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:mt-1
            [&_a]:text-brand-red [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[#c0001f]
            [&_strong]:text-brand-dark [&_strong]:font-semibold
            [&_ul]:my-6 [&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:pl-5
            [&_ol]:my-6 [&_ol]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5
            [&_li]:marker:text-brand-red/60
            [&_blockquote]:border-l-2 [&_blockquote]:border-brand-red [&_blockquote]:pl-6 [&_blockquote]:my-9 [&_blockquote]:font-display [&_blockquote]:font-medium [&_blockquote]:text-brand-dark [&_blockquote]:text-2xl [&_blockquote]:leading-snug
            [&_code]:bg-black/5 [&_code]:text-brand-red [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_code]:font-mono
            [&_hr]:my-12 [&_hr]:border-black/15
            [&_img]:my-8 [&_img]:border [&_img]:border-black/15 [&_img]:grayscale"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {/* Filed under */}
        {post.tags.length > 0 && (
          <div className="max-w-[680px] mx-auto flex flex-wrap items-center gap-2 border-t border-black/15 pt-6">
            <span className="text-[10px] font-mono tracking-widest text-brand-dark/40 uppercase mr-1">Filed under</span>
            {post.tags.map((t) => (
              <span key={t} className="text-[10px] font-mono tracking-widest text-brand-dark/60 border border-black/20 px-2.5 py-1 uppercase">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Related — newspaper columns */}
      {related.length > 0 && (
        <section className="w-full px-6 pb-8">
          <div className="max-w-[1000px] mx-auto">
            <div className="flex items-center justify-between border-y-2 border-black py-2 mb-8">
              <h2 className="font-display font-bold tracking-tight text-brand-dark text-lg">More from {post.category}</h2>
              <Link to="/blog" className="text-[10px] font-mono tracking-widest text-brand-red uppercase hover:underline">All sections</Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-x-8 divide-y sm:divide-y-0 sm:divide-x divide-black/15">
              {related.map((p, i) => (
                <Link key={p.id} to={`/blog/${p.slug}`} className={`group block ${i > 0 ? 'pt-8 sm:pt-0 sm:pl-8' : ''}`}>
                  {p.coverImage && (
                    <div className="aspect-[16/10] overflow-hidden border border-black/10 mb-3">
                      <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    </div>
                  )}
                  <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase">{p.category}</span>
                  <h3 className="font-display font-bold text-brand-dark group-hover:text-brand-red transition-colors leading-tight mt-1">{p.title}</h3>
                  <p className="text-brand-dark/55 text-xs font-light leading-relaxed mt-2 line-clamp-2">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA — From the Desk */}
      <section className="w-full px-6 pb-20">
        <div className="max-w-[1000px] mx-auto bg-brand-dark text-white px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="text-[9px] font-mono tracking-widest uppercase text-brand-red mb-2">From the Desk</p>
            <p className="font-display font-bold text-2xl leading-tight max-w-md">A UK retail challenge worth solving?</p>
          </div>
          <Link to="/contact"
            className="shrink-0 inline-flex items-center gap-2 bg-brand-red text-white px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-[#c0001f] transition-colors group">
            Work with Loop Retail <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
