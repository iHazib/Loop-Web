import { CTA, contactHref } from './components/CTA';
import { SitePage, Section, Split, CardGrid, Figures, CTABand } from './components/site/Page';
import { HomeHero, ChannelsSection, MotionSuite, ToolsPreview, AuditToPilot, NumbersLoop, GrowthEngine } from './components/home/Home';

/* Home. One job: show a brand owner what we run, prove it with the dashboard, get the call booked. */

export default function App() {
  return (
    <SitePage>
      <HomeHero />

      <ChannelsSection />

      <MotionSuite />

      <Section>
        <Split
          image="amazon"
          imageAlt="Two Amazon shipping boxes"
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
        <ToolsPreview dark />
        <div className="mt-8"><CTA to="/portal/demo/home" label="Open the live demo" tone="light" id="home-tools-demo" /></div>
      </Section>

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
