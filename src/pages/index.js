import React from "react";
import {
  Hero,
  About,
  Contact,
  Skills,
  GridFeatured,
  GridFeaturedBlog,
  GambiarraImpact,
} from '../components';
import { Helmet } from "react-helmet-async";
import './css/home.css';

const Home = () => {
    return (
        <div className="home-page home-page-instrumented">
            <Helmet>
                <title>Wanghley Martins | Edge AI Engineer & Biomedical AI Researcher | Duke University</title>
                <meta name="description" content="Wanghley Martins is an Edge AI engineer and biomedical AI researcher at Duke University (Karsh Scholar) building intelligent health systems — from TinyML on STM32 microcontrollers to cloud-scale MLOps pipelines." />
                <meta name="keywords" content="Wanghley Martins, Edge AI, TinyML, Biomedical AI, Embedded ML, STM32, Arrhythmia Detection, Health Tech, Duke University, Karsh Scholar, Silicon to Cloud, FPGA, ARM Cortex, RTOS, ONNX" />
                <link rel="canonical" href="https://wanghley.com/" />
                <meta name="author" content="Wanghley Martins" />
                <meta name="robots" content="index, follow" />

                <meta property="og:title" content="Wanghley Martins | Edge AI Engineer & Biomedical AI Researcher" />
                <meta property="og:description" content="Building intelligent health systems from silicon to cloud. Edge AI, TinyML, and biomedical engineering research at Duke University." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://wanghley.com/" />
                <meta property="og:image" content="https://res.cloudinary.com/wanghley/image/upload/v1746648815/branding/logo_applied_sq.png" />
                <meta property="og:site_name" content="Wanghley Martins – Edge AI & Health Tech" />
                <meta property="og:locale" content="en_US" />

                <script type="application/ld+json">{`
                    {
                        "@context": "https://schema.org",
                        "@type": "Person",
                        "name": "Wanghley Martins",
                        "url": "https://wanghley.com",
                        "jobTitle": "Edge AI Engineer & Biomedical AI Researcher",
                        "description": "Edge AI engineer and biomedical AI researcher building intelligent health systems from silicon to cloud.",
                        "affiliation": {
                            "@type": "EducationalOrganization",
                            "name": "Duke University",
                            "url": "https://duke.edu"
                        },
                        "alumniOf": {
                            "@type": "EducationalOrganization",
                            "name": "Duke University"
                        },
                        "knowsAbout": ["Edge AI", "TinyML", "Biomedical Engineering", "Embedded Systems", "Machine Learning", "Health Tech", "FPGA", "ARM Cortex", "RTOS"],
                        "sameAs": [
                            "https://linkedin.com/in/wanghley",
                            "https://github.com/wanghley",
                            "https://scholar.google.com/citations?user=sN2iKrkAAAAJ"
                        ]
                    }
                `}</script>
            </Helmet>
            <Hero />
            <About />
            <GambiarraImpact />
            <Skills />
            {/* <TechArchitecture /> */}

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
