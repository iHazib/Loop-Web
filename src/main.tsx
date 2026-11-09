import { StrictMode, Suspense, lazy, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import App from './App.tsx';
const MarketplaceControl = lazy(() => import('./pages/MarketplaceControl.tsx'));
const BrandProtection = lazy(() => import('./pages/BrandProtection.tsx'));
const RetailExpansion = lazy(() => import('./pages/RetailExpansion.tsx'));
const DTCGrowth = lazy(() => import('./pages/DTCGrowth.tsx'));
const Blog = lazy(() => import('./pages/Blog.tsx'));
const BlogPost = lazy(() => import('./pages/BlogPost.tsx'));
const Contact = lazy(() => import('./pages/Contact.tsx'));
const About = lazy(() => import('./pages/About.tsx'));
const AdminLayout = lazy(() => import('./admin/AdminLayout.tsx'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard.tsx'));
const AdminPosts = lazy(() => import('./admin/AdminPosts.tsx'));
const AdminPostEditor = lazy(() => import('./admin/AdminPostEditor.tsx'));
const AdminInbox = lazy(() => import('./admin/AdminInbox.tsx'));
const Portal = lazy(() => import('./portal/Portal.tsx'));
const Services = lazy(() => import('./pages/Services.tsx'));
const Tools = lazy(() => import('./pages/Tools.tsx'));
const ToolDashboard = lazy(() => import('./pages/ToolDashboard.tsx'));
const ToolLoopProtect = lazy(() => import('./pages/ToolLoopProtect.tsx'));
const ToolCompetitorAnalysis = lazy(() => import('./pages/ToolCompetitorAnalysis.tsx'));
const UKMarketEntry = lazy(() => import('./pages/UKMarketEntry.tsx'));
const HowItWorks = lazy(() => import('./pages/HowItWorks.tsx'));
const PortalLogin = lazy(() => import('./portal/AuthPages.tsx').then((m) => ({ default: m.PortalLogin })));
const PortalInvite = lazy(() => import('./portal/AuthPages.tsx').then((m) => ({ default: m.PortalInvite })));
const Report = lazy(() => import('./portal/Report.tsx'));
import './index.css';

/* Browser tab title per route. */
const TITLES: [RegExp, string][] = [
  [/^\/$/, 'Loopretail | UK brand growth and protection'],
  [/^\/services/, 'Services | Loopretail'],
  [/^\/tools\/brand-dashboard/, 'Brand Dashboard | Loopretail'],
  [/^\/tools\/loop-protect/, 'Loop Protect | Loopretail'],
  [/^\/tools\/competitor-analysis/, 'Competitor Analysis | Loopretail'],
  [/^\/tools/, 'Tools | Loopretail'],
  [/^\/marketplace-control/, 'Marketplace Control | Loopretail'],
  [/^\/brand-protection/, 'Brand Protection | Loopretail'],
  [/^\/retail-expansion/, 'Retail Expansion | Loopretail'],
  [/^\/dtc-growth/, 'DTC Growth | Loopretail'],
  [/^\/uk-market-entry/, 'UK Market Entry | Loopretail'],
  [/^\/how-it-works/, 'How It Works | Loopretail'],
  [/^\/about/, 'About | Loopretail'],
  [/^\/blog/, 'Blog | Loopretail'],
  [/^\/contact/, 'Contact | Loopretail'],
  [/^\/portal/, 'Brand Dashboard | Loopretail'],
  [/^\/admin/, 'Admin | Loopretail'],
];
function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = TITLES.find(([re]) => re.test(pathname))?.[1] ?? 'Loopretail';
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
const Fallback = () => <div className="min-h-screen bg-white" />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <RouteEffects />
      <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/marketplace-control" element={<MarketplaceControl />} />
        <Route path="/brand-protection" element={<BrandProtection />} />
        <Route path="/retail-expansion" element={<RetailExpansion />} />
        <Route path="/dtc-growth" element={<DTCGrowth />} />
        <Route path="/services" element={<Services />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/tools/brand-dashboard" element={<ToolDashboard />} />
        <Route path="/tools/loop-protect" element={<ToolLoopProtect />} />
        <Route path="/tools/competitor-analysis" element={<ToolCompetitorAnalysis />} />
        <Route path="/uk-market-entry" element={<UKMarketEntry />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/portal/login" element={<PortalLogin />} />
        <Route path="/portal/invite/:token" element={<PortalInvite />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/portal/:brandId/report" element={<Report />} />
        <Route path="/portal/:brandId" element={<Portal />} />
        <Route path="/portal/:brandId/:tab" element={<Portal />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="posts/new" element={<AdminPostEditor />} />
          <Route path="posts/:id" element={<AdminPostEditor />} />
          <Route path="inbox" element={<AdminInbox />} />
        </Route>
      </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
