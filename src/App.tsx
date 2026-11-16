import { CTA, contactHref } from './components/CTA';
import { SitePage, Section, Split } from './components/site/Page';
import { HomeHero, ChannelLogos, MotionSuite, ToolsShowcase, AuditToPilot, NumbersLoop, GrowthEngine } from './components/home/Home';

/* Home. One job: show a brand owner what we run, prove it with the dashboard, get the call booked. */

export default function App() {
  return (
    <SitePage>
      <HomeHero />
      <ChannelLogos />
      <MotionSuite />
      <Section>
        <Split
          image="shelves"
          imageAlt="Warehouse racking stacked with boxed stock"
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

      <ToolsShowcase />
      <AuditToPilot />
      <NumbersLoop />
      <GrowthEngine />
    </SitePage>
  );
}
