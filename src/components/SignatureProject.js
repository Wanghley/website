import React, { useState, useEffect, useRef } from 'react';
import './css/SignatureProject.css';
import { FaArrowRight, FaHeartbeat } from 'react-icons/fa';
import { SiTensorflow, SiCplusplus } from 'react-icons/si';
import { FaMicrochip } from 'react-icons/fa';
import { HiChip } from 'react-icons/hi';
import EcgRibbon from './EcgRibbon';

const stats = [
  { value: '98.2%', unit: 'ACC', label: 'Arrhythmia Detection Accuracy' },
  { value: '15ms',  unit: 'LAT', label: 'Inference Latency' },
  { value: '256KB', unit: 'MEM', label: 'Flash — coin-sized MCU' },
];

const techPills = [
  { label: 'STM32',      icon: <FaMicrochip /> },
  { label: 'TinyML',     icon: <SiTensorflow /> },
  { label: 'C/C++',      icon: <SiCplusplus /> },
  { label: 'ONNX',       icon: <HiChip /> },
  { label: 'ARM Cortex', icon: <FaMicrochip /> },
];

const SignatureProject = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    const node = ref.current;
    if (node) observer.observe(node);

    return () => {
      mq.removeEventListener('change', onChange);
      if (node) observer.unobserve(node);
    };
  }, []);

  return (
    <section
      ref={ref}
      id="ch-04"
      className={`sp ${isVisible ? 'sp--visible' : ''} ${prefersReducedMotion ? 'sp--reduced-motion' : ''}`}
      aria-label="Signature project: arrhythmia detection"
    >
      <div className="sp__bg" aria-hidden="true">
        <div className="sp__bg-orb" />
      </div>

      <div className="sp__container">
        {/* Spec-sheet header */}
        <header className="sp__spec-head">
          <span className="sp__spec-id">BUILD 04</span>
          <span className="sp__spec-sep" />
          <span className="sp__spec-meta">CARDIAC AI · STM32F411</span>
          <span className="sp__spec-spacer" />
          <span className="sp__spec-status">
            <span className="sp__spec-dot" />
            STATUS · DEPLOYED
          </span>
        </header>

        <div className="sp__card">
          {/* Left: narrative */}
          <div className="sp__content">
            <div className="sp__eyebrow">
              <FaHeartbeat className="sp__eyebrow-icon" aria-hidden="true" />
              <span>SIGNATURE PROJECT</span>
            </div>

            <h2 className="sp__title">
              Cardiac AI on a{' '}
              <span className="sp__title-highlight">256KB microcontroller</span>
            </h2>

            <p className="sp__desc">
              Compressed a deep-learning arrhythmia classifier to run entirely
              on an STM32 — no cloud, no latency, no privacy risk. The model
              detects irregular heartbeats in real time at the point of care,
              where hospital-grade equipment isn&apos;t an option.
            </p>

            <ul className="sp__pills" aria-label="Technologies used">
              {techPills.map((pill) => (
                <li className="sp__pill" key={pill.label}>
                  <span className="sp__pill-bracket sp__pill-bracket--l">[</span>
                  <span className="sp__pill-icon" aria-hidden="true">{pill.icon}</span>
                  {pill.label}
                  <span className="sp__pill-bracket sp__pill-bracket--r">]</span>
                </li>
              ))}
            </ul>

            <a href="/projects?q=arrhythmia" className="sp__cta">
              <span>READ CASE STUDY</span>
              <FaArrowRight aria-hidden="true" />
            </a>
          </div>

          {/* Right: CRT-monitor stat cards */}
          <div className="sp__stats" aria-label="Project metrics">
            {stats.map((s, i) => (
              <div
                className="sp__stat crt-display"
                key={i}
                style={{ '--sp-delay': `${0.1 + i * 0.1}s` }}
              >
                <div className="sp__stat-head">
                  <span className="sp__stat-unit">{s.unit}</span>
                  <span className="sp__stat-mark" aria-hidden="true">▮▮▮</span>
                </div>
                <span className="sp__stat-value crt-display__value">{s.value}</span>
                <span className="sp__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full-bleed live ECG ribbon */}
      <div className="sp__ecg" aria-hidden="false">
        <EcgRibbon height={104} />
      </div>
    </section>
  );
};

export default SignatureProject;
