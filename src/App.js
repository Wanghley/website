import './App.css';
import './components/css/global.css';
import { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { usePostHog } from '@posthog/react';

// Eagerly import the shell — Navbar/Footer/Home must be fast on first paint
import Home from './pages/index';
import { Navbar, Footer, NotFound } from './components';

// Route-level code splitting — heavy deps (mermaid, katex, syntax-highlighter,
// chart.js, vidstack, etc.) are isolated to their routes and never downloaded
// unless the user navigates there.
const AboutPage    = lazy(() => import('./pages/about'));
const Projects     = lazy(() => import('./pages/projects'));
const ProjectPage  = lazy(() => import('./components/ProjectPost'));
const Blogs        = lazy(() => import('./pages/blog'));
const BlogPostPage = lazy(() => import('./components/BlogPost'));
const CVPage       = lazy(() => import('./pages/cv'));
const ContactPage  = lazy(() => import('./pages/contact'));
const Privacy      = lazy(() => import('./pages/privacy'));
const DataPolicy   = lazy(() => import('./pages/data-policy'));

// Minimal full-screen fallback while a lazy chunk loads
const PageLoader = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', letterSpacing: '0.18em', color: '#3AAFF1', textTransform: 'uppercase' }}>
      LOADING...
    </span>
  </div>
);

function PostHogPageView() {
  const location = useLocation();
  const posthog = usePostHog();
  useEffect(() => {
    posthog?.capture('$pageview', { $current_url: window.location.href });
  }, [location.pathname, posthog]);
  return null;
}

function App() {
  return (
    <Router>
      <PostHogPageView />
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<Blogs />} />
          <Route path="/projects/:slug" element={<ProjectPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/curriculum-vitae" element={<CVPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/data-policy" element={<DataPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </Router>
  );
}

export default App;
