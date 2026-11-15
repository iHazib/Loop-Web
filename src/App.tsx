import { CTA, contactHref } from './components/CTA';
import { SitePage, PageHero, Section, CardGrid, Steps, Split, Figures, CTABand, WRAP } from './components/site/Page';

/* Home. One job: show a brand owner what we run, prove it with the dashboard, get the call booked. */

function HeroProof() {
  return (
    <div className="p-4 grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold">Brand Dashboard</span>
        <span className="text-[12px] text-muted">Example brand, last 4 weeks</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-canvas p-3">
          <p className="text-[12px] text-muted">Revenue</p>
          <p className="text-[22px] font-semibold tracking-[-0.02em] tnum">£47,820</p>
          <p className="text-[12px] font-medium text-success tnum">Up 12.4% on prior 4 weeks</p>
        </div>
        <div className="rounded-xl bg-canvas p-3">
          <p className="text-[12px] text-muted">Open protection cases</p>
          <p className="text-[22px] font-semibold tracking-[-0.02em] tnum">3</p>
          <p className="text-[12px] font-medium text-danger">1 high severity</p>
        </div>
      </div>
      <div className="flex items-start gap-2.5 rounded-xl border border-line p-3">
        <span className="text-[11px] font-semibold text-danger bg-red-tint rounded px-1.5 py-0.5 mt-0.5">High</span>
        <p className="text-[13px] leading-[18px]"><span className="font-medium">New seller on Oat Bites 500g</span><br /><span className="text-muted">QuickDeals Trading at £4.97, below your £5.49 minimum</span></p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Brand commerce partner for the UK"
        title="Your brand, run properly in the UK."
        lead="We sell your products on Amazon, TikTok Shop, eBay and your own store, keep unauthorised sellers off your listings, and report every number in one dashboard."
        ctas={<><CTA to={contactHref('strategy-call')} label="Book a strategy call" id="home-hero" /><CTA to="/portal/demo/home" label="Open the live demo" tone="outline-dark" id="home-hero-demo" /></>}
        image="shelves"
        imageAlt="Warehouse shelves stacked with boxed stock"
        aside={<HeroProof />}
      />

      <div className={`${WRAP} pb-10 md:pb-14`}>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-line pt-5">
          <span className="text-[13px] text-muted">Channels we run</span>
          {['Amazon UK', 'TikTok Shop', 'eBay', 'Temu', 'Shopify and own store'].map((c) => (
            <span key={c} className="text-[15px] font-semibold tracking-[-0.01em]">{c}</span>
          ))}
        </div>
      </div>

      <Section tone="panel" eyebrow="What we run" title="Pick one service or hand us the whole UK operation."
        lead="Every service runs on the same stock, the same data and the same dashboard, so adding the next one later is simple.">
        <CardGrid items={[
          { title: 'Marketplace Control', body: 'Listings, pricing, ads, stock and the Buy Box on Amazon, TikTok Shop, eBay and Temu, run day to day.', href: '/marketplace-control', image: 'analytics', imageAlt: 'Sales charts on a laptop screen' },
          { title: 'Brand Protection', body: 'Unauthorised sellers, grey market stock and price breaches found daily and taken down, with a 72 hour breach to notice target.', href: '/brand-protection', image: 'parcel', imageAlt: 'A taped cardboard parcel' },
          { title: 'DTC Growth', body: 'A UK direct store with GBP pricing, local stock, fast dispatch and returns handled under UK rules.', href: '/dtc-growth', image: 'phone', imageAlt: 'Someone browsing an online shop on a phone' },
          { title: 'Retail Expansion', body: 'Packaging, pricing, compliance and the buyer pitch, so you walk into UK chains and independents ready.', href: '/retail-expansion', image: 'team', imageAlt: 'A team reviewing figures in a meeting' },
          { title: 'UK Market Entry', body: 'VAT, product marking, labels, Brand Registry and the first stock order, sorted before your first UK sale.', href: '/uk-market-entry', image: 'port', imageAlt: 'Shipping containers stacked at a port' },
          { title: 'Fulfilment', body: 'Stock held in the UK, FBA prep and direct orders packed with barcode, weight and photo checks.', href: '/services', image: 'forklift', imageAlt: 'A forklift moving pallets in a warehouse' },
        ]} />
      </Section>

      <Section>
        <Split
          image="boxes"
          imageAlt="A pile of cardboard boxes sealed with blue tape"
          eyebrow="The seller problem"
          title="Every extra seller on your listing costs you price and trust."
          body={<>
            <p>Stock leaks out through distributors, clearance deals and trade accounts. Some of it comes back in from Europe with the wrong labels. Each new seller undercuts the last, the Buy Box moves, and your UK partners stop ordering.</p>
            <p>We map who is selling, at what price and from where, then close the gaps one seller at a time.</p>
          </>}
          points={['Authorised seller list checked every day', 'Minimum price breaches flagged with the gap in pounds', 'Test buys and Brand Registry reports when a seller will not stop']}
        >
          <div className="pt-2"><CTA to="/brand-protection" label="How we protect brands" tone="dark" id="home-seller" /></div>
        </Split>
      </Section>

      <Section tone="petrol" eyebrow="Tools" title="See your market the way we see it."
        lead="Every client gets a login. The numbers update daily from Keepa for Amazon UK, and from your weekly sheets for every other channel.">
        <CardGrid items={[
          { tag: 'Every client', title: 'Brand Dashboard', body: 'Sales by channel, ads, stock cover and rank in one place, with a weekly report you can save as a PDF.', href: '/tools/brand-dashboard' },
          { tag: 'Protection', title: 'Loop Protect', body: 'Who is on your listings, who is below your minimum price and which stock looks like grey market, emailed to your team.', href: '/tools/loop-protect' },
          { tag: 'Research', title: 'Competitor Analysis', body: 'Search any product to see who is cheaper, who is climbing in rank and which compatible listings went live this month.', href: '/tools/competitor-analysis' },
        ]} />
        <div className="mt-8"><CTA to="/portal/demo/home" label="Open the live demo" tone="light" id="home-tools-demo" /></div>
      </Section>

      <Section eyebrow="How it works" title="From first call to live sales in about 30 days."
        lead="The exact timing depends on stock, listings and compliance. This is the usual order of work.">
        <Steps steps={[
          { title: 'Audit', body: 'Products, channels, pricing, competitors, stock readiness and protection needs.', time: 'Days 1 to 7' },
          { title: 'Agree the model', body: 'Authorised partner or managed service, set by your stock and your goals.', time: 'Days 5 to 10' },
          { title: 'Set up', body: 'Stock received, listings built, minimum prices and seller rules loaded, team logins created.', time: 'Days 8 to 14' },
          { title: 'Go live', body: 'Selling on the channels we agreed, with daily data in your dashboard.', time: 'Days 15 to 28' },
          { title: 'Review and scale', body: 'First monthly review: what sells, what to fix, which channel comes next.', time: 'Day 30' },
        ]} />
        <div className="mt-6"><CTA to="/how-it-works" label="See the partnership models" tone="outline-dark" id="home-how" /></div>
      </Section>

      <Section tone="panel" eyebrow="What you can hold us to" title="Service levels you can check.">
        <Figures items={[
          { value: '72h', label: 'Breach to notice', note: 'From a confirmed price breach to the seller notice' },
          { value: 'Daily', label: 'Listing checks', note: 'Sellers, prices and Buy Box on Amazon UK' },
          { value: 'Weekly', label: 'Report to your team', note: 'Sales, ads, stock and protection in one PDF' },
          { value: '5', label: 'Channels run', note: 'Amazon UK, TikTok Shop, eBay, Temu, own store' },
        ]} />
      </Section>

      <CTABand title="Let's map your UK opportunity." body="One call. We tell you which model fits, which channels to start with and what to fix first." topic="strategy-call" secondary={{ to: '/portal/demo/home', label: 'Open the live demo' }} />
    </SitePage>
  );
}
