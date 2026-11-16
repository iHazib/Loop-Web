import { CTA, contactHref } from '../components/CTA';
import { SitePage, PageHero, Section, CardGrid, Steps, Split, Compare, FAQ, CTABand, Related } from '../components/site/Page';

function ListingProof() {
  const rows: [string, string, string, string][] = [
    ['Loopretail (authorised)', '£5.49', 'FBA', 'Buy Box'],
    ['QuickDeals Trading', '£4.97', 'FBA', 'Below minimum'],
    ['Global Supply Hub', '£5.20', 'Merchant', 'Not authorised'],
  ];
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3"><span className="text-[13px] font-semibold">Sellers on Oat Bites 500g</span><span className="text-[12px] text-muted">Amazon UK, today</span></div>
      <table className="w-full text-[13px]">
        <tbody>
          {rows.map(([s, p, f, st], i) => (
            <tr key={s} className="border-t border-line first:border-0">
              <td className="py-2 pr-2 font-medium">{s}</td>
              <td className="py-2 pr-2 tnum">{p}</td>
              <td className="py-2 pr-2 text-muted">{f}</td>
              <td className="py-2 text-right"><span className={`text-[11px] font-semibold rounded px-1.5 py-0.5 ${i === 0 ? 'bg-sunken text-success' : 'bg-red-tint text-danger'}`}>{st}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MarketplaceControl() {
  return (
    <SitePage>
      <PageHero
        crumb={{ label: 'Services', to: '/services' }}
        eyebrow="Marketplace Control"
        title="Own your listings, your price and your sellers."
        lead="We run Amazon, TikTok Shop, eBay and Temu for you: listings, pricing, ads, stock and the Buy Box. One accountable operator instead of a crowd of resellers."
        ctas={<><CTA to={contactHref('marketplace-audit')} label="Get a marketplace audit" id="mc-hero" /><CTA to="/portal/demo/channels" label="See the channel view" tone="outline-dark" id="mc-hero-demo" /></>}
        image="amazon"
        imageAlt="Two Amazon shipping boxes"
        aside={<ListingProof />}
      />

      <Section tone="panel" eyebrow="What we control" title="Five things decide who wins a marketplace listing."
        lead="We take ownership of all five, on every channel we run for you.">
        <CardGrid cols={3} items={[
          { title: 'Pricing', body: 'Your minimum advertised price applied on every listing and every channel, checked daily.' },
          { title: 'Listings', body: 'Titles, images, A+ content and keywords written for how UK shoppers search.' },
          { title: 'Stock', body: 'Demand forecasts and inbound plans so you never lose rank to a stock out.' },
          { title: 'Sellers', body: 'Unauthorised sellers found and removed before they undercut your price.' },
          { title: 'Competitors', body: 'Every lookalike and compatible product built on your demand, with its price, rank and growth.' },
          { title: 'Ads', body: 'Sponsored Products and TikTok campaigns managed to a target ACoS you set.' },
        ]} />
      </Section>

      <Section>
        <Split
          image="stacked"
          imageAlt="Cardboard boxes and packaging supplies in a stockroom"
          eyebrow="The seller problem"
          title="Three kinds of seller erode a listing."
          body={<p>Each one takes the Buy Box at a lower price and leaves your brand with the reviews. We identify which kind you have before deciding how to deal with it.</p>}
          points={['Grey market stock: genuine product brought in from outside the UK without permission', 'Lookalikes: a near copy sold on your listing as if it were yours', 'Hijackers: sellers who join your listing with unrelated or poor stock']}
        />
      </Section>

      <Section tone="panel" eyebrow="Before and after" title="Same demand. Fewer sellers. A price that holds.">
        <Compare
          columns={['With Loopretail', 'Without an operator']}
          rows={[
            { label: 'Sellers on your main listings', cells: ['One authorised seller, plus partners you approve', 'Anyone who can buy your stock'] },
            { label: 'Price', cells: ['Held at or above your minimum', 'Set by whoever wants to clear stock'] },
            { label: 'Buy Box', cells: ['Held by the authorised seller', 'Rotates between resellers'] },
            { label: 'Listing content', cells: ['Controlled and kept consistent', 'Edited by any seller'] },
            { label: 'Reporting', cells: ['Daily dashboard and weekly report', 'None'] },
          ]}
        />
      </Section>

      <Section eyebrow="Getting started" title="How we take over a marketplace.">
        <Steps steps={[
          { title: 'Map', body: 'Every seller, listing and pricing gap across the channels you sell on.', time: 'Week 1' },
          { title: 'Fix', body: 'Clean pricing, rewritten content and a stock plan agreed with you.', time: 'Weeks 2 to 3' },
          { title: 'Launch', body: 'Live on the first channels with an ad plan and daily monitoring.', time: 'Week 4' },
          { title: 'Run', body: 'Active management, weekly reports and a monthly review against targets.', time: 'Ongoing' },
        ]} />
      </Section>

      <Section tone="panel" eyebrow="Questions" title="Marketplace Control FAQ">
        <FAQ items={[
          { q: 'Do we keep our own seller account?', a: 'Your choice. In the authorised partner model we sell from our account; in the managed model we run yours.' },
          { q: 'Which channels do you cover?', a: 'Amazon UK, TikTok Shop, eBay and Temu, plus your own Shopify store. We start with the channel where your category already sells.' },
          { q: 'Can you remove every other seller?', a: 'We remove sellers who break your distribution terms or sell grey market or non genuine stock. Sellers with a legitimate right to resell are handled through pricing and supply agreements instead.' },
          { q: 'What does it cost?', a: 'Either a margin on agreed trade terms or a monthly fee, set after the audit shows what the work involves.' },
        ]} />
      </Section>

      <CTABand title="Find out who is selling your products today." body="Send us your ASINs. We come back with the seller list, price gaps and the first fixes." topic="marketplace-audit" label="Get a marketplace audit" />
      <Related links={[
        { to: '/brand-protection', label: 'Brand Protection', body: 'Unauthorised sellers and grey stock.' },
        { to: '/tools/competitor-analysis', label: 'Competitor Analysis', body: 'Who is cheaper and who is growing.' },
        { to: '/how-it-works', label: 'How it works', body: 'Partnership models and onboarding.' },
      ]} />
    </SitePage>
  );
}
