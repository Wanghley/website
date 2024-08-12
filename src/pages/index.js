import React from "react";
import { Navbar, Hero, About, Timeline, Contact, Skills,Footer, WhyMe, GridFeatured,GridFeaturedBlog } from '../components'
 
const Home = () => {
    return (
        <>
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