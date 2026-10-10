import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { usePostHog } from '@posthog/react';
import { useCanAnimateCanvas } from '../../hooks/useCanRender3D';
import { getLinkedSkillNames, getProjectSlugs } from '../../data/skillGraph';
import { fetchFeaturedSkills } from '../../api/skills';
import SkillFilterChips from '../SkillFilterChips';
import './css/SkillField.css';

const SkillFieldCanvas = React.lazy(() => import('./SkillFieldCanvas'));

export default function SkillField() {
  const posthog = usePostHog();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeId, setActiveId] = useState(null);
  const canAnimateCanvas = useCanAnimateCanvas();
  const [inView, setInView] = useState(false);
  const canvasHostRef = useRef(null);

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

  useEffect(() => {
    const node = canvasHostRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px 0px' }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const categories = useMemo(
    () => [...new Set(skills.map((s) => s.type).filter(Boolean))],
    [skills]
  );

  const grouped = useMemo(() => {
    const source =
      selectedCategory === 'All' ? skills : skills.filter((s) => s.type === selectedCategory);
    const map = new Map();
    for (const skill of source) {
      const key = skill.type || 'Other';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(skill);
    }
    return [...map.entries()];
  }, [skills, selectedCategory]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    posthog?.capture('skill_category_filtered', { category, location: 'home_skill_field' });
  };

  const activeSkill = useMemo(
    () => skills.find((s) => s.name === activeId) || null,
    [skills, activeId]
  );
  const activeLinks = activeSkill ? getLinkedSkillNames(activeSkill.name) : [];
  const activeProjects = activeSkill ? getProjectSlugs(activeSkill.name) : [];

  const dimGroup = selectedCategory === 'All' ? null : selectedCategory;
  const showCanvas = canAnimateCanvas && inView && !loading && skills.length > 0;

  return (
    <section id="matrix" className="skill-field section-blend-from-paper" aria-labelledby="skill-field-heading">
      <span className="skill-field__title" aria-hidden="true">
        CAPABILITY&nbsp;MATRIX
      </span>

      <div className="home-grid skill-field__grid">
        <div className="skill-field__index">
          <span className="channel-mark">
            <span className="channel-mark__id">CH:05</span>
            <span className="channel-mark__sep" />
            <span className="channel-mark__title">CAPABILITY MATRIX</span>
          </span>
          <h2 className="skill-field__heading" id="skill-field-heading">
            The instruments
            <br />
            on the bench.
          </h2>
          <p className="skill-field__subtitle">
            A working set of tools and domains. Hover or focus a node to trace what
            connects to what.
          </p>

          <div className="skill-field__filters">
            <span className="telemetry">CHANNEL SELECTOR</span>
            <SkillFilterChips
              categories={categories}
              selected={selectedCategory}
              onSelect={handleCategorySelect}
            />
          </div>

          {loading ? (
            <p className="skill-field__loading">Loading capability index…</p>
          ) : (
            <ul className="skill-field__index-list" aria-label="Capability index">
              {grouped.map(([group, groupSkills]) => (
                <li key={group} className="skill-field__index-group">
                  <span className="skill-field__index-group-label">{group}</span>
                  <ul className="skill-field__index-group-items">
                    {groupSkills.map((skill) => (
                      <li key={skill.name}>
                        <button
                          type="button"
                          className={`skill-field__index-btn${activeId === skill.name ? ' is-active' : ''}`}
                          aria-pressed={activeId === skill.name}
                          aria-describedby="skill-field-readout"
                          onMouseEnter={() => setActiveId(skill.name)}
                          onFocus={() => setActiveId(skill.name)}
                          onMouseLeave={() => setActiveId((cur) => (cur === skill.name ? null : cur))}
                          onBlur={() => setActiveId((cur) => (cur === skill.name ? null : cur))}
                        >
                          {skill.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}

          <div className="skill-field__readout" id="skill-field-readout" aria-live="polite">
            {activeSkill ? (
              <>
                <span className="telemetry">NODE&nbsp;·&nbsp;{activeSkill.name.toUpperCase()}</span>
                <span className="skill-field__readout-line">
                  TYPE {activeSkill.type || 'UNKNOWN'} · LINKS {activeLinks.length}
                </span>
                {activeProjects.length > 0 && (
                  <span className="skill-field__readout-line">
                    PROJECTS:{' '}
                    {activeProjects.map((slug, i) => (
                      <React.Fragment key={slug}>
                        {i > 0 && ', '}
                        <a href={`/projects/${slug}`}>{slug}</a>
                      </React.Fragment>
                    ))}
                  </span>
                )}
              </>
            ) : (
              <span className="telemetry telemetry--muted">HOVER OR FOCUS A NODE</span>
            )}
          </div>
        </div>

        <div ref={canvasHostRef} className="skill-field__canvas" aria-hidden="true">
          {showCanvas && (
            <Suspense fallback={null}>
              <SkillFieldCanvas
                skills={skills}
                activeId={activeId}
                onHoverChange={setActiveId}
                dimGroup={dimGroup}
              />
            </Suspense>
          )}
        </div>
      </div>
    </section>
  );
}
