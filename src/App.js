import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";


import Home from './pages/index';
import AboutPage from './pages/about';
import Projects from './pages/projects';
import ProjectPage from './components/ProjectPost'; // Import the ProjectPage component
import { Navbar, Footer } from './components';
import { NotFound } from './components';
import Blogs from './pages/blog'; // Import the Blogs component
import BlogPostPage from './components/BlogPost'; // Import the BlogPostPage component
import CVPage from './pages/cv'; // Import the CVPage component

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/blog" element={<Blogs />} /> {/* Add this line */}
        <Route path="/projects/:slug" element={<ProjectPage />} /> {/* Add this line */}
        <Route path="/blog/:slug" element={<BlogPostPage />} /> {/* Add this line */}
        <Route path="/curriculum-vitae" element={<CVPage />} /> {/* Add this line */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
