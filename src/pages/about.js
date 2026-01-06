import React from "react";
import { Navbar, Hero, About, Timeline, Contact, Skills,Footer, WhyMe, AboutText } from '../components'
import { Helmet } from "react-helmet";
import NavbarSpacer from '../components/NavbarSpacer';

const AboutPage = () => {
    

    return (
        <>
        <Helmet>
            <title>Who's Wanghley?</title>
            <meta name="description" content="Discover Wanghley's journey, skills, and experiences. Learn more about the person behind the projects." />
            <meta name="keywords" content="Wanghley, About, Biography, Skills, Experience" />
            <link rel="canonical" href="https://wanghley.com/about" />
            <meta name="author" content="Wanghley" />
            <meta name="robots" content="index, follow" />

            <meta property="og:title" content="Who's Wanghley?" />
            <meta property="og:description" content="Discover Wanghley's journey, skills, and experiences. Learn more about the person behind the projects." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://wanghley.com/about" />
            <meta property="og:image" content="https://res.cloudinary.com/wanghley/image/upload/v1746646971/vhwsrugv5l1sxh7fx0zi.jpg" />
            <meta property="og:site_name" content="Wanghley – Sci&Tech" />
            <meta property="og:locale" content="en_US" />
            <meta property="og:locale:alternate" content="pt_BR" />
        </Helmet>
        <NavbarSpacer/>
        <AboutText />
        <Contact />
        </>
    );
};

export default AboutPage;