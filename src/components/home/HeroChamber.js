import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { SiGooglescholar } from 'react-icons/si';
import { usePostHog } from '@posthog/react';
import { gsap } from '../../lib/gsap';
import AmbientBackdrop from '../three/AmbientBackdrop';
import SplitText from '../bits/SplitText';
import DecryptedText from '../bits/DecryptedText';
import Magnet from '../bits/Magnet';
import { useScrollToSection } from '../../lib/LenisRoot';
import portrait480 from '../../assets/hero/portrait-480.webp';
import portrait768 from '../../assets/hero/portrait-768.webp';
import portrait1024 from '../../assets/hero/portrait-1024.webp';
import portrait1600 from '../../assets/hero/portrait-1600.webp';
import './css/HeroChamber.css';

// Ported verbatim from the legacy Hero.js — the kinetic word cycler is the
// hero's motion focal point and shouldn't drift between designs.
const WORDS = [
  'Edge AI',
  'TinyML',
  'Embedded Systems',
  'Health Tech',
  'Custom Silicon',
  'FPGA Pipelines',
  'Neural Nets on MCUs',
  'Wearable Sensors',
  'Intelligent Systems',
  'Real-Time DSP',
  'ARM Cortex',
  'the Future',
];

const contentContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 1.0 } },
};

const contentItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function HeroChamber() {
  const posthog = usePostHog();
  const scrollToSection = useScrollToSection();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [armed, setArmed] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);
  const sectionRef = useRef(null);
  const portraitRef = useRef(null);
  const quickXRef = useRef(null);
  const quickYRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setArmed(true), 300);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const id = setInterval(() => setWordIdx((i) => (i + 1) % WORDS.length), 2200);
    return () => clearInterval(id);
  }, [prefersReducedMotion]);

  // Pointer-driven light-leak + portrait tilt. A single pointermove handler
  // drives both: the leak position via a direct CSS-var write (cheap, no
  // React re-render), and the portrait's translate via gsap.quickTo, which
  // supplies its own smoothing between calls so no extra rAF loop is needed.
  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const section = sectionRef.current;
    const portrait = portraitRef.current;
    if (!section || !portrait) return undefined;

    quickXRef.current = gsap.quickTo(portrait, 'x', { duration: 0.7, ease: 'power3.out' });
    quickYRef.current = gsap.quickTo(portrait, 'y', { duration: 0.7, ease: 'power3.out' });

    const handlePointerMove = (e) => {
      const rect = section.getBoundingClientRect();
      section.style.setProperty('--leak-x', `${e.clientX - rect.left}px`);
      section.style.setProperty('--leak-y', `${e.clientY - rect.top}px`);
      section.style.setProperty('--leak-o', '1');

      // Translate-only tilt (no rotate — rotating a bitmap portrait
      // resamples and softens it).
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      quickXRef.current?.(nx * 10);
      quickYRef.current?.(ny * 10);
    };
    const handlePointerLeave = () => {
      section.style.setProperty('--leak-o', '0');
    };

    section.addEventListener('pointermove', handlePointerMove, { passive: true });
    section.addEventListener('pointerleave', handlePointerLeave);
    return () => {
      section.removeEventListener('pointermove', handlePointerMove);
      section.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [prefersReducedMotion]);

  // Scroll-tied portrait parallax + headline scroll-out tween.
  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const ctx = gsap.context(() => {
      if (portraitRef.current) {
        gsap.to(portraitRef.current, {
          yPercent: -14,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            scrub: true,
            start: 'top top',
            end: 'bottom top',
          },
        });
      }
      gsap.to('.hero-chamber__name-text', {
        letterSpacing: '.06em',
        yPercent: -34,
        opacity: 0.05,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom 30%',
          scrub: 0.6,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const handleSeeWork = () => {
    posthog?.capture('home_hero_cta_clicked', { target: 'ventures' });
    scrollToSection('#ventures');
  };

  const handleScrollHint = () => {
    posthog?.capture('home_hero_cta_clicked', { target: 'identity' });
    scrollToSection('#identity');
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      className="hero-chamber"
      aria-label="Introduction to Wanghley Martins"
    >
      <AmbientBackdrop className="hero-chamber__backdrop" />
      <div className="hero-chamber__scrim" aria-hidden="true" />
      <div className="light-leak" aria-hidden="true" />

      <div ref={portraitRef} className="hero-chamber__portrait" aria-hidden="true">
        <img
          className="hero-chamber__portrait-img"
          src={portrait1024}
          srcSet={`${portrait480} 480w, ${portrait768} 768w, ${portrait1024} 1024w, ${portrait1600} 1600w`}
          sizes="(max-width: 768px) 90vw, (max-width: 1200px) 42vw, 560px"
          alt=""
          fetchpriority="high"
          decoding="async"
        />
        <span className="hero-chamber__portrait-annot">
          <span className="hero-chamber__portrait-annot-dash" />
          SUBJECT&nbsp;·&nbsp;WSM
        </span>
      </div>

      <div className="hero-chamber__hud" aria-hidden="true">
        <div className="hero-chamber__hud-inner">
          <span className="hero-chamber__hud-seg">
            <span className="hero-chamber__hud-id">CH:00</span>
            <span className="hero-chamber__hud-dash" />
            ORIGIN
          </span>
          <span className="hero-chamber__hud-seg hero-chamber__hud-seg--status">
            STATUS&nbsp;
            <span className="hero-chamber__hud-live">
              <span className="telemetry__dot" />
              <DecryptedText text="NOMINAL" trigger={armed} speed={22} />
            </span>
          </span>
        </div>
      </div>

      <aside className="hero-chamber__meta" aria-hidden="true">
        LOC&nbsp;36.0°N&nbsp;·&nbsp;78.9°W
      </aside>

      <div className="hero-chamber__stage">
        <motion.div
          className="hero-chamber__content"
          variants={contentContainer}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="show"
        >
          <motion.div className="eyebrow hero-chamber__eyebrow" variants={contentItem}>
            ENGINEER · RESEARCHER · MAKER · INVENTOR · DESIGNER
          </motion.div>

          <SplitText
            as="h1"
            mode="mask"
            text="WANGHLEY"
            className="hero-chamber__name-text"
            delay={0.55}
          />

          <motion.div
            className="hero-chamber__cycler"
            variants={contentItem}
            aria-label={`I build ${WORDS[wordIdx]}`}
          >
            <span className="hero-chamber__cycler-lead">I build</span>
            <span className="hero-chamber__cycler-box" aria-live="polite" aria-atomic="true">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIdx}
                  className="hero-chamber__cycler-word"
                  initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                  transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {WORDS[wordIdx]} ▸
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.div>

          <motion.div className="hero-chamber__ctas" variants={contentItem}>
            <Magnet
              as={motion.button}
              type="button"
              className="btn btn--primary hero-chamber__cta"
              onClick={handleSeeWork}
              aria-label="See my work"
            >
              See My Work
              <span className="hero-chamber__cta-arrow">→</span>
            </Magnet>
            <a
              href="/contact"
              className="btn btn--ghost"
              onClick={() => posthog?.capture('home_hero_contact_clicked')}
            >
              Contact
            </a>
          </motion.div>

          <motion.nav
            className="hero-chamber__social"
            variants={contentItem}
            aria-label="Social media links"
          >
            <a
              href="https://github.com/wanghley"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-chamber__social-icon"
              title="GitHub"
              aria-label="Visit my GitHub profile (opens in new tab)"
              onClick={() => posthog?.capture('social_link_clicked', { platform: 'github', location: 'hero' })}
            >
              <FaGithub aria-hidden="true" />
            </a>
            <a
              href="https://linkedin.com/in/wanghley"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-chamber__social-icon"
              title="LinkedIn"
              aria-label="Visit my LinkedIn profile (opens in new tab)"
              onClick={() => posthog?.capture('social_link_clicked', { platform: 'linkedin', location: 'hero' })}
            >
              <FaLinkedin aria-hidden="true" />
            </a>
            <a
              href="https://scholar.google.com/citations?user=sN2iKrkAAAAJ"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-chamber__social-icon"
              title="Google Scholar"
              aria-label="Visit my Google Scholar profile (opens in new tab)"
              onClick={() => posthog?.capture('social_link_clicked', { platform: 'scholar', location: 'hero' })}
            >
              <SiGooglescholar aria-hidden="true" />
            </a>
          </motion.nav>
        </motion.div>
      </div>

      <button type="button" className="hero-chamber__hint" onClick={handleScrollHint}>
        Scroll to explore <span className="hero-chamber__hint-arrow">↓</span>
      </button>
    </section>
  );
}
