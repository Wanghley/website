import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePostHog } from '@posthog/react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { fetchFeaturedSkills } from '../../api/skills';
import SkillFilterChips from '../SkillFilterChips';
import SpotlightCard from '../bits/SpotlightCard';
import './css/TechMatrix.css';

export default function TechMatrix() {
  const posthog = usePostHog();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const gridRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchFeaturedSkills();
        if (alive) setSkills(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching skills:', err);
        if (alive) setSkills([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(
    () => [...new Set(skills.map((s) => s.type).filter(Boolean))],
    [skills]
  );

  const filteredSkills = useMemo(
    () =>
      selectedCategory === 'All'
        ? skills
        : skills.filter((s) => s.type === selectedCategory),
    [skills, selectedCategory]
  );

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    posthog?.capture('skill_category_filtered', { category, location: 'home_tech_matrix' });
  };

  // Diagonal wipe reveal — grouped batches so a re-filter doesn't have to
  // wait for a fresh scroll to replay the animation.
  useEffect(() => {
    if (loading) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      const tiles = gsap.utils.toArray('.tech-matrix__tile');
      if (!tiles.length) return;

      if (reduced) {
        gsap.set(tiles, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(tiles, { opacity: 0, y: 24 });
      ScrollTrigger.batch(tiles, {
        start: 'top 90%',
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            stagger: { each: 0.035, grid: 'auto', from: 'start' },
            overwrite: true,
          }),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, filteredSkills]);

  return (
    <section ref={sectionRef} id="matrix" className="tech-matrix" aria-label="Capability matrix">
      <div className="tech-matrix__blueprint" aria-hidden="true" />

      <div className="container tech-matrix__container">
        <header className="tech-matrix__header">
          <span className="channel-mark">
            <span className="channel-mark__id">CH:03</span>
            <span className="channel-mark__sep" />
            <span className="channel-mark__title">CAPABILITY MATRIX</span>
          </span>
          <h2 className="tech-matrix__title">
            The instruments
            <br />
            on the bench.
          </h2>
          <p className="tech-matrix__subtitle">
            A working set of tools and domains. Filter by channel — edge
            silicon to cloud orchestration.
          </p>

          <div className="tech-matrix__filters">
            <span className="telemetry">CHANNEL SELECTOR</span>
            <SkillFilterChips
              categories={categories}
              selected={selectedCategory}
              onSelect={handleCategorySelect}
            />
          </div>
        </header>

        <div ref={gridRef} className="tech-matrix__panel">
          {loading ? (
            <div className="tech-matrix__grid" aria-label="Loading skills">
              {Array.from({ length: 12 }).map((_, i) => (
                <div className="tech-matrix__tile tech-matrix__tile--skeleton" key={i} />
              ))}
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="tech-matrix__empty">
              <h3>No skills found</h3>
              <p>Try a different channel.</p>
            </div>
          ) : (
            <ul className="tech-matrix__grid" aria-label="Skill modules">
              {filteredSkills.map((skill, i) => {
                const level = (skill?.level ?? 'unknown').toLowerCase();
                const row = Math.floor(i / 4) + 1;
                const col = (i % 4) + 1;
                return (
                  <li key={`${skill?.name ?? 'skill'}-${i}`} className="tech-matrix__tile">
                    <SpotlightCard className={`glass-panel tech-matrix__card tech-matrix__card--${level}`}>
                      <span className="tech-matrix__coord">
                        R{row}·C{col}
                      </span>
                      {skill?.icon ? (
                        <img className="tech-matrix__icon" src={skill.icon} alt="" loading="lazy" />
                      ) : (
                        <span className="tech-matrix__icon tech-matrix__icon--fallback" aria-hidden="true" />
                      )}
                      <span className="tech-matrix__name">{skill?.name ?? 'Untitled'}</span>
                      <span className="tech-matrix__meter" aria-hidden="true">
                        <span
                          className="tech-matrix__meter-fill"
                          style={{ width: `${Math.max(8, Math.min(100, skill?.score ?? 60))}%` }}
                        />
                      </span>
                    </SpotlightCard>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="tech-matrix__footer">
          <a className="tech-matrix__cta" href="/projects">
            VIEW ALL PROJECTS
            <span className="tech-matrix__cta-arrow">→</span>
          </a>
        </footer>
      </div>
    </section>
  );
}
