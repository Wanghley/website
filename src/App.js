import './App.css';
import './components/css/global.css';
import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { usePostHog } from '@posthog/react';


import Home from './pages/index';
import AboutPage from './pages/about';
import Projects from './pages/projects';
import ProjectPage from './components/ProjectPost'; // Import the ProjectPage component
import { Navbar, Footer } from './components';
import { NotFound } from './components';
import Blogs from './pages/blog'; // Import the Blogs component
import BlogPostPage from './components/BlogPost'; // Import the BlogPostPage component
import CVPage from './pages/cv';
import ContactPage from './pages/contact';
import Privacy from './pages/privacy';
import DataPolicy from './pages/data-policy';

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
      <Footer />
    </Router>
  );
}

export default App;
