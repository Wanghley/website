import React, { useState, useEffect } from 'react'
import './css/About.css'
import { 
  FaPlay, 
  FaExternalLinkAlt,
  FaMicrochip,
  FaServer,
  FaArrowRight,
  FaLinkedin,
  FaGithub,
  FaQuoteLeft
} from 'react-icons/fa'
import { 
  SiTensorflow, 
  SiPython, 
  SiCplusplus, 
  SiAmazon,
  SiDocker,
  SiArduino,
  SiRaspberrypi
} from 'react-icons/si'
import { HiChip } from 'react-icons/hi'
import { BsCpu } from 'react-icons/bs'

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('about');
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const impactStats = [
    { value: "$500K+", label: "Grants Secured", detail: "NIH, NSF & Private" },
    { value: "3", label: "Patents Filed", detail: "Biosensor & Edge AI" },
    { value: "50K+", label: "Lives Impacted", detail: "Via Ambulis Platform" },
    { value: "23%", label: "Response Time ↓", detail: "EMS Pilot Results" }
  ];

  const techStack = {
    hardware: {
      title: "Hardware Layer",
      subtitle: "Sensors → Silicon",
      icon: <HiChip />,
      items: [
        { name: "Custom PCB", icon: <HiChip /> },
        { name: "FPGA", icon: <BsCpu /> },
        { name: "ARM Cortex", icon: <FaMicrochip /> },
        { name: "Biosensors", icon: <SiArduino /> }
      ]
    },
    edge: {
      title: "Edge Intelligence",
      subtitle: "On-Device ML",
      icon: <SiTensorflow />,
      items: [
        { name: "TinyML", icon: <SiTensorflow /> },
        { name: "C/C++", icon: <SiCplusplus /> },
        { name: "RTOS", icon: <SiRaspberrypi /> },
        { name: "ONNX", icon: <FaMicrochip /> }
      ]
    },
    cloud: {
      title: "Cloud & Strategy",
      subtitle: "Scale & Ship",
      icon: <SiAmazon />,
      items: [
        { name: "Python", icon: <SiPython /> },
        { name: "Docker", icon: <SiDocker /> },
        { name: "MLOps", icon: <FaServer /> }
      ]
    }
  };

  const credentials = [
    { title: "Duke University", detail: "ECE & CS '26" },
    { title: "Karsh Scholar", detail: "Full Merit Award" },
    { title: "Líder Estudar Fellow", detail: "Top 35 from 80,000+ applicants" }
  ];

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
  };

  return (
    <section 
      className={`about ${isVisible ? 'about--visible' : ''} ${prefersReducedMotion ? 'about--reduced-motion' : ''}`} 
      id="about"
      aria-label="About Wanghley Martins"
    >
      {/* Background Elements */}
      <div className="about__bg" aria-hidden="true">
        <div className="about__bg-gradient about__bg-gradient--1"></div>
        <div className="about__bg-gradient about__bg-gradient--2"></div>
        <div className="about__bg-pattern"></div>
      </div>

      <div className="about__container">
        {/* Section Label */}
        <div className="about__label-wrapper">
          <span className="about__label">About Me</span>
        </div>

        {/* ===== TOP ROW: Video + Impact Stats ===== */}
        <div className="about__top-row">
          {/* Left: TEDx Video */}
          <div className="about__video-card">
            <div className="about__video-header">
              <span className="about__video-badge">intro</span>
              <h3 className="about__video-title">Why me?</h3>
            </div>
            <div className="about__video-wrapper">
              {!isVideoPlaying ? (
                <div className="about__video-thumbnail">
                  <img 
                    src="https://img.youtube.com/vi/FOkCz0W5pgw/maxresdefault.jpg" 
                    alt="TEDx Talk: The Art of Innovation by Wanghley Martins"
                    className="about__video-img"
                    loading="lazy"
                  />
                  <button 
                    className="about__video-play"
                    onClick={handlePlayVideo}
                    aria-label="Play TEDx video: The Art of Innovation"
                  >
                    <FaPlay aria-hidden="true" />
                  </button>
                  <div className="about__video-overlay">
                    <span className="about__video-duration">12:34</span>
                  </div>
                </div>
              ) : (
                <iframe
                  className="about__video-iframe"
                  src="https://www.youtube.com/embed/FOkCz0W5pgw?autoplay=1&rel=0"
                  title="TEDx Talk: The Art of Innovation by Wanghley Martins"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>

          {/* Right: Impact Stats - Dark Card */}
          <div className="about__impact-card">
            <div className="about__impact-header">
              <span className="about__impact-label">Business Impact</span>
              <h3 className="about__impact-title">Measurable Results</h3>
            </div>
            <div className="about__impact-grid">
              {impactStats.map((stat, index) => (
                <div className="about__impact-stat" key={index}>
                  <span className="about__impact-value">{stat.value}</span>
                  <span className="about__impact-name">{stat.label}</span>
                  <span className="about__impact-detail">{stat.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== MIDDLE ROW: Bio Narrative ===== */}
        <div className="about__bio-section">
          <div className="about__bio-card">
            <div className="about__bio-quote">
              <FaQuoteLeft className="about__bio-quote-icon" aria-hidden="true" />
            </div>
            <div className="about__bio-content">
              <p className="about__bio-hook">
                I learned to build with constraints on a pig farm in Brazil where <em>gambiarra</em> 
                (creative resourcefulness) wasn't optional, it was survival. That scrappy engineering 
                mindset now drives how I architect systems at scale.
              </p>
              <p className="about__bio-main">
                I’m an engineer who turns high-stakes problems into systems that ship by fast, reliable, and measurable.
                I build end-to-end products at the intersection of <strong>embedded hardware</strong>,{" "}
                <strong>edge ML</strong>, and <strong>cloud engineering</strong>, bridging research and production
                with a bias for outcomes.
              </p>
              <p className="about__bio-main">
                Most recently, I helped build AI-powered emergency dispatch technology that achieved{" "}
                <strong>23% faster response times</strong> in pilot deployments. My work spans the full stack—from
                designing <strong>biosensor PCBs</strong> to optimizing neural networks that run on{" "}
                microcontrollers smaller than a coin—while aligning technical decisions with real-world constraints
                like latency, safety, and scale.
              </p>
              <p className="about__bio-cta-text">
                Currently at <strong>Duke University</strong> studying ECE & CS, publishing research in 
                biomedical engineering, and translating academic breakthroughs into production systems.
              </p>
            </div>
            <div className="about__bio-actions">
              <a 
                href="/about" 
                className="about__btn about__btn--primary"
                aria-label="Read my full biography"
              >
                <span>Full Biography</span>
                <FaExternalLinkAlt aria-hidden="true" />
              </a>
              <a 
                href="/curriculum-vitae" 
                className="about__btn about__btn--secondary"
                aria-label="View my CV"
              >
                <span>View CV</span>
                <FaArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* ===== BOTTOM ROW: Technical Architecture ===== */}
        <div className="about__tech-section">
          <div className="about__tech-header">
            <h3 className="about__tech-title">Technical Architecture</h3>
            <p className="about__tech-subtitle">Full-stack systems from silicon to cloud</p>
          </div>
          
          <div className="about__tech-flow">
            {Object.entries(techStack).map(([key, layer], index) => (
              <div className="about__tech-layer" key={key}>
                <div className="about__tech-layer-header">
                  <span className="about__tech-layer-number">0{index + 1}</span>
                  <div className="about__tech-layer-info">
                    <h4 className="about__tech-layer-title">{layer.title}</h4>
                    <span className="about__tech-layer-subtitle">{layer.subtitle}</span>
                  </div>
                </div>
                <div className="about__tech-layer-items">
                  {layer.items.map((item, i) => (
                    <div className="about__tech-item" key={i}>
                      <span className="about__tech-item-icon">{item.icon}</span>
                      <span className="about__tech-item-name">{item.name}</span>
                    </div>
                  ))}
                </div>
                {index < Object.keys(techStack).length - 1 && (
                  <div className="about__tech-arrow" aria-hidden="true">
                    <FaArrowRight />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Key Achievement Callout */}
          <div className="about__achievement">
            <div className="about__achievement-icon">
              <FaMicrochip />
            </div>
            <p className="about__achievement-text">
              <strong>Latest:</strong> Deployed a 98.2% accurate arrhythmia detection model on an 
              STM32 microcontroller (256KB Flash) achieving 15ms inference latency for real-time cardiac monitoring.
            </p>
          </div>
        </div>

        {/* ===== CREDENTIALS FOOTER ===== */}
        <div className="about__credentials-bar">
          <div className="about__credentials-list">
            {credentials.map((cred, index) => (
              <div className="about__credential" key={index}>
                <span className="about__credential-title">{cred.title}</span>
                <span className="about__credential-detail">{cred.detail}</span>
              </div>
            ))}
          </div>
          <div className="about__credentials-social">
            <a 
              href="https://linkedin.com/in/wanghley" 
              target="_blank" 
              rel="noopener noreferrer"
              className="about__social-link"
              aria-label="LinkedIn Profile"
            >
              <FaLinkedin />
            </a>
            <a 
              href="https://github.com/wanghley" 
              target="_blank" 
              rel="noopener noreferrer"
              className="about__social-link"
              aria-label="GitHub Profile"
            >
              <FaGithub />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;