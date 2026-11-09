import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Shield, Search, Sparkles } from 'lucide-react';
import { SitePage, PageHero, Section, CardGrid, CTABand, Related } from '../components/site/Page';
import { CTA, contactHref } from '../components/CTA';

const tools = [
  {
    icon: BarChart3, title: 'Brand Dashboard', to: '/tools/brand-dashboard', tag: 'Every client',
    body: 'One login for your UK numbers: sales by channel, margin, ads, stock, rank, price and protection, updated daily.',
  },
  {
    icon: Shield, title: 'Loop Protect', to: '/tools/loop-protect', tag: 'Brand protection',
    body: 'Daily checks of every seller on your Amazon UK listings. Unauthorised sellers, price breaches, Buy Box losses and listing changes open a case with evidence.',
  },
  {
    icon: Search, title: 'Competitor Analysis', to: '/tools/competitor-analysis', tag: 'Market intelligence',
    body: 'Competitor and "compatible with" products tracked per SKU: their price, rank, reviews and how fast they are growing.',
  },
];

export default function Tools() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Tools · Loop Retail"
        tag="Built in house"
        title={<><span className="font-light text-white/50">The tools behind</span><br />the operation.</>}
        lead="We built our own software so every brand we work with can see exactly what is happening on its channels, without waiting for a monthly report."
        ctas={<><CTA to="/portal/demo/overview" label="Open the live demo" tone="red" id="tools-hero-demo" /><CTA to="/portal/login" label="Client sign in" tone="outline-light" id="tools-hero-login" /></>}
      />

      <section className="w-full bg-white px-6 md:px-8 py-24 border-b border-black/5">
        <div className="max-w-[1200px] mx-auto grid gap-5">
          {tools.map((t, i) => (
            <Link key={t.title} to={t.to}
              className={`group grid md:grid-cols-[72px_1fr_auto] gap-6 items-center rounded-3xl border p-8 md:p-10 transition-colors ${i === 0 ? 'bg-brand-dark border-brand-dark' : 'bg-surface-offwhite/60 border-black/6 hover:border-brand-red/30'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${i === 0 ? 'bg-brand-red/15' : 'bg-brand-red/10'}`}><t.icon className="text-brand-red" size={24} /></div>
              <div>
                <span className="font-mono text-[10px] tracking-widest uppercase text-brand-red">{t.tag}</span>
                <h2 className={`font-display font-bold text-2xl md:text-3xl mt-1 ${i === 0 ? 'text-white' : 'text-brand-dark'}`}>{t.title}</h2>
                <p className={`mt-2 text-sm md:text-base font-light leading-relaxed max-w-2xl ${i === 0 ? 'text-white/55' : 'text-brand-dark/60'}`}>{t.body}</p>
              </div>
              <ArrowRight className={`${i === 0 ? 'text-white/50' : 'text-brand-dark/30'} group-hover:text-brand-red group-hover:translate-x-1 transition-all`} />
            </Link>
          ))}
        </div>
      </section>

      <Section tone="off" eyebrow="Where the data comes from" title={<>Real data.<br />Not screenshots.</>}
        lead="Our tools read market data automatically and combine it with the numbers only you have. No scraping, no guesswork.">
        <CardGrid cols={3} items={[
          { tag: 'Automatic, daily', title: 'Keepa market data', body: 'Amazon UK rank (BSR), Buy Box, every seller on the listing, prices and 30 and 90 day averages, reviews and estimated monthly sales for your products and your competitors.' },
          { tag: 'From you, weekly', title: 'Your own numbers', body: 'Sales by channel, ad spend, product costs and your authorised seller list. Uploaded from a simple sheet; every row is checked before it reaches the dashboard.' },
          { tag: 'Built in', title: 'AI search', body: 'Ask a question in plain English ("where are competitors cheaper than us?") and get an answer from your own dashboard data, with a link to the detail.' },
        ]} />
        <div className="mt-8 flex items-center gap-3 text-sm text-brand-dark/55"><Sparkles size={16} className="text-brand-red" /> AI answers only use your brand's data and always point to the figures they came from.</div>
      </Section>

      <CTABand title="See it with your own products." body="Send us your ASINs and we will show you your sellers, prices and competitors in the dashboard before you commit to anything." topic="dashboard-demo" label="Get a free brand report" secondary={{ to: '/portal/demo/overview', label: 'Open the demo' }} />
      <Related links={[
        { to: '/services', label: 'Services', body: 'What our team runs for you on top of the tools.' },
        { to: '/brand-protection', label: 'Brand protection', body: 'How we enforce once Loop Protect finds a problem.' },
        { to: '/how-it-works', label: 'How it works', body: 'Onboarding, reporting and partnership models.' },
      ]} />
    </SitePage>
  );
}
