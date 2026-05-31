import React, { useState, useEffect } from 'react'
import './css/About.css'
import { FaPlay } from 'react-icons/fa'

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
  const [isVisible, setIsVisible] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
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

    const section = document.getElementById('ch-01');
    if (section) observer.observe(section);
    return () => { if (section) observer.unobserve(section); };
  }, []);

  return (
    <section
      className={`about section-light ${isVisible ? 'about--visible' : ''} ${prefersReducedMotion ? 'about--reduced-motion' : ''}`}
      id="ch-01"
      aria-label="About Wanghley Martins — Origin Story"
    >
      {/* Faint blueprint grid background for visual texture */}
      <div className="about__bg" aria-hidden="true" />

      <div className="container">
        <div className="about__channel">
          <span className="about__channel-id">CH:01</span>
          <span className="about__channel-sep" />
          <span className="about__channel-title">ORIGIN STORY</span>
        </div>

        <div className={`about-grid ${isVisible ? 'reveal in' : 'reveal'}`}>

          {/* Left 30 — TEDx card (compact, vertical) */}
          <aside className="about__media">
            <div className="about__media-meta">
              <span className="about__meta-label">FOOTAGE</span>
              <span className="about__meta-value">FILM 23.4</span>
            </div>

            <div className="tedx-card" onClick={() => setIsVideoPlaying(true)}>
              <div className="tedx-thumb">
                {!isVideoPlaying ? (
                  <>
                    <img
                      src="https://img.youtube.com/vi/FOkCz0W5pgw/maxresdefault.jpg"
                      alt="TEDxDuke 2023 — The Art of Innovation"
                      className="tedx-thumb-img"
                      loading="lazy"
                    />
                    <div className="tedx-play">
                      <button
                        className="tedx-play-btn"
                        aria-label="Play TEDx video: The Art of Innovation"
                        type="button"
                        onClick={e => { e.stopPropagation(); setIsVideoPlaying(true); }}
                      >
                        <FaPlay aria-hidden="true" />
                      </button>
                    </div>
                  </>
                ) : (
                  <iframe
                    className="tedx-iframe"
                    src="https://www.youtube.com/embed/FOkCz0W5pgw?autoplay=1&rel=0"
                    title="TEDxDuke 2023 — The Art of Innovation"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
              <div className="tedx-label">
                <span className="tedx-ey">TEDxDuke · 2023</span>
                <p className="tedx-title">&ldquo;The Art of Innovation&rdquo;</p>
              </div>
            </div>
          </aside>

          {/* Right 70 — narrative + pull quote */}
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

            <a href="/contact" className="about-link">
              <span className="about-link__bracket">[</span>
              START A COLLABORATION
              <span className="about-link__arrow">→</span>
              <span className="about-link__bracket">]</span>
            </a>
          </div>

        </div>

        {/* Credentials ticker — full-width, below grid */}
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
    </section>
  );
};

export default About;
