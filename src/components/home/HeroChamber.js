import React, { useEffect, useState } from 'react';
import { usePostHog } from '../../lib/analytics';
import { useScrollToSection } from '../../lib/LenisRoot';
import HeroBench, { SenseValue } from './HeroBench';
import './css/HeroChamber.css';

// Hero copy lives in /copy.md. Edit it there, then mirror it here.
const COPY = {
  eyebrow: 'Brazilian engineer · PhD, Rice ECE',
  headline: 'I put the intelligence inside the sensor.',
  support: 'PhD at Rice building wearable biosensors and the microwatt AI that runs on them.',
  noteFine:
    'Move closer. This board is reading you, the way my wrist sensor reads a hand without touching it.',
  noteTouch:
    'Watch the board read a hand without touching it, the way my wrist sensor does.',
};

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

export default function HeroChamber() {
  const posthog = usePostHog();
  const scrollToSection = useScrollToSection();
  const reduced = useReducedMotion();
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <HeroBench className="hero__bench" reducedMotion={reduced} />

      <div className="hero__content bench-col">
        <p className="hero__eyebrow">{COPY.eyebrow}</p>

        <h1 id="hero-title" className="hero__title">
          <span className="hero__name">Wanghley</span>
          <span className="sr-only"> Soares Martins. </span>
          <span className="hero__headline">{COPY.headline}</span>
        </h1>

        <p className="hero__support">{COPY.support}</p>

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

        <p className="hero__note">{coarse ? COPY.noteTouch : COPY.noteFine}</p>
      </div>

      <p className="sr-only">
        Illustration: a circuit board with a copper sensing pad and a figure of Wanghley standing on it. When the
        board senses a hand, the capacitance reading rises from 0.18 to 2.14 picofarads and the signal is classified as a hand.
      </p>

      <div className="hero__instrument bench-col">
        <p aria-hidden="true" className="hero__readout">
          <span>RICE ECE</span>
          <span>HOUSTON 29.72°N 95.40°W</span>
          <span>
            SENSE <SenseValue className="hero__pf" /> pF
          </span>
          <span>* ILLUSTRATIVE UNTIL MEASURED</span>
        </p>
        <a className="hero__open" href="#contact">Open to roles, research and speaking <span aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}
