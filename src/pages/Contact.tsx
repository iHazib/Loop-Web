import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { SitePage, Eyebrow, WRAP } from '../components/site/Page';
import { addQuery, QUERY_CATEGORIES, type QueryCategory } from '../lib/store';

const channels = [
  { k: 'Email', v: 'hello@loopretail.io' },
  { k: 'Response', v: 'Within 1 working day' },
  { k: 'Based', v: 'United Kingdom' },
];

const TOPICS: Record<string, { category: QueryCategory; subject: string }> = {
  'strategy-call': { category: 'General Enquiry', subject: 'Book a strategy call' },
  'marketplace-control': { category: 'Marketplace Control', subject: 'Marketplace control enquiry' },
  'brand-protection': { category: 'Brand Protection', subject: 'Brand protection enquiry' },
  'retail-expansion': { category: 'Retail Expansion', subject: 'Retail expansion enquiry' },
  'dtc': { category: 'DTC Growth', subject: 'Free UK D2C audit' },
  'competitor-analysis': { category: 'Competitor Analysis', subject: 'Free competitor scan' },
  'dashboard-demo': { category: 'Dashboard Demo', subject: 'Free brand report / dashboard demo' },
  'onboarding': { category: 'General Enquiry', subject: 'Start 30 day onboarding' },
  'marketplace-audit': { category: 'Marketplace Control', subject: 'Marketplace audit' },
  'protection-audit': { category: 'Brand Protection', subject: 'Free seller audit' },
  'uk-launch': { category: 'General Enquiry', subject: 'Plan a UK launch' },
  'case-study': { category: 'General Enquiry', subject: 'Case study access' },
};

export default function Contact() {
  const [params] = useSearchParams();
  const topic = TOPICS[params.get('topic') ?? ''];
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    category: (topic?.category ?? 'General Enquiry') as QueryCategory,
    subject: topic && params.get('study') ? `${topic.subject}: ${params.get('study')!.slice(0, 120)}` : topic?.subject ?? '',
    message: '',
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Add your name, email and a message, then send again.');
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
    <SitePage>
      <section className={`${WRAP} pt-8 md:pt-12 pb-14 md:pb-20`}>
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-16 items-start">
          <div className="flex flex-col gap-6">
            <Eyebrow>Contact</Eyebrow>
            <h1 className="font-semibold tracking-[-0.04em] text-balance text-[38px] leading-[42px] md:text-[54px] md:leading-[56px]">Tell us what you want to fix or grow.</h1>
            <p className="text-[17px] leading-[27px] text-muted max-w-[480px]">Marketplaces, brand protection, a UK direct store or retail: describe where you are and we reply with a clear next step.</p>
            <dl className="grid gap-px bg-line rounded-xl overflow-hidden border border-line max-w-[480px]">
              {channels.map((c) => (
                <div key={c.k} className="bg-surface px-4 py-3 flex items-center justify-between gap-4">
                  <dt className="text-[14px] text-muted">{c.k}</dt>
                  <dd className="text-[14px] font-semibold">{c.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-surface border border-line rounded-[20px] p-6 md:p-8">
            {sent ? (
              <div className="flex flex-col items-start py-10 gap-3" role="status">
                <span className="w-11 h-11 rounded-full bg-success text-white grid place-items-center"><Check size={20} strokeWidth={3} /></span>
                <h2 className="text-[24px] font-semibold tracking-[-0.02em]">Enquiry sent</h2>
                <p className="text-[15px] text-muted max-w-sm">Thanks, {form.name.split(' ')[0]}. It is in our inbox and we will reply within one working day.</p>
                <Link to="/blog" className="mt-3 text-[14px] font-medium text-red-text hover:underline">Read the blog while you wait</Link>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-5" noValidate>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Name" required>
                    <input id="c-name" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Work email" required>
                    <input id="c-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
                  </Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Brand or company">
                    <input id="c-company" autoComplete="organization" value={form.company} onChange={(e) => set('company', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Topic">
                    <select id="c-topic" value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
                      {QUERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Subject">
                  <input id="c-subject" value={form.subject} onChange={(e) => set('subject', e.target.value)} className={inputCls} />
                </Field>
                <Field label="Message" required hint="Products, channels you sell on today, and what is going wrong.">
                  <textarea id="c-message" value={form.message} onChange={(e) => set('message', e.target.value)} rows={5} className={`${inputCls} resize-y`} />
                </Field>
                {error && <p className="text-danger text-[14px] font-medium" role="alert">{error}</p>}
                <button type="submit" disabled={busy}
                  className="inline-flex items-center justify-center gap-2 bg-brand-red text-white px-6 py-3 rounded-[10px] font-medium text-[15px] hover:bg-brand-red-hover transition-colors disabled:opacity-60">
                  {busy ? 'Sending' : 'Send enquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </SitePage>
  );
}

const inputCls =
  'w-full bg-surface border border-control/60 rounded-[10px] px-3.5 py-2.5 text-[15px] text-ink focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10';

function Field({ label, children, required, hint }: { label: string; children: ReactNode; required?: boolean; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-[14px] font-medium mb-1.5">{label}{required && <span className="text-red-text"> *</span>}</span>
      {hint && <span className="block text-[13px] text-muted -mt-1 mb-1.5">{hint}</span>}
      {children}
    </label>
  );
}
