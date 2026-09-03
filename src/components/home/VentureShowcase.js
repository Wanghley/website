import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePostHog } from '@posthog/react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { fetchProjects } from '../../api/projects';
import { cloudinarySrc, cloudinarySrcSet, CARD_SIZES } from '../../utils/cloudinaryImage';
import SpotlightCard from '../bits/SpotlightCard';
import './css/VentureShowcase.css';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
];

// Deterministic per-index scale + vertical rhythm — the track stops being
// five identical-width clones in a row. Cycled with modulo so any number
// of projects still gets variety.
const RHYTHM = [1.0, 0.62, 1.28, 0.78, 1.05];
const SHIFT_VH = [0, 9, -7, 5, -3];

const getProjectImage = (project) => {
  const formats = project?.attributes?.Featured?.data?.attributes?.formats;
  return (
    formats?.large?.url ||
    formats?.medium?.url ||
    formats?.small?.url ||
    formats?.thumbnail?.url ||
    project?.attributes?.Featured?.data?.attributes?.url ||
    null
  );
};

const getProjectHref = (project) => {
  const slug = project?.attributes?.slug;
  return slug ? `/projects/${slug}` : '/projects';
};

// Ported from GridFeatured.js — deterministic build id per project.
const getBuildId = (project, index) => {
  const base = (project?.attributes?.slug || `proj-${index}`)
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase()
    .slice(0, 4)
    .padEnd(4, 'X');
  const year = 2024 + (index % 2);
  const seq = String(index + 1).padStart(3, '0');
  return `BLD-${year}-${seq} · ${base}`;
};

// Ported from GridFeatured.js — status pill derived from category (visual only).
const getStatus = (project, index) => {
  const cat = (project?.attributes?.Category || '').toLowerCase();
  if (cat.includes('research') || cat.includes('paper')) return { label: 'RESEARCH', className: 'venture-card__status--research' };
  if (cat.includes('archive') || cat.includes('legacy')) return { label: 'ARCHIVED', className: 'venture-card__status--archived' };
  if (index === 0) return { label: 'LIVE', className: 'venture-card__status--live' };
  return { label: 'DEPLOYED', className: 'venture-card__status--deployed' };
};

export default function VentureShowcase() {
  const posthog = usePostHog();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [progress, setProgress] = useState({ index: 0, fraction: 0 });
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const response = await fetchProjects(1, 10);
        if (!alive) return;
        const data = Array.isArray(response.data) ? response.data.slice(0, 5) : [];
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        if (alive) setProjects([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(() => projects, [projects]);

  // Pinned horizontal scroll (desktop) — a native scroll-snap rail is used
  // below 1024px instead; pinning on touch devices fights Lenis and the
  // browser's URL-bar resize. gsap.matchMedia() re-arms/disarms this
  // automatically on resize across the 1024px breakpoint.
  useEffect(() => {
    if (loading || items.length === 0 || reducedMotion) return undefined;

    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      setIsDesktop(true);
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return undefined;

      const getScrollDistance = () => track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          end: () => `+=${getScrollDistance()}`,
          onUpdate(self) {
            const total = items.length; // intro panel doesn't count toward the index
            const scaled = self.progress * total;
            setProgress({
              index: Math.min(total - 1, Math.floor(scaled)),
              fraction: self.progress,
            });
          },
        },
      });

      // Panel images load async — refresh once they've decoded so the
      // pinned scroll distance isn't measured against a too-narrow track.
      const imgs = track.querySelectorAll('img');
      Promise.all(
        Array.from(imgs).map((img) =>
          img.decode ? img.decode().catch(() => {}) : Promise.resolve()
        )
      ).then(() => ScrollTrigger.refresh());

      return () => tween.scrollTrigger?.kill();
    });

    mm.add('(max-width: 1023px)', () => {
      setIsDesktop(false);
      return undefined;
    });

    return () => mm.revert();
  }, [loading, items, reducedMotion]);

  // Real chiaroscuro: cards brighten crossing screen-center, fall toward
  // void at the edges. Cheap at ≤6 visible cards, driven by the shared
  // gsap.ticker so it costs nothing extra beyond the pin's own frame.
  useEffect(() => {
    if (loading || items.length === 0 || reducedMotion) return undefined;
    const track = trackRef.current;
    if (!track) return undefined;
    const cards = Array.from(track.querySelectorAll('.venture-card'));
    if (!cards.length) return undefined;

    const tick = () => {
      const centerX = window.innerWidth / 2;
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        if (rect.right < -200 || rect.left > window.innerWidth + 200) continue; // skip far-offscreen
        const cardCenter = rect.left + rect.width / 2;
        const dist = Math.abs(cardCenter - centerX);
        const light = Math.max(0, 1 - dist / (window.innerWidth * 0.65));
        card.style.setProperty('--card-light', light.toFixed(3));
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [loading, items, reducedMotion]);

  const toggleExpand = (id) => {
    setExpandedId((cur) => (cur === id ? null : id));
  };

  const handleCardKeyDown = (e, id) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand(id);
    } else if (e.key === 'Escape' && expandedId === id) {
      setExpandedId(null);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="ventures"
      className="venture-showcase"
      aria-label="Field Deployments — Selected Engineering Projects"
    >
      <div ref={trackRef} className="venture-showcase__track">
        <div className="venture-showcase__panel venture-showcase__panel--intro">
          <span className="channel-mark">
            <span className="channel-mark__id">CH:02</span>
            <span className="channel-mark__sep" />
            <span className="channel-mark__title">FIELD DEPLOYMENTS</span>
          </span>
          <h2 className="venture-showcase__title">
            Builds in
            <br />
            production.
          </h2>
          <p className="venture-showcase__subtitle">
            End-to-end systems built with precision. From custom silicon to
            cloud infrastructure.
          </p>
          <div className="venture-showcase__meta">
            <span className="venture-showcase__meta-row">
              <span className="venture-showcase__meta-key">UNITS</span>
              <span className="venture-showcase__meta-val">{items.length || '—'}</span>
            </span>
            <span className="venture-showcase__meta-row">
              <span className="venture-showcase__meta-key">DOMAIN</span>
              <span className="venture-showcase__meta-val">SILICON → CLOUD</span>
            </span>
          </div>
          <a
            className="venture-showcase__cta"
            href="/projects"
            onClick={() => posthog?.capture('home_projects_cta_clicked')}
          >
            VIEW ALL PROJECTS
            <span className="venture-showcase__cta-arrow">→</span>
          </a>
          {!isDesktop && (
            <span className="venture-showcase__swipe-hint">Swipe to explore →</span>
          )}
        </div>

        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div className="venture-showcase__panel venture-card venture-card--skeleton" key={i} />
          ))}

        {!loading &&
          items.map((project, index) => {
            const title = project?.attributes?.Title || 'Untitled Project';
            const teaser = project?.attributes?.Teaser;
            const category = project?.attributes?.Category;
            const image = getProjectImage(project) || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
            const buildId = getBuildId(project, index);
            const status = getStatus(project, index);
            const id = project?.id ?? `${title}-${index}`;
            const expanded = expandedId === id;
            const href = getProjectHref(project);

            return (
              <div
                className="venture-showcase__panel"
                key={id}
                style={{
                  '--rhythm': RHYTHM[index % RHYTHM.length],
                  '--shift': `${SHIFT_VH[index % SHIFT_VH.length]}vh`,
                }}
              >
                <SpotlightCard
                  as="div"
                  role="button"
                  tabIndex={0}
                  className={`glass-panel venture-card${expanded ? ' is-expanded' : ''}`}
                  aria-label={`${expanded ? 'Collapse' : 'Expand'} project: ${title}`}
                  aria-expanded={expanded}
                  onClick={() => toggleExpand(id)}
                  onKeyDown={(e) => handleCardKeyDown(e, id)}
                >
                  <div className="venture-card__telemetry">
                    <span className="venture-card__build">{buildId}</span>
                    <span className={`venture-card__status ${status.className}`}>
                      <span className="telemetry__dot" />
                      {status.label}
                    </span>
                  </div>

                  <div className="venture-card__image">
                    <img
                      className="venture-card__image-el"
                      src={cloudinarySrc(image, { width: 900 })}
                      srcSet={cloudinarySrcSet(image, [450, 900, 1350])}
                      sizes={CARD_SIZES}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="venture-card__image-overlay" />
                  </div>

                  <div className="venture-card__content">
                    {category && <span className="venture-card__tag">{category}</span>}
                    <h3 className="venture-card__title">{title}</h3>
                    {teaser && <p className="venture-card__teaser">{teaser}</p>}

                    {expanded ? (
                      <div className="venture-card__brief">
                        <a
                          className="venture-card__case-study"
                          href={href}
                          onClick={(e) => {
                            e.stopPropagation();
                            posthog?.capture('featured_project_clicked', { title, category, index });
                          }}
                        >
                          Open case study
                          <span className="venture-card__link-arrow">→</span>
                        </a>
                      </div>
                    ) : (
                      <span className="venture-card__link" aria-hidden="true">
                        EXPLORE
                        <span className="venture-card__link-arrow">→</span>
                      </span>
                    )}
                  </div>
                </SpotlightCard>
              </div>
            );
          })}

        {!loading && items.length === 0 && (
          <div className="venture-showcase__panel venture-showcase__empty">
            <h3>No projects found</h3>
            <p>Engineering projects coming soon.</p>
          </div>
        )}
      </div>

      {isDesktop && !reducedMotion && items.length > 0 && (
        <div className="venture-showcase__progress" aria-hidden="true">
          <span className="venture-showcase__progress-index">
            {String(progress.index + 1).padStart(2, '0')}
          </span>
          <span className="venture-showcase__progress-track">
            <span
              className="venture-showcase__progress-fill"
              style={{ width: `${progress.fraction * 100}%` }}
            />
          </span>
          <span className="venture-showcase__progress-index">
            {String(items.length).padStart(2, '0')}
          </span>
        </div>
      )}
    </section>
  );
}
