import './App.css';
import './components/css/global.css';
import './components/css/bench-page.css';
import { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { usePostHog } from './lib/analytics';
import LenisRoot, { useLenis } from './lib/LenisRoot';

// Eagerly import the shell — Navbar/Footer/Home must be fast on first paint
import Home from './pages/index';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotFound from './components/NotFound';

// Route-level code splitting — heavy deps (mermaid, katex, syntax-highlighter,
// vidstack, etc.) are isolated to their routes and never downloaded
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
const Styleguide   = lazy(() => import('./pages/styleguide'));
const BenchCapture = lazy(() => import('./pages/benchcapture'));

// Minimal full-screen fallback while a lazy chunk loads
const PageLoader = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ fontFamily: 'var(--font-mono-bench)', fontSize: '0.72rem', letterSpacing: '0.18em', color: 'var(--signal)', textTransform: 'uppercase' }}>
      LOADING...
    </span>
  </div>
);

function ScrollToTop() {
  const { pathname } = useLocation();
  const lenis = useLenis();
  useEffect(() => {
    if (lenis) {
      // Lenis owns scroll position now — a bare window.scrollTo would fight
      // its smoothing loop and the page would appear to snap back.
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenis]);
  return null;
}

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
      <LenisRoot>
        <ScrollToTop />
        <PostHogPageView />
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Navbar />
        <div id="main-content" tabIndex={-1} style={{ outline: 'none' }}>
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
            <Route path="/styleguide" element={<Styleguide />} />
            <Route path="/__capture" element={<BenchCapture />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </div>
        <Footer />
      </LenisRoot>
    </Router>
  );
}

export default App;
