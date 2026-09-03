import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import CountUp from '../bits/CountUp';
import SpotlightCard from '../bits/SpotlightCard';
import './css/IdentityFocus.css';

// Ported verbatim from GambiarraImpact.js — the four headline impact stats.
const STATS = [
  {
    value: '$800K+',
    target: 800,
    prefix: '$',
    suffix: 'K+',
    label: 'Grants Secured',
    detail: 'Duke, Karsh, Estudar Foundation, BMO & more',
    timestamp: 'REC · 2024-11-12',
    spark: [0.2, 0.35, 0.5, 0.6, 0.65, 0.8, 0.9, 1.0],
  },
  {
    value: '100K+',
    target: 100,
    prefix: '',
    suffix: 'K+',
    label: 'Lives Impacted',
    detail: 'Via entrepreneurship, research & volunteering',
    timestamp: 'REC · 2024-10-30',
    spark: [0.1, 0.18, 0.3, 0.42, 0.55, 0.7, 0.85, 1.0],
  },
  {
    value: '13',
    target: 13,
    prefix: '',
    suffix: '',
    label: 'Publications',
    detail: 'Peer-reviewed · Biomedical engineering',
    timestamp: 'REC · 2025-Q1',
    spark: [0.15, 0.25, 0.4, 0.5, 0.55, 0.7, 0.85, 1.0],
  },
  {
    value: '92%',
    target: 92,
    prefix: '',
    suffix: '%',
    label: 'Pilot Satisfaction',
    detail: 'From users in production deployments',
    timestamp: 'REC · 2025-03-08',
    spark: [0.5, 0.55, 0.62, 0.7, 0.78, 0.82, 0.88, 0.92],
  },
];

// Ported verbatim from About.js — credentials ticker.
const CREDENTIALS = [
  { name: 'Karsh Scholar', sub: 'Duke · Full Merit' },
  { name: 'TEDx Speaker', sub: 'Duke 2023' },
  { name: 'FEBRACE Gold', sub: '1st Place Eng. 2021' },
  { name: 'ISEF Finalist', sub: 'J&J · Biomedical' },
  { name: 'Líder Estudar', sub: 'Fellow' },
  { name: 'Belgrade Gold', sub: "29th Int'l Young Sci." },
  { name: '13 Publications', sub: 'Peer-reviewed · Biomedical' },
  { name: 'Ambulis INC.', sub: 'Co-founder · Oncology AI' },
  { name: 'Duke BIG IDEAs', sub: 'Lab Researcher' },
  { name: '$800K+ Grants', sub: 'Secured' },
];

/* Inline SVG sparkline — ported from GambiarraImpact.js's Sparkline. */
const Sparkline = ({ points, color = '#3AAFF1' }) => {
  const w = 64;
  const h = 18;
  const step = w / (points.length - 1);
  const path = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(h - v * h).toFixed(1)}`)
    .join(' ');
  const lastX = (points.length - 1) * step;
  const lastY = h - points[points.length - 1] * h;
  return (
    <svg className="identity-focus__spark" viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="2" fill={color} />
    </svg>
  );
};

const formatStat = (val, stat) => `${stat.prefix}${Math.round(val).toLocaleString()}${stat.suffix}`;

export default function IdentityFocus() {
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Trigger the CountUp bits once the stat grid first scrolls into view.
  useEffect(() => {
    const node = cardsRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // GSAP: batched card reveal + a left-rail pin on desktop for the
  // duration of the stat sequence.
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (reduced) return;

      const cards = gsap.utils.toArray('.identity-focus__stat');
      ScrollTrigger.batch(cards, {
        start: 'top 85%',
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.08,
            overwrite: true,
          }),
        once: true,
      });
      gsap.set(cards, { opacity: 0, y: 28 });

      const rail = sectionRef.current?.querySelector('.identity-focus__rail');
      const content = sectionRef.current?.querySelector('.identity-focus__content');
      if (rail && content && window.innerWidth >= 1024) {
        ScrollTrigger.create({
          trigger: content,
          start: 'top top+=120',
          end: 'bottom bottom',
          pin: rail,
          pinSpacing: false,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} id="identity" className="identity-focus" aria-labelledby="identity-heading">
      <div className="container identity-focus__container">
        <div className="identity-focus__rail">
          <span className="channel-mark">
            <span className="channel-mark__id">CH:01</span>
            <span className="channel-mark__sep" />
            <span className="channel-mark__title">SYSTEM PROFILE</span>
          </span>

          <h2 className="identity-focus__heading" id="identity-heading">
            Bridging Physical Constraints with <em>Digital Intelligence.</em>
          </h2>

          <p className="identity-focus__body">
            As an electrical and computer engineer, computer scientist, and entrepreneur,
            my true differential is end-to-end architectural ownership. I bridge the gap
            between the physical and digital by combining custom electronics and sensor
            interface design with advanced signal processing and autonomous expert systems.
            From critical infrastructure to healthcare, I engineer high-reliability solutions
            for the real economy.
          </p>

          <figure className="identity-focus__quote glass-panel glass-panel--faint">
            <blockquote className="identity-focus__quote-body">
              <span className="identity-focus__quote-mark" aria-hidden="true">&ldquo;</span>
              I don&apos;t just write the software.{' '}
              <em>I architect the physical systems that run it.</em>
            </blockquote>
            <figcaption className="identity-focus__quote-cite">
              <span className="identity-focus__quote-cite-dash" />
              MAKER · RESEARCHER · SPEAKER
            </figcaption>
          </figure>

          <a href="/contact" className="identity-focus__link">
            START A COLLABORATION
            <span className="identity-focus__link-arrow">→</span>
          </a>
        </div>

        <div className="identity-focus__content">
          <ul ref={cardsRef} className="identity-focus__stats" aria-label="Impact statistics">
            {STATS.map((stat, i) => (
              <li key={stat.label} className="identity-focus__stat">
                <SpotlightCard className="glass-panel identity-focus__stat-card">
                  <div className="identity-focus__stat-top">
                    <span className="telemetry telemetry--no-prefix">
                      CH:{String(i + 1).padStart(2, '0')} · {stat.timestamp}
                    </span>
                    <Sparkline points={stat.spark} />
                  </div>
                  <CountUp
                    className="identity-focus__stat-value"
                    target={stat.target}
                    format={(v) => formatStat(v, stat)}
                    finalText={stat.value}
                    run={visible}
                    reduced={reduced}
                  />
                  <span className="identity-focus__stat-label">{stat.label}</span>
                  <span className="identity-focus__stat-detail">{stat.detail}</span>
                </SpotlightCard>
              </li>
            ))}
          </ul>

          <div className="identity-focus__creds">
            <div className="identity-focus__creds-head">
              <span className="telemetry">CREDENTIALS · LIVE FEED</span>
              <span className="identity-focus__creds-meta">
                {CREDENTIALS.length} ENTRIES · UPDATED 2026.Q2
              </span>
            </div>
            <div className="ticker">
              <div className="ticker__track">
                {[...CREDENTIALS, ...CREDENTIALS].map((c, idx) => (
                  <span className="ticker__item" key={`${c.name}-${idx}`}>
                    <strong>{c.name}</strong>&nbsp;/&nbsp;{c.sub}
                    <span className="ticker__sep">·</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
