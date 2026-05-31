import React, { useState, useEffect, useRef } from 'react';
import './css/TechArchitecture.css';
import {
  FaMicrochip,
  FaServer,
  FaArrowRight,
  FaArrowDown,
  FaChevronDown,
} from 'react-icons/fa';
import {
  SiTensorflow,
  SiPython,
  SiCplusplus,
  SiAmazon,
  SiDocker,
  SiArduino,
  SiRaspberrypi,
} from 'react-icons/si';
import { HiChip } from 'react-icons/hi';
import { BsCpu } from 'react-icons/bs';

const techStack = [
  {
    key: 'hardware',
    number: '01',
    title: 'Hardware Layer',
    subtitle: 'Sensors → Silicon',
    waveform: 'square',
    icon: <HiChip />,
    items: [
      { name: 'Custom PCB',  icon: <HiChip /> },
      { name: 'FPGA',        icon: <BsCpu /> },
      { name: 'ARM Cortex',  icon: <FaMicrochip /> },
      { name: 'Biosensors',  icon: <SiArduino /> },
    ],
  },
  {
    key: 'edge',
    number: '02',
    title: 'Edge Intelligence',
    subtitle: 'On-Device ML',
    waveform: 'pulse',
    icon: <SiTensorflow />,
    items: [
      { name: 'TinyML', icon: <SiTensorflow /> },
      { name: 'C/C++',  icon: <SiCplusplus /> },
      { name: 'RTOS',   icon: <SiRaspberrypi /> },
      { name: 'ONNX',   icon: <FaMicrochip /> },
    ],
  },
  {
    key: 'cloud',
    number: '03',
    title: 'Cloud & Strategy',
    subtitle: 'Scale & Ship',
    waveform: 'sine',
    icon: <SiAmazon />,
    items: [
      { name: 'Python', icon: <SiPython /> },
      { name: 'Docker', icon: <SiDocker /> },
      { name: 'MLOps',  icon: <FaServer /> },
    ],
  },
];

const PROTOCOLS = [
  ['SPI', 'I²C', 'UART'],   // 01 → 02
  ['REST', 'gRPC', 'MQTT'], // 02 → 03
];

const TechArchitecture = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [openLayer, setOpenLayer] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    const onMotion = (e) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', onMotion);

    const mobileQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mobileQuery.matches);
    const onMobile = (e) => setIsMobile(e.matches);
    mobileQuery.addEventListener('change', onMobile);

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    const node = sectionRef.current;
    if (node) observer.observe(node);

    return () => {
      motionQuery.removeEventListener('change', onMotion);
      mobileQuery.removeEventListener('change', onMobile);
      if (node) observer.unobserve(node);
    };
  }, []);

  const toggleLayer = (key) => {
    setOpenLayer((prev) => (prev === key ? null : key));
  };

  return (
    <section
      ref={sectionRef}
      id="ch-04"
      className={`ta ${isVisible ? 'ta--visible' : ''} ${prefersReducedMotion ? 'ta--reduced-motion' : ''}`}
      aria-label="Silicon to Cloud technical architecture"
    >
      <div className="ta__bg" aria-hidden="true">
        <div className="ta__bg-orb ta__bg-orb--1" />
        <div className="ta__bg-orb ta__bg-orb--2" />
        <div className="ta__bg-grid" />
      </div>

      <div className="ta__container">
        <header className="ta__header">
          <span className="ta__label">
            <span className="ta__label-id">CH:04</span>
            <span className="ta__label-sep" />
            STACK ARCHITECTURE
          </span>
          <h2 className="ta__title">Silicon to Cloud</h2>
          <p className="ta__intro">
            Gambiarra taught me to do more with less.
            Now I apply that constraint to silicon — from sensor to server.
          </p>
        </header>

        {/* Desktop: horizontal flow with signal pulses */}
        {!isMobile ? (
          <div className="ta__flow ta__flow--bento" role="list">
            {techStack.map((layer, index) => (
              <React.Fragment key={layer.key}>
                <div
                  className={`ta__layer ta__layer--${layer.waveform}`}
                  role="listitem"
                >
                  <div className="ta__layer-strip" aria-hidden="true" />
                  <div className="ta__layer-header">
                    <span className="ta__layer-number">L{layer.number}</span>
                    <div className="ta__layer-meta">
                      <h3 className="ta__layer-title">{layer.title}</h3>
                      <span className="ta__layer-subtitle">{'// '}{layer.subtitle}</span>
                    </div>
                  </div>
                  <ul className="ta__layer-items">
                    {layer.items.map((item) => (
                      <li className="ta__item" key={item.name}>
                        <span className="ta__item-icon" aria-hidden="true">{item.icon}</span>
                        <span className="ta__item-name">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {index < techStack.length - 1 && (
                  <div className="ta__connector" aria-hidden="true">
                    <div className="ta__connector-line">
                      <span className="ta__pulse ta__pulse--a" />
                      <span className="ta__pulse ta__pulse--b" />
                      <span className="ta__pulse ta__pulse--c" />
                    </div>
                    <ul className="ta__protocols">
                      {PROTOCOLS[index].map((p) => (
                        <li className="ta__protocol" key={p}>{p}</li>
                      ))}
                    </ul>
                    <FaArrowRight className="ta__connector-icon" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          /* Mobile: vertical accordion */
          <div className="ta__accordion" role="list">
            {techStack.map((layer, index) => {
              const isOpen = openLayer === layer.key;
              return (
                <div
                  className={`ta__accordion-item ta__accordion-item--${layer.waveform} ${isOpen ? 'ta__accordion-item--open' : ''}`}
                  key={layer.key}
                  role="listitem"
                >
                  <button
                    className="ta__accordion-trigger"
                    onClick={() => toggleLayer(layer.key)}
                    aria-expanded={isOpen}
                  >
                    <span className="ta__layer-number">L{layer.number}</span>
                    <div className="ta__layer-meta">
                      <span className="ta__layer-title">{layer.title}</span>
                      <span className="ta__layer-subtitle">{'// '}{layer.subtitle}</span>
                    </div>
                    <FaChevronDown
                      className={`ta__accordion-chevron ${isOpen ? 'ta__accordion-chevron--open' : ''}`}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen && (
                    <ul className="ta__accordion-body">
                      {layer.items.map((item) => (
                        <li className="ta__item" key={item.name}>
                          <span className="ta__item-icon" aria-hidden="true">{item.icon}</span>
                          <span className="ta__item-name">{item.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {index < techStack.length - 1 && (
                    <div className="ta__accordion-connector" aria-hidden="true">
                      <span className="ta__accordion-protocols">{PROTOCOLS[index].join(' · ')}</span>
                      <FaArrowDown className="ta__connector-icon" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Deployment brief callout */}
        <a
          href="/projects?q=arrhythmia"
          className="ta__achievement"
          aria-label="Read the arrhythmia detection case study"
        >
          <div className="ta__achievement-head">
            <span className="ta__achievement-id">DEPLOYMENT BRIEF</span>
            <span className="ta__achievement-serial">SERIAL · BLD-04-STM32F411</span>
          </div>
          <div className="ta__achievement-body">
            <div className="ta__achievement-stats">
              <div className="ta__stat">
                <span className="ta__stat-value">98.2%</span>
                <span className="ta__stat-label">Accuracy</span>
              </div>
              <div className="ta__stat-divider" aria-hidden="true" />
              <div className="ta__stat">
                <span className="ta__stat-value">15ms</span>
                <span className="ta__stat-label">Inference</span>
              </div>
              <div className="ta__stat-divider" aria-hidden="true" />
              <div className="ta__stat">
                <span className="ta__stat-value">256KB</span>
                <span className="ta__stat-label">Flash</span>
              </div>
            </div>
            <p className="ta__achievement-desc">
              Arrhythmia detection model deployed on STM32 — real-time cardiac
              monitoring on a microcontroller smaller than a coin.
            </p>
          </div>
          <span className="ta__achievement-cta">
            READ CASE STUDY <FaArrowRight aria-hidden="true" />
          </span>
        </a>
      </div>
    </section>
  );
};

export default TechArchitecture;
