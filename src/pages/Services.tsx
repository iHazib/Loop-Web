import { SitePage, PageHero, Section, CardGrid, Steps, Compare, CTABand, Related } from '../components/site/Page';
import { CTA, contactHref } from '../components/CTA';

const services = [
  {
    tag: 'Service 01', title: 'Marketplace Control', href: '/marketplace-control',
    body: 'We run your Amazon, TikTok Shop, eBay and Temu presence as one operation: listings, pricing, stock and sellers.',
    points: ['Listing build and optimisation', 'Price and Buy Box management', 'Stock planning so you never lose rank', 'Advertising on every channel'],
  },
  {
    tag: 'Service 02', title: 'Brand Protection', href: '/brand-protection',
    body: 'Unauthorised sellers, grey stock, lookalikes and listing hijacks found early and removed with evidence.',
    points: ['Daily seller and price monitoring', 'Evidence packs and test buys', 'Brand Registry and IP reports', 'Authorised reseller programme'],
  },
  {
    tag: 'Service 03', title: 'Competitor Analysis', href: '/tools/competitor-analysis',
    body: 'Every competitor and "compatible with" copy tracked by product: price, rank, reviews and growth.',
    points: ['Competitor sets per product', 'Price position and Buy Box share', 'Fastest climbing rivals', 'Compatible product watch'],
  },
  {
    tag: 'Service 04', title: 'DTC Growth', href: '/dtc-growth',
    body: 'A UK direct channel that feels local: store, stock, same day dispatch, returns and customer service.',
    points: ['Shopify or WooCommerce setup', 'UK stock holding', 'Returns under UK rules', 'Google and Meta ads'],
  },
  {
    tag: 'Service 05', title: 'Retail Expansion', href: '/retail-expansion',
    body: 'Turn marketplace and DTC demand into the evidence UK retail buyers need, then get the range buyer ready.',
    points: ['Retailer fit and targeting', 'Buyer packs built on real UK sales', 'Wholesale and distribution', 'Retail ready packaging checks'],
  },
  {
    tag: 'Service 06', title: 'UK Market Entry', href: '/uk-market-entry',
    body: 'For overseas brands: the checklist between "we want the UK" and the first order shipping on time.',
    points: ['VAT and marketplace setup coordination', 'Product safety and labelling checks', 'Trademark and Brand Registry route', 'Inbound freight and FBA prep'],
  },
];

const fulfilment = [
  { title: 'Inbound and storage', body: 'Goods received, checked and stored in the UK, ready for FBA, marketplaces and DTC.' },
  { title: 'Pick, pack and dispatch', body: 'Barcode checks, weight checks and same day dispatch for orders placed before cut off.' },
  { title: 'FBA prep', body: 'Labelling, cartonisation and shipment plans built to Amazon requirements.' },
  { title: 'Returns', body: 'Returns graded, restocked or written off, with reasons fed back into product and listing fixes.' },
];

export default function Services() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Services · Loop Retail"
        tag="One operating model"
        title={<><span className="font-light text-white/50">Everything a brand needs</span><br />to sell in the UK. In one place.</>}
        lead="Most brands piece together a marketplace agency, a 3PL, a protection vendor and a DTC freelancer. We run all of it as one connected operation, measured in one dashboard."
        ctas={<><CTA to={contactHref('strategy-call')} label="Book a strategy call" tone="red" id="services-hero" /><CTA to="/how-it-works" label="See how it works" tone="outline-light" id="services-hero-how" /></>}
        meta={[{ k: 'Channels', v: 'Amazon, TikTok, eBay, Temu' }, { k: 'Direct', v: 'Shopify, WooCommerce' }, { k: 'Retail', v: 'UK wholesale and retail' }, { k: 'Reporting', v: 'Live brand dashboard' }]}
      />

      <Section eyebrow="What we do" title={<>Six services.<br />One team running them.</>}
        lead="Take one service or all of them. Each one plugs into the same stock, the same data and the same people, so nothing falls between suppliers.">
        <CardGrid items={services} />
      </Section>

      <Section tone="dark" eyebrow="Fulfilment and operations" title={<>The physical side,<br />handled in the UK.</>}
        lead="Every service above sits on our own UK operation, so a sale on any channel ships from the same stock.">
        <CardGrid items={fulfilment} cols={4} dark />
      </Section>

      <Section tone="off" eyebrow="Why one partner" title="What changes when it is all connected."
        lead="The same problems keep appearing when channels are run by different suppliers. This is how a single operating model compares.">
        <Compare
          columns={['Loop Retail', 'Separate agencies', 'Distributor', 'Doing it in house']}
          rows={[
            { label: 'Marketplaces, DTC and retail in one plan', cells: [true, false, 'Retail mainly', 'If you hire for it'] },
            { label: 'Brand protection built in', cells: [true, 'Extra vendor', false, 'Manual'] },
            { label: 'UK stock and fulfilment', cells: [true, 'Extra 3PL', true, 'Extra 3PL'] },
            { label: 'Live dashboard across channels', cells: [true, 'Per agency reports', false, 'Spreadsheets'] },
            { label: 'You keep control of price and brand', cells: [true, true, 'Often limited', true] },
            { label: 'One contact, one monthly review', cells: [true, false, true, true] },
          ]}
        />
      </Section>

      <Section eyebrow="How we start" title="From first call to live in the UK.">
        <Steps steps={[
          { title: 'Audit', body: 'We review your listings, prices, sellers, stock and compliance across UK channels and show where revenue and control are leaking.', time: 'Week 1' },
          { title: 'Plan', body: 'A channel plan with priorities, stock levels, pricing rules and the protection set up your brand needs.', time: 'Week 2' },
          { title: 'Onboard', body: 'Stock lands, listings go live, your authorised seller list and minimum prices are loaded into Loop Protect.', time: 'Weeks 3 to 4' },
          { title: 'Run and report', body: 'Weekly operations, a live dashboard and a monthly review on growth, margin and protection.', time: 'Ongoing' },
        ]} />
      </Section>

      <CTABand title={<>Tell us where you sell today.</>} body="We will come back with a practical opportunity map for the UK: which channels first, what to fix, and what it takes." topic="strategy-call" secondary={{ to: '/portal/demo/overview', label: 'See the live dashboard demo' }} />
      <Related links={[
        { to: '/tools', label: 'Our tools', body: 'Brand dashboard, Loop Protect and competitor analysis.' },
        { to: '/how-it-works', label: 'How it works', body: 'Partnership models, onboarding and reporting.' },
        { to: '/uk-market-entry', label: 'UK market entry', body: 'What overseas brands need before the first UK sale.' },
      ]} />
    </SitePage>
  );
}
