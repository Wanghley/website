import React from "react";
import { Navbar, Hero, About, Timeline, Contact, Skills,Footer, WhyMe, GridFeatured,GridFeaturedBlog } from '../components'
import { Helmet } from "react-helmet"; 

const Home = () => {
    return (
        <>
        <Helmet>
            <title>Wanghley – Sci&Tech</title>
            <meta name="description" content="Discover Wanghley's journey, skills, and experiences. Learn more about the person behind the projects." />
            <meta name="keywords" content="Wanghley, Sci&Tech, Portfolio, Projects, Skills, Experience" />
            <link rel="canonical" href="https://wanghley.com/" />
            <meta name="author" content="Wanghley" />
            <meta name="robots" content="index, follow" />

            <meta property="og:title" content="Wanghley – Sci&Tech" />
            <meta property="og:description" content="Discover Wanghley's journey, skills, and experiences. Learn more about the person behind the projects." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://wanghley.com/" />
            <meta property="og:image" content="https://res.cloudinary.com/wanghley/image/upload/v1746648815/branding/logo_applied_sq.png" />
            <meta property="og:site_name" content="Wanghley – Sci&Tech" />
            <meta property="og:locale" content="en_US" />
            <meta property="og:locale:alternate" content="pt_BR" />
        </Helmet>
        <Hero />
        <About />
        {/* <Timeline /> */}
        <Skills />
        <GridFeatured />
        <GridFeaturedBlog />
        {/* <WhyMe /> */}
        <Contact />
        </>
    );
};

export default Home;