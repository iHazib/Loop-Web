import { CTA, contactHref } from './components/CTA';
import { SitePage, PageHero, Section, CardGrid, Split, Figures, CTABand } from './components/site/Page';
import { ChannelLogos, LoopSection, MotionSuite, ToolsPreview, AuditToPilot, NumbersLoop, GrowthEngine } from './components/home/Home';

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
        imageAlt="Warehouse racking stacked with boxed stock"
        aside={<HeroProof />}
      />

      <ChannelLogos />

      {/* Replaces the "Pick a service" section */}
      <MotionSuite />

      <LoopSection />

      <Section>
        <Split
          image="boxes"
          imageAlt="Parcels stacked in the back of a delivery van"
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

      <Section tone="panel" eyebrow="Tools" title="See your market the way we see it."
        lead="Every client gets a login. The numbers update daily from Keepa for Amazon UK, and from your weekly sheets for every other channel.">
        <CardGrid items={[
          { tag: 'Every client', title: 'Brand Dashboard', body: 'Sales by channel, ads, stock cover and rank in one place, with a weekly report you can save as a PDF.', href: '/tools/brand-dashboard' },
          { tag: 'Protection', title: 'Loop Protect', body: 'Who is on your listings, who is below your minimum price and which stock looks like grey market, emailed to your team.', href: '/tools/loop-protect' },
          { tag: 'Research', title: 'Competitor Analysis', body: 'Search any product to see who is cheaper, who is climbing in rank and which compatible listings went live this month.', href: '/tools/competitor-analysis' },
        ]} />
        <ToolsPreview />
        <div className="mt-8"><CTA to="/portal/demo/home" label="Open the live demo" tone="dark" id="home-tools-demo" /></div>
      </Section>

      {/* Replaces "From first call to live sales" */}
      <AuditToPilot />

      <Section tone="panel" eyebrow="What you can hold us to" title="Service levels you can check.">
        <Figures items={[
          { value: '72h', label: 'Breach to notice', note: 'From a confirmed price breach to the seller notice' },
          { value: 'Daily', label: 'Listing checks', note: 'Sellers, prices and Buy Box on Amazon UK' },
          { value: 'Weekly', label: 'Report to your team', note: 'Sales, ads, stock and protection in one PDF' },
          { value: '5', label: 'Channels run', note: 'Amazon UK, TikTok Shop, eBay, Temu, own store' },
        ]} />
      </Section>

      <NumbersLoop />

      <GrowthEngine />

      <CTABand title="Let's map your UK opportunity." body="One call. We tell you which model fits, which channels to start with and what to fix first." topic="strategy-call" secondary={{ to: '/portal/demo/home', label: 'Open the live demo' }} />
    </SitePage>
  );
}
