import React from "react";
import HeroChamber from '../components/home/HeroChamber';
import SignalChain from '../components/home/SignalChain';
import SelectedWork from '../components/home/sections/SelectedWork';
import Gambiarra from '../components/home/sections/Gambiarra';
import Research from '../components/home/sections/Research';
import Ecosystem from '../components/home/sections/Ecosystem';
import ClosingContact from '../components/home/sections/ClosingContact';
import '../components/home/css/Sections.css';
import { Helmet } from "react-helmet-async";
import './css/home.css';

const Home = () => {
    return (
        <main id="main" className="home-page home-page-instrumented">
            <Helmet>
                <title>Wanghley Martins | Biosensing & Edge AI · Rice University</title>
                <meta name="description" content="Wanghley Martins is a PhD researcher in Electrical & Computer Engineering at Rice University, building non-contact capacitive biosensors and edge AI systems that run on microcontrollers." />
                <meta name="keywords" content="Wanghley Martins, Non-Contact Biosensing, Capacitive Sensing, Edge AI, TinyML, Biomedical AI, Embedded ML, STM32, Health Tech, Rice University, Duke University, Karsh Scholar, Silicon to Cloud, FPGA, ARM Cortex, RTOS, ONNX" />
                <link rel="canonical" href="https://wanghley.com/" />
                <meta name="author" content="Wanghley Martins" />
                <meta name="robots" content="index, follow" />

                <meta property="og:title" content="Wanghley Martins | Biosensing & Edge AI · Rice University" />
                <meta property="og:description" content="Wanghley Martins is a PhD researcher in Electrical & Computer Engineering at Rice University, building non-contact capacitive biosensors and edge AI systems that run on microcontrollers." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://wanghley.com/" />
                <meta property="og:image" content="https://res.cloudinary.com/wanghley/image/upload/v1746648815/branding/logo_applied_sq.png" />
                <meta property="og:site_name" content="Wanghley Martins – Biosensing & Edge AI" />
                <meta property="og:locale" content="en_US" />

                <script type="application/ld+json">{`
                    {
                        "@context": "https://schema.org",
                        "@type": "Person",
                        "name": "Wanghley Martins",
                        "url": "https://wanghley.com",
                        "jobTitle": "PhD Researcher, Electrical & Computer Engineering",
                        "description": "PhD researcher in Electrical & Computer Engineering at Rice University, building non-contact capacitive biosensors and edge AI systems that run on microcontrollers.",
                        "affiliation": {
                            "@type": "EducationalOrganization",
                            "name": "Rice University",
                            "url": "https://rice.edu"
                        },
                        "alumniOf": {
                            "@type": "EducationalOrganization",
                            "name": "Duke University"
                        },
                        "knowsAbout": ["Non-Contact Biosensing", "Capacitive Sensing", "Edge AI", "TinyML", "Biomedical Engineering", "Embedded Systems", "Machine Learning", "Health Tech", "FPGA", "ARM Cortex", "RTOS"],
                        "sameAs": [
                            "https://linkedin.com/in/wanghley",
                            "https://github.com/wanghley",
                            "https://scholar.google.com/citations?user=sN2iKrkAAAAJ"
                        ]
                    }
                `}</script>
            </Helmet>
            <HeroChamber />
            <SignalChain />
            <SelectedWork />
            <Gambiarra />
            <Research />
            <Ecosystem />
            <ClosingContact />
        </main>
    );
};

export default Home;
