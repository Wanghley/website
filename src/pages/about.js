import React from "react";
import { AboutText, Contact } from '../components'
import { Helmet } from "react-helmet-async";
import NavbarSpacer from '../components/NavbarSpacer';

const AboutPage = () => {
    

    return (
        <div style={{ background: 'var(--ds-abyss, #0a0b14)', minHeight: '100vh' }}>
        <Helmet>
            <title>About Wanghley Martins | Edge AI Engineer & Duke Karsh Scholar</title>
            <meta name="description" content="Wanghley Martins is a Duke University Karsh Scholar and Edge AI engineer specializing in TinyML, biomedical AI, and embedded health systems. From a pig farm in Brazil to deploying arrhythmia detection on STM32 microcontrollers." />
            <meta name="keywords" content="Wanghley Martins, About, Edge AI Engineer, TinyML, Duke Karsh Scholar, Biomedical Engineering, Embedded Systems, Health Tech, TEDx Speaker, Líder Estudar Fellow" />
            <link rel="canonical" href="https://wanghley.com/about" />
            <meta name="author" content="Wanghley Martins" />
            <meta name="robots" content="index, follow" />

            <meta property="og:title" content="About Wanghley Martins | Edge AI Engineer & Duke Karsh Scholar" />
            <meta property="og:description" content="Edge AI engineer, biomedical AI researcher, and Duke Karsh Scholar. Building intelligent health systems from silicon to cloud." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://wanghley.com/about" />
            <meta property="og:image" content="https://res.cloudinary.com/wanghley/image/upload/v1746646971/vhwsrugv5l1sxh7fx0zi.jpg" />
            <meta property="og:site_name" content="Wanghley Martins – Edge AI & Health Tech" />
            <meta property="og:locale" content="en_US" />
            <meta property="og:locale:alternate" content="pt_BR" />
        </Helmet>
        <NavbarSpacer />
        <AboutText />
        <Contact />
        </div>
    );
};

export default AboutPage;