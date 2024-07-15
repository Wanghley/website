import React from "react";
import { Navbar, Hero, About, Timeline, Contact, Skills,Footer, WhyMe, GridFeatured } from '../components'
 
const Home = () => {
    return (
        <>
        <Hero />
        <About />
        {/* <Timeline /> */}
        <Skills />
        <GridFeatured />
        {/* <WhyMe /> */}
        <Contact />
        </>
    );
};

export default Home;