import React, { useState, useEffect } from 'react'
import './css/About.css'
import { FaPlay, FaTimes } from 'react-icons/fa'
import { usePostHog } from '@posthog/react'

const CREDENTIALS = [
  { name: 'Karsh Scholar',     sub: 'Duke · Full Merit' },
  { name: 'TEDx Speaker',      sub: 'Duke 2023' },
  { name: 'FEBRACE Gold',      sub: '1st Place Eng. 2021' },
  { name: 'ISEF Finalist',     sub: 'J&J · Biomedical' },
  { name: 'Líder Estudar',     sub: 'Fellow' },
  { name: 'Belgrade Gold',     sub: "29th Int'l Young Sci." },
  { name: '13 Publications',   sub: 'Peer-reviewed · Biomedical' },
  { name: 'Ambulis INC.',      sub: 'Co-founder · Oncology AI' },
  { name: 'Duke BIG IDEAs',    sub: 'Lab Researcher' },
  { name: '$800K+ Grants',     sub: 'Secured' },
];

const About = () => {
  const posthog = usePostHog();
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsVisible(true);
        });
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('about');
    if (section) observer.observe(section);
    return () => { if (section) observer.unobserve(section); };
  }, []);

  /* Lock body scroll + close on Escape when modal is open */
  useEffect(() => {
    if (!isModalOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') setIsModalOpen(false); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  return (
    <section
      className={`about section-light ${isVisible ? 'about--visible' : ''} ${prefersReducedMotion ? 'about--reduced-motion' : ''}`}
      id="about"
      aria-label="About Wanghley Martins — Origin Story"
    >
      <div className="about__bg" aria-hidden="true" />

      <div className="container">
        <div className="about__channel">
          <span className="about__channel-id">CH:01</span>
          <span className="about__channel-sep" />
          <span className="about__channel-title">ORIGIN STORY</span>
        </div>

        <div className={`about-grid ${isVisible ? 'reveal in' : 'reveal'}`}>

          {/* Left — pitch video + stats */}
          <aside className="about__media">
            <div className="about__media-meta">
              <span className="about__meta-label">INTRO BRIEF</span>
              <span className="about__meta-value">1 MIN</span>
            </div>

            <div className="tedx-card" onClick={() => { setIsModalOpen(true); posthog?.capture('about_video_opened', { source: 'card' }); }} role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setIsModalOpen(true)}>
              <div className="tedx-thumb">
                <img
                  src="https://img.youtube.com/vi/FOkCz0W5pgw/maxresdefault.jpg"
                  alt="Wanghley Martins — 60-second introduction"
                  className="tedx-thumb-img"
                  loading="lazy"
                />
                <div className="tedx-thumb-overlay" aria-hidden="true" />
                <span className="tedx-duration" aria-hidden="true">1:00</span>
                <div className="tedx-play">
                  <button
                    className="tedx-play-btn"
                    aria-label="Play 60-second introduction video (opens fullscreen)"
                    type="button"
                    onClick={e => { e.stopPropagation(); setIsModalOpen(true); posthog?.capture('about_video_opened', { source: 'play_button' }); }}
                  >
                    <FaPlay aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="tedx-label">
                <span className="tedx-ey">WATCH FIRST · 60 SECONDS</span>
                <p className="tedx-title">Watch the 60-Second Brief</p>
              </div>
            </div>
          </aside>

          {/* Right — narrative + pull quote */}
          <div className="about__narrative">
            <h2 className="about-heading">
              Bridging Physical Constraints<br />with <em>Digital Intelligence.</em>
            </h2>

            <p className="about-body">
              As an electrical and computer engineer, computer scientist, and entrepreneur,
              my true differential is end-to-end architectural ownership. I bridge the gap
              between the physical and digital by combining custom electronics and sensor
              interface design with advanced signal processing and autonomous expert systems.
              From critical infrastructure to healthcare, I engineer high-reliability solutions
              for the real economy.
            </p>

            <figure className="about__quote">
              <span className="about__quote-rule" />
              <blockquote className="about__quote-body">
                <span className="about__quote-mark" aria-hidden="true">&ldquo;</span>
                I don&apos;t just write the software.<br />
                <em className="about__quote-em">I architect the physical systems that run it.</em>
              </blockquote>
              <figcaption className="about__quote-cite">
                <span className="about__quote-cite-dash" />
                MAKER · RESEARCHER · SPEAKER
              </figcaption>
            </figure>

            <a href="/contact" className="about-link" onClick={() => posthog?.capture('about_collaboration_clicked')}>
              START A COLLABORATION
              <span className="about-link__arrow">→</span>
            </a>
          </div>

        </div>

        {/* Credentials ticker */}
        <div className="about__creds">
          <div className="about__creds-head">
            <span className="about__creds-label">
              <span className="about__creds-dash" />
              CREDENTIALS · LIVE FEED
            </span>
            <span className="about__creds-meta">{CREDENTIALS.length} ENTRIES · UPDATED 2026.Q2</span>
          </div>

          <div className="ticker ticker--light about__ticker">
            <div className="ticker__track">
              {[...CREDENTIALS, ...CREDENTIALS].map((c, idx) => (
                <span className="ticker__item" key={`${c.name}-${idx}`}>
                  <span className="about__creds-name">{c.name}</span>
                  <span className="about__creds-sub">/&nbsp;{c.sub}</span>
                  <span className="ticker__sep">·</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic fullscreen modal */}
      {isModalOpen && (
        <div
          className="about__modal"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="60-second introduction video"
        >
          <button
            className="about__modal-close"
            onClick={() => setIsModalOpen(false)}
            aria-label="Close video"
            type="button"
          >
            <FaTimes aria-hidden="true" />
          </button>
          <div className="about__modal-content" onClick={e => e.stopPropagation()}>
            <iframe
              className="about__modal-iframe"
              src="https://www.youtube.com/embed/FOkCz0W5pgw?autoplay=1&rel=0"
              title="Wanghley Martins — 60-second introduction"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default About;
