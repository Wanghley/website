import React from "react";
import AboutText from '../components/About-text';
import ContactForm from '../components/home/sections/ContactForm';
import { Helmet } from "react-helmet-async";

const AboutPage = () => {
    return (
        <main id="main" className="about-page">
            <Helmet>
                <title>About Wanghley Martins | PhD student, Rice ECE</title>
                <meta name="description" content="Wanghley Martins is a PhD student in Electrical & Computer Engineering at Rice University, building non-contact capacitive biosensors and edge AI that runs on microcontrollers. From a pig farm outside Brasília to Duke and Rice." />
                <link rel="canonical" href="https://wanghley.com/about" />
                <meta name="author" content="Wanghley Martins" />
                <meta name="robots" content="index, follow" />

                <meta property="og:title" content="About Wanghley Martins | PhD student, Rice ECE" />
                <meta property="og:description" content="PhD student in Electrical & Computer Engineering at Rice University. Brazilian engineer, TEDxDuke speaker." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://wanghley.com/about" />
                <meta property="og:image" content="https://wanghley.com/og-image.png" />
                <meta property="og:site_name" content="Wanghley Martins" />
                <meta property="og:locale" content="en_US" />
                <meta property="og:locale:alternate" content="pt_BR" />
            </Helmet>
            <AboutText />
            <ContactForm figure={false} source="about" />
        </main>
    );
};

export default AboutPage;
