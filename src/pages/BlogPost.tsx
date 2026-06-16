import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';
import { getPostBySlug, getPublishedPosts, usePosts, useReady, formatDate } from '../lib/store';
import { renderMarkdown } from '../lib/markdown';

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
      <div className="w-full min-h-screen bg-white font-sans">
        <NavBar />
        <div className="max-w-[800px] mx-auto px-8 pt-44 pb-32 flex justify-center">
          <span className="font-mono text-[11px] tracking-widest text-brand-dark/30 uppercase animate-pulse">Loading…</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post || post.status !== 'published') {
    return (
      <div className="w-full min-h-screen bg-white font-sans">
        <NavBar />
        <div className="max-w-[800px] mx-auto px-8 pt-44 pb-32 text-center">
          <span className="font-mono text-[11px] tracking-widest text-brand-red uppercase">404</span>
          <h1 className="font-display font-bold tracking-tight text-brand-dark text-4xl mt-4 mb-6">Article not found.</h1>
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-mono tracking-widest text-brand-dark/50 hover:text-brand-red uppercase">
            <ArrowLeft size={14} /> Back to journal
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const related = getPublishedPosts().filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);

  return (
    <div className="w-full min-h-screen bg-white font-sans overflow-x-hidden">
      <NavBar />

      {/* Header */}
      <article className="w-full bg-white pt-36 px-8">
        <div className="max-w-[760px] mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-brand-dark/40 hover:text-brand-red uppercase mb-10 transition-colors">
            <ArrowLeft size={13} /> Journal
          </Link>

          <div className="flex items-center gap-3 mb-6 text-[10px] font-mono tracking-widest uppercase">
            <span className="bg-brand-red/10 text-brand-red px-3 py-1.5 rounded-full">{post.category}</span>
            <span className="text-brand-dark/35">{formatDate(post.publishedAt)}</span>
            <span className="w-1 h-1 rounded-full bg-brand-red/40" />
            <span className="text-brand-dark/35">{post.readMinutes} min read</span>
          </div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display font-bold tracking-tight text-brand-dark leading-[1.05]"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}>
            {post.title}
          </motion.h1>

          <p className="mt-6 text-brand-dark/55 font-light text-lg leading-relaxed">{post.excerpt}</p>

          <div className="mt-8 flex items-center gap-3 pb-10 border-b border-black/8">
            <div className="w-9 h-9 rounded-full bg-brand-dark flex items-center justify-center text-white font-display font-bold text-xs">
              {post.author.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-dark">{post.author}</p>
              <p className="text-[10px] font-mono tracking-widest text-brand-dark/35 uppercase">Author</p>
            </div>
          </div>
        </div>

        {/* Cover */}
        <div className="max-w-[1000px] mx-auto mt-10 rounded-3xl overflow-hidden aspect-[16/9]">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>

        {/* Content */}
        <div
          className="max-w-[720px] mx-auto py-16 text-brand-dark/75 text-[1.05rem] leading-[1.75]
            [&_h2]:font-display [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-brand-dark [&_h2]:text-3xl [&_h2]:mt-14 [&_h2]:mb-5
            [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-brand-dark [&_h3]:text-xl [&_h3]:mt-10 [&_h3]:mb-3
            [&_p]:mb-6
            [&_a]:text-brand-red [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[#c0001f]
            [&_strong]:text-brand-dark [&_strong]:font-semibold
            [&_ul]:my-6 [&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:pl-5
            [&_ol]:my-6 [&_ol]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5
            [&_li]:marker:text-brand-red/50
            [&_blockquote]:border-l-2 [&_blockquote]:border-brand-red [&_blockquote]:pl-6 [&_blockquote]:my-8 [&_blockquote]:font-display [&_blockquote]:font-medium [&_blockquote]:text-brand-dark [&_blockquote]:text-xl
            [&_code]:bg-surface-offwhite [&_code]:text-brand-red [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.9em] [&_code]:font-mono
            [&_hr]:my-12 [&_hr]:border-black/8
            [&_img]:rounded-2xl [&_img]:my-8"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="max-w-[720px] mx-auto pb-16 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span key={t} className="text-[10px] font-mono tracking-widest text-brand-dark/45 border border-black/8 rounded-full px-3 py-1.5 uppercase">
                #{t}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="w-full bg-surface-offwhite/50 py-20 px-8 border-t border-black/5">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="font-display font-bold tracking-tight text-brand-dark text-2xl mb-10">More in {post.category}</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {related.map((p) => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="group block">
                  <div className="rounded-2xl overflow-hidden aspect-[3/2] mb-4">
                    <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  </div>
                  <h3 className="font-display font-bold text-brand-dark group-hover:text-brand-red transition-colors leading-tight">{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="w-full bg-white py-24 px-8 border-t border-black/5 text-center">
        <Link to="/contact"
          className="inline-flex items-center gap-2 bg-brand-red text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-[#c0001f] transition-colors group">
          Work with Loop Retail <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
