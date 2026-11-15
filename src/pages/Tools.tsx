import { Link } from 'react-router-dom';
import { ArrowUpRight, BarChart3, Shield, Search, Sparkles } from 'lucide-react';
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
        eyebrow="Tools"
        title="The software behind the operation."
        lead="We built our own software so every brand we work with can see exactly what is happening on its channels, without waiting for a monthly report."
        ctas={<><CTA to="/portal/demo/overview" label="Open the live demo" tone="red" id="tools-hero-demo" /><CTA to="/portal/login" label="Client sign in" tone="outline-dark" id="tools-hero-login" /></>}
        image="card"
        imageAlt="Someone checking an order on a laptop"
      />

      <Section eyebrow="Three tools" title="Three tools inside one client login."
        lead="Every client gets the Brand Dashboard. Loop Protect and Competitor Analysis run inside it, on the same daily data.">
        <div className="grid md:grid-cols-3 gap-3 md:gap-4">
          {tools.map((t, i) => (
            <Link key={t.title} to={t.to}
              className={`group flex flex-col rounded-[20px] p-7 md:p-8 min-h-[340px] transition-colors duration-300 ${i === 0 ? 'bg-brand-dark hover:bg-black' : 'bg-surface border border-line hover:border-ink/30'}`}>
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-2xl grid place-items-center ${i === 0 ? 'bg-brand-red' : 'bg-white'}`}><t.icon className={i === 0 ? 'text-white' : 'text-brand-red'} size={22} /></div>
                <span className={`text-[12px] font-medium rounded-full px-3 py-1 ${i === 0 ? 'bg-white/10 text-white/80' : 'bg-white text-brand-dark/60'}`}>{t.tag}</span>
              </div>
              <h2 className={`font-display font-semibold tracking-[-0.035em] text-[28px] leading-tight mt-auto pt-10 ${i === 0 ? 'text-white' : 'text-brand-dark'}`}>{t.title}</h2>
              <p className={`mt-3 text-[15px] leading-relaxed ${i === 0 ? 'text-white/60' : 'text-brand-dark/60'}`}>{t.body}</p>
              <span className="mt-7 flex items-center justify-between">
                <span className={`text-sm font-medium ${i === 0 ? 'text-white' : 'text-brand-dark'}`}>Explore {t.title}</span>
                <span className="w-9 h-9 rounded-full bg-brand-red text-white grid place-items-center group-hover:rotate-45 transition-transform duration-300"><ArrowUpRight size={16} /></span>
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="off" eyebrow="Where the data comes from" title="Data from Keepa and your own sheets."
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
