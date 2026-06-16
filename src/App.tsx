/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Hero } from './components/Hero';
import { Platforms } from './components/Platforms';
import { ProductSuite } from './components/ProductSuite';
import { GlobalPresence } from './components/GlobalPresence';
import { FeatureCards } from './components/FeatureCards';
import { DashboardSection } from './components/Dashboard';
import { ImpactSection } from './components/Impact';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <main className="w-full min-h-screen bg-white selection:bg-brand-red/30 selection:text-brand-dark font-sans shadow-xl">
      <Hero />
      <Platforms />
      <ProductSuite />
      <GlobalPresence />
      
      <FeatureCards />
      <DashboardSection />
      <ImpactSection />
      <Contact />
      <Footer />
    </main>
  );
}
