import React, { useEffect, useState } from 'react'
import './css/Hero.css'
import { FaGithub, FaLinkedin, FaArrowDown, FaArrowRight, FaUniversity, FaMicrophone, FaRocket } from 'react-icons/fa'
import { SiGooglescholar } from 'react-icons/si'
import profileImage from '../assets/54015060324_813dcb695e_o-2-3.jpg'

const Hero = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        // Check for reduced motion preference for accessibility
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);
        
        const handleChange = (e) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        
        setIsVisible(true);
        
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const scrollToAbout = () => {
        document.getElementById('about')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };

    // Authority stats - clean, floating design
    const authorityStats = [
        { 
            icon: <FaUniversity aria-hidden="true" />, 
            title: "Duke University", 
            subtitle: "Karsh Scholar",
            ariaLabel: "Duke University, Karsh Scholar"
        },
        { 
            icon: <FaRocket aria-hidden="true" />, 
            title: "CTO & Co-Founder", 
            subtitle: "Ambulis INC.",
            ariaLabel: "CTO and Co-Founder at Ambulis Incorporated"
        },
        { 
            icon: <FaMicrophone aria-hidden="true" />, 
            title: "TEDx Speaker", 
            subtitle: "The Art of Innovation",
            ariaLabel: "TEDx Speaker, The Art of Innovation"
        },
    ];

    return (
        <section 
            className={`hero ${isVisible ? 'hero--visible' : ''} ${prefersReducedMotion ? 'hero--reduced-motion' : ''}`}
            aria-label="Introduction to Wanghley Martins"
        >
            {/* Skip to main content link for accessibility */}
            <a href="#about" className="hero__skip-link">
                Skip to main content
            </a>

            {/* Technical background elements - hidden from screen readers */}
            <div className="hero__bg" aria-hidden="true">
                <div className="hero__orb hero__orb--1"></div>
                <div className="hero__orb hero__orb--2"></div>
                
                {/* Technical grid overlay */}
                <div className="hero__grid">
                    <svg className="hero__grid-svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                        <defs>
                            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="0.5"/>
                            </pattern>
                            <linearGradient id="grid-fade" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="white" stopOpacity="1"/>
                                <stop offset="60%" stopColor="white" stopOpacity="0.3"/>
                                <stop offset="100%" stopColor="white" stopOpacity="0"/>
                            </linearGradient>
                            <mask id="grid-mask">
                                <rect width="100%" height="100%" fill="url(#grid-fade)"/>
                            </mask>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#grid-mask)"/>
                        
                        <g className="hero__nodes" mask="url(#grid-mask)">
                            <circle cx="100" cy="200" r="3" fill="rgba(56, 189, 248, 0.4)"/>
                            <circle cx="200" cy="150" r="2" fill="rgba(56, 189, 248, 0.3)"/>
                            <circle cx="150" cy="350" r="4" fill="rgba(56, 189, 248, 0.5)"/>
                            <circle cx="300" cy="280" r="2.5" fill="rgba(56, 189, 248, 0.35)"/>
                            <circle cx="250" cy="450" r="3" fill="rgba(56, 189, 248, 0.4)"/>
                            <circle cx="80" cy="500" r="2" fill="rgba(56, 189, 248, 0.25)"/>
                            <circle cx="350" cy="180" r="2" fill="rgba(56, 189, 248, 0.3)"/>
                            <circle cx="180" cy="600" r="3.5" fill="rgba(56, 189, 248, 0.45)"/>
                            <circle cx="400" cy="400" r="2" fill="rgba(56, 189, 248, 0.2)"/>
                            <circle cx="120" cy="700" r="2.5" fill="rgba(56, 189, 248, 0.35)"/>
                            
                            <line x1="100" y1="200" x2="200" y2="150" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.5"/>
                            <line x1="100" y1="200" x2="150" y2="350" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.5"/>
                            <line x1="200" y1="150" x2="300" y2="280" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.5"/>
                            <line x1="150" y1="350" x2="250" y2="450" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.5"/>
                            <line x1="150" y1="350" x2="300" y2="280" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="0.5"/>
                            <line x1="250" y1="450" x2="180" y2="600" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.5"/>
                            <line x1="80" y1="500" x2="180" y2="600" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="0.5"/>
                            <line x1="350" y1="180" x2="400" y2="400" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="0.5"/>
                        </g>
                    </svg>
                </div>
            </div>

            <div className="hero__container">
                {/* Content - Left side on desktop, bottom on mobile */}
                <div className="hero__content">
                    <h1 className="hero__title">
                        Wanghley Martins
                    </h1>

                    <h2 className="hero__subtitle">
                        Architecting <span className="hero__subtitle-gradient">Intelligent Health Systems</span> at the Edge
                    </h2>

                    <p className="hero__description">
                        Bridging the gap between <strong>Hardware Infrastructure</strong>, <strong>Edge AI</strong>, and <strong>Technical Strategy</strong>. From optimizing neural networks on custom silicon to deploying scalable systems and health-tech solutions.
                    </p>

                    {/* CTA Buttons with proper focus states */}
                    <div className="hero__cta" role="group" aria-label="Primary actions">
                        <a 
                            href="/projects" 
                            className="hero__btn hero__btn--primary"
                            aria-label="View technical portfolio of projects"
                        >
                            <span>View Technical Portfolio</span>
                            <svg 
                                className="hero__btn-arrow" 
                                width="20" 
                                height="20" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                                aria-hidden="true"
                            >
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </a>
                        <a 
                            href="/curriculum-vitae" 
                            className="hero__link"
                            aria-label="Read my resume and curriculum vitae"
                        >
                            <span>Read my Resume</span>
                            <FaArrowRight className="hero__link-arrow" aria-hidden="true" />
                        </a>
                    </div>

                    {/* Social links with proper accessibility */}
                    <nav className="hero__social" aria-label="Social media links">
                        <a 
                            href="https://github.com/wanghley" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hero__social-link" 
                            aria-label="Visit my GitHub profile (opens in new tab)"
                        >
                            <FaGithub aria-hidden="true" />
                        </a>
                        <a 
                            href="https://linkedin.com/in/wanghley" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hero__social-link" 
                            aria-label="Visit my LinkedIn profile (opens in new tab)"
                        >
                            <FaLinkedin aria-hidden="true" />
                        </a>
                        <a 
                            href="https://scholar.google.com/citations?user=sN2iKrkAAAAJ" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hero__social-link" 
                            aria-label="Visit my Google Scholar profile (opens in new tab)"
                        >
                            <SiGooglescholar aria-hidden="true" />
                        </a>
                    </nav>
                </div>

                {/* Right side - Photo with glow */}
                <div className="hero__visual">
                    <div className="hero__image-glow" aria-hidden="true"></div>
                    <div className="hero__image-wrapper">
                        <img 
                            src={profileImage} 
                            alt="Wanghley Martins, a technical leader and system architect, smiling professionally" 
                            className="hero__image"
                            loading="eager"
                            fetchpriority="high"
                        />
                    </div>
                    
                    {/* Authority Stats */}
                    <ul className="hero__authority" aria-label="Professional credentials">
                        {authorityStats.map((stat, index) => (
                            <li 
                                className="hero__authority-item" 
                                key={index}
                                aria-label={stat.ariaLabel}
                            >
                                <span className="hero__authority-icon">{stat.icon}</span>
                                <div className="hero__authority-text">
                                    <span className="hero__authority-title">{stat.title}</span>
                                    <span className="hero__authority-subtitle">{stat.subtitle}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Scroll indicator */}
            <button 
                className="hero__scroll" 
                onClick={scrollToAbout} 
                aria-label="Scroll down to learn more about me"
                type="button"
            >
                <span aria-hidden="true">Explore</span>
                <FaArrowDown className="hero__scroll-icon" aria-hidden="true" />
            </button>
        </section>
    );
};

export default Hero;