import { CTA, contactHref } from '../components/CTA';
import { SitePage, PageHero, Section, CardGrid, Steps, Figures, Compare, Split, FAQ, CTABand, Related, Note } from '../components/site/Page';

/* DTC Growth: a UK direct store that feels local, run from UK stock. */

function OrderProof() {
  const steps = [
    ['Order placed', 'On your UK store, priced in GBP', '09:14'],
    ['Picked and packed', 'From UK stock, barcode and weight checked', '11:02'],
    ['Dispatched', 'Tracked UK carrier', '15:30'],
    ['Delivered', 'Review request sent', 'Next day'],
  ];
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2"><span className="text-[13px] font-semibold">Order #10482</span><span className="text-[12px] text-muted">Example order</span></div>
      <ol className="grid">
        {steps.map(([t, d, time], i) => (
          <li key={t} className="grid grid-cols-[16px_1fr_auto] gap-3 py-2 border-t border-line first:border-0">
            <span className={`mt-1 w-2.5 h-2.5 rounded-full ${i < 3 ? 'bg-success' : 'bg-control'}`} aria-hidden="true" />
            <span className="text-[13px] leading-[18px]"><span className="font-medium">{t}</span><br /><span className="text-muted">{d}</span></span>
            <span className="text-[12px] text-muted tnum">{time}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function DTCGrowth() {
  return (
    <SitePage>
      <PageHero
        crumb={{ label: 'Services', to: '/services' }}
        eyebrow="DTC Growth"
        title="A UK direct store that feels local from the first order."
        lead="UK pricing, UK stock, quick dispatch and returns handled under UK rules. You own the brand and the customer data; we run the store day to day."
        ctas={<><CTA to={contactHref('dtc')} label="Get a free D2C audit" id="dtc-hero" /><CTA to="/portal/demo/channels" label="See D2C reporting" tone="outline-dark" id="dtc-hero-demo" /></>}
        image="shopify"
        imageAlt="A Shopify store open on a laptop"
        aside={<OrderProof />}
      />

      <Section tone="panel" eyebrow="The UK shopper" title="UK customers already buy online. They buy from brands that feel local.">
        <Figures items={[
          { value: '28.3%', label: 'Retail sales made online', note: 'December 2025' },
          { value: '11.1%', label: 'Growth in online sales value', note: 'Year on year, December 2025' },
          { value: '4.2bn', label: 'Parcels delivered in the UK', note: '2024 to 2025' },
          { value: '7.1%', label: 'Growth in parcel volumes', note: 'Year on year' },
        ]} />
      </Section>

      <Section eyebrow="Trust" title="What a UK shopper checks before paying.">
        <Compare
          columns={['Your store with Loopretail', 'A store shipping from abroad']}
          rows={[
            { label: 'Prices', cells: ['GBP, VAT included', 'Converted at checkout'] },
            { label: 'Delivery', cells: ['From UK stock, tracked', 'Days or weeks, customs risk'] },
            { label: 'Returns', cells: ['UK address, 14 day cancellation handled', 'Return abroad at the customer\'s cost'] },
            { label: 'Support', cells: ['UK contact route', 'Email in another time zone'] },
            { label: 'Checkout', cells: ['Local payment options', 'Card only'] },
          ]}
        />
      </Section>

      <Section tone="panel" eyebrow="What we run" title="Everything behind the order.">
        <CardGrid cols={3} items={[
          { title: 'Store setup or localisation', body: 'UK pages, GBP pricing, local product content, compliance copy and checkout on Shopify.' },
          { title: 'Stock holding', body: 'Your inventory held in the UK so orders leave quickly, with no cross border delay.' },
          { title: 'Pick, pack and dispatch', body: 'Barcode, weight and photo checks on every order before it leaves.' },
          { title: 'Returns', body: 'UK distance selling rules handled properly, including the 14 day cancellation right.' },
          { title: 'Customer service', body: 'A UK contact route so customers know who to talk to.' },
          { title: 'Reporting', body: 'Revenue, conversion, repeat customers and cost per new customer in your dashboard every week.' },
        ]} />
        <Note>UK customers can cancel an online order up to 14 days after delivery. If that right is not explained properly, it can extend. We set this up correctly on your store.</Note>
      </Section>

      <Section>
        <Split
          image="loading"
          imageAlt="Boxes being loaded into a delivery van"
          eyebrow="Why start direct"
          title="Your D2C store is your first UK market test."
          body={<p>Real UK orders show what sells, at what price and to whom. That data is what marketplace partners and retail buyers ask for.</p>}
          points={['Proof of demand from real orders, not forecasts', 'Evidence that makes a retail listing less risky for the buyer', 'A customer list you own']}
        />
      </Section>

      <Section tone="panel" eyebrow="Path" title="From first UK order to retail ready.">
        <Steps steps={[
          { title: 'Test the market', body: 'Launch a localised store with UK fulfilment and a small range.', time: 'Months 1 to 3' },
          { title: 'Run and learn', body: 'We run the store day to day; you see what sells each week.', time: 'Months 3 to 6' },
          { title: 'Expand', body: 'Use the data to add marketplaces and approach retail buyers.', time: 'From month 6' },
        ]} />
      </Section>

      <Section eyebrow="Questions" title="D2C FAQ">
        <FAQ items={[
          { q: 'Do we need a UK company to run a UK store?', a: 'Not always. Many brands sell through their home company. Your accountant decides the VAT side; we set up the store and operations to match.' },
          { q: 'Can you work with our existing Shopify store?', a: 'Yes. We can localise your current store for the UK or set up a separate UK storefront.' },
          { q: 'Who owns the customer data?', a: 'You do. The store, the domain and the customer list stay yours.' },
          { q: 'How fast can orders ship?', a: 'From UK stock, most orders can leave the warehouse the day they are placed when stock and cut off times allow.' },
        ]} />
      </Section>

      <CTABand title="Launch in the UK without a UK office." body="Send us your store link. We reply with what to change for UK shoppers and what it takes to run it." topic="dtc" label="Get a free D2C audit" />
      <Related links={[
        { to: '/uk-market-entry', label: 'UK Market Entry', body: 'Tax, compliance and first stock.' },
        { to: '/marketplace-control', label: 'Marketplace Control', body: 'Add Amazon and TikTok Shop.' },
        { to: '/retail-expansion', label: 'Retail Expansion', body: 'Take the proof to retail buyers.' },
      ]} />
    </SitePage>
  );
}
