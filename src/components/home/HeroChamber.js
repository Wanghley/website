import React, { useEffect, useState } from 'react';
import { usePostHog } from '../../lib/analytics';
import { useScrollToSection } from '../../lib/LenisRoot';
import { fetchHomePage } from '../../api/site';
import useCmsData from '../../hooks/useCmsData';
import HeroBench, { SenseValue } from './HeroBench';
import './css/HeroChamber.css';

// The hero's words come from the CMS home page. Each headline line may mark an
// accent word with *asterisks* (rendered in copper).

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = (e) => setReduced(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

const ROTATE_MS = 3600;
const plain = (t) => t.replace(/\*/g, '');
const accent = (t) => t.split(/(\*[^*]+\*)/).map((part, n) => (
  part.startsWith('*') ? <em key={n} className="hero__accent">{part.slice(1, -1)}</em> : part
));

// The headline: one sentence at a time, stacked in the same grid cell so the
// box is as tall as the longest sentence (no layout shift). The whole list is
// in the DOM for assistive tech; reduced motion shows it as a plain list.
function Headline({ reduced, lines }) {
  const [i, setI] = useState(0);
  const count = lines.length;
  useEffect(() => {
    if (reduced || count < 2) return undefined;
    let id;
    const start = () => { id = setInterval(() => setI((n) => (n + 1) % count), ROTATE_MS); };
    const stop = () => clearInterval(id);
    const onVis = () => { stop(); if (!document.hidden) start(); };
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [reduced, count]);

  if (!count) return null;

  if (reduced) {
    return (
      <ul className="hero__headline hero__headline--static">
        {lines.map((t) => <li key={t}>{accent(t)}</li>)}
      </ul>
    );
  }
  return (
    <div className="hero__headline">
      <span className="hero__rotator" aria-hidden="true">
        {lines.map((t, n) => (
          <span key={t} className={`hero__rotator-item${n === i % count ? ' is-on' : ''}`}>{accent(t)}</span>
        ))}
      </span>
    </div>
  );
}

export default function HeroChamber() {
  const posthog = usePostHog();
  const scrollToSection = useScrollToSection();
  const reduced = useReducedMotion();
  const { status, data: home } = useCmsData(fetchHomePage);
  const lines = status === 'ready' && Array.isArray(home?.heroLines) ? home.heroLines : [];

  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <HeroBench className="hero__bench" reducedMotion={reduced} />

      <div className="hero__content bench-col">
        {home?.heroEyebrow && <p className="hero__eyebrow">{home.heroEyebrow}</p>}

        <h1 id="hero-title" className="hero__title">
          <span className="hero__name">Wanghley</span>
          <span className="sr-only"> Soares Martins. {lines.map(plain).join(' ')}</span>
        </h1>

        <Headline reduced={reduced} lines={lines} />

        <div className="hero__ctas">
          <a
            href="#work"
            className="btn btn--primary"
            onClick={(e) => {
              e.preventDefault();
              posthog?.capture('home_hero_cta_clicked', { target: 'work' });
              scrollToSection('#work');
              document.getElementById('work')?.focus({ preventScroll: true });
            }}
          >
            See my work
          </a>
          <a
            href="/contact"
            className="btn btn--ghost"
            onClick={() => posthog?.capture('home_hero_contact_clicked')}
          >
            Get in touch
          </a>
        </div>

      </div>

      <p className="sr-only">
        Illustration: a circuit board with a copper sensing pad and a figure of Wanghley standing on it. When the
        board senses a hand, the capacitance reading rises from 0.18 to 2.14 picofarads and the signal is classified as a hand.
      </p>

      <div className="hero__instrument bench-col">
        <p aria-hidden="true" className="hero__readout">
          {home?.heroStatus && <span>{home.heroStatus}</span>}
          {home?.heroLocation && <span>{home.heroLocation}</span>}
          <span>
            SENSE <SenseValue className="hero__pf" /> pF
          </span>
        </p>
        {home?.heroCta && <a className="hero__open" href="#contact">{home.heroCta} <span aria-hidden="true">→</span></a>}
      </div>
    </section>
  );
}
