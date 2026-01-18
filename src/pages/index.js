import React, { lazy, Suspense } from "react";
import { Hero, About, Contact, Skills, GridFeatured, GridFeaturedBlog } from '../components';
import { Helmet } from "react-helmet-async"; // Changed from react-helmet
import './css/home.css';

const BlogPost = lazy(() => import('../components/BlogPost'));

const Home = () => {
    return (
        <div className="home-page">
            <Helmet>
                <title>Wanghley – Sci & Tech | Engineer, Entrepreneur, Innovator</title>
                <meta name="description" content="Wanghley is a tech innovator and engineer passionate about AI, health tech, and social impact. Explore projects, blog posts, and more." />
                <meta name="keywords" content="Wanghley, Engineer, AI, Health Tech, Duke University, Portfolio, Projects" />
                <link rel="canonical" href="https://wanghley.com/" />
                <meta name="author" content="Wanghley" />
                <meta name="robots" content="index, follow" />

                <meta property="og:title" content="Wanghley – Sci & Tech" />
                <meta property="og:description" content="Discover Wanghley's journey, skills, and experiences. Learn more about the person behind the projects." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://wanghley.com/" />
                <meta property="og:image" content="https://res.cloudinary.com/wanghley/image/upload/v1746648815/branding/logo_applied_sq.png" />
                <meta property="og:site_name" content="Wanghley – Sci & Tech" />
                <meta property="og:locale" content="en_US" />
            </Helmet>
            
            <Hero />
            
            <About />
            
            <Skills />
            
            <section className="home-section home-section--projects">
                <GridFeatured />
            </section>
            
            <section className="home-section home-section--blog">
                <GridFeaturedBlog />
            </section>
            
            <Contact />
        </div>
    );
};

export default Home;