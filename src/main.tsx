import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import MarketplaceControl from './pages/MarketplaceControl.tsx';
import BrandProtection from './pages/BrandProtection.tsx';
import RetailExpansion from './pages/RetailExpansion.tsx';
import DTCGrowth from './pages/DTCGrowth.tsx';
import Blog from './pages/Blog.tsx';
import BlogPost from './pages/BlogPost.tsx';
import Contact from './pages/Contact.tsx';
import AdminLayout from './admin/AdminLayout.tsx';
import AdminDashboard from './admin/AdminDashboard.tsx';
import AdminPosts from './admin/AdminPosts.tsx';
import AdminPostEditor from './admin/AdminPostEditor.tsx';
import AdminInbox from './admin/AdminInbox.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/marketplace-control" element={<MarketplaceControl />} />
        <Route path="/brand-protection" element={<BrandProtection />} />
        <Route path="/retail-expansion" element={<RetailExpansion />} />
        <Route path="/dtc-growth" element={<DTCGrowth />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="posts/new" element={<AdminPostEditor />} />
          <Route path="posts/:id" element={<AdminPostEditor />} />
          <Route path="inbox" element={<AdminInbox />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
