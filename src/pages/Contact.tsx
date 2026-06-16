import { useState, type FormEvent, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';
import { addQuery, QUERY_CATEGORIES, type QueryCategory } from '../lib/store';

const channels = [
  { k: 'Email', v: 'hello@loopretail.io' },
  { k: 'Response', v: 'Within 1 working day' },
  { k: 'Based', v: 'United Kingdom' },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    category: 'General Enquiry' as QueryCategory,
    subject: '',
    message: '',
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please complete name, email and message.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await addQuery(form);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans overflow-x-hidden">
      <NavBar />

      <section className="w-full bg-white pt-36 pb-28 px-8">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24">

          {/* Left — pitch */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[11px] tracking-widest text-brand-red uppercase">Contact</span>
              <span className="flex-1 h-px bg-black/8" />
            </div>
            <h1 className="font-display font-bold tracking-tight text-brand-dark leading-[1.0]"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 4.5rem)' }}>
              Let's talk about<br /><span className="text-brand-red">UK retail.</span>
            </h1>
            <p className="mt-6 text-brand-dark/50 font-light text-lg max-w-md leading-relaxed">
              Tell us what you're trying to do — marketplace control, brand protection, retail expansion or DTC growth — and we'll come back with a clear next step.
            </p>

            <div className="mt-12 space-y-px border-t border-black/8">
              {channels.map((c) => (
                <div key={c.k} className="flex items-center justify-between py-4 border-b border-black/8">
                  <span className="font-mono text-[10px] tracking-widest text-brand-dark/35 uppercase">{c.k}</span>
                  <span className="font-display font-semibold text-brand-dark text-sm">{c.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form / success */}
          <div className="bg-surface-offwhite/60 border border-black/8 rounded-3xl p-8 md:p-10">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center text-center py-16">
                  <div className="w-14 h-14 rounded-full bg-brand-red flex items-center justify-center mb-6">
                    <Check size={24} className="text-white" strokeWidth={3} />
                  </div>
                  <h2 className="font-display font-bold tracking-tight text-brand-dark text-2xl mb-2">Message received.</h2>
                  <p className="text-brand-dark/50 font-light text-sm max-w-xs leading-relaxed">
                    Thanks, {form.name.split(' ')[0]}. Your enquiry has landed in our inbox — we'll reply within one working day.
                  </p>
                  <Link to="/blog" className="mt-8 inline-flex items-center gap-2 text-[11px] font-mono tracking-widest text-brand-dark/50 hover:text-brand-red uppercase transition-colors">
                    Read the journal <ArrowRight size={13} />
                  </Link>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Name *">
                      <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} placeholder="Your name" />
                    </Field>
                    <Field label="Email *">
                      <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} placeholder="you@company.com" />
                    </Field>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Company">
                      <input value={form.company} onChange={(e) => set('company', e.target.value)} className={inputCls} placeholder="Brand / company" />
                    </Field>
                    <Field label="Topic">
                      <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
                        {QUERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                  </div>

                  <Field label="Subject">
                    <input value={form.subject} onChange={(e) => set('subject', e.target.value)} className={inputCls} placeholder="One line about your enquiry" />
                  </Field>

                  <Field label="Message *">
                    <textarea value={form.message} onChange={(e) => set('message', e.target.value)} rows={5} className={`${inputCls} resize-none`} placeholder="Tell us what you're trying to do…" />
                  </Field>

                  {error && <p className="text-brand-red text-xs font-medium">{error}</p>}

                  <button type="submit" disabled={busy}
                    className="w-full flex items-center justify-center gap-2 bg-brand-red text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-[#c0001f] transition-colors group disabled:opacity-60">
                    {busy ? 'Sending…' : 'Send enquiry'} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <p className="text-center text-[10px] font-mono tracking-widest text-brand-dark/30 uppercase">Goes straight to the Loop Retail inbox</p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const inputCls =
  'w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:border-brand-red/50 transition-colors';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] tracking-widest text-brand-dark/40 uppercase mb-2">{label}</span>
      {children}
    </label>
  );
}
