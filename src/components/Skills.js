import React, { useEffect, useMemo, useState } from "react";
import { usePostHog } from "@posthog/react";
import SkillFilterChips from "./SkillFilterChips";
import { fetchFeaturedSkills } from "../api/skills";
import "./css/Skills.css";

const INITIAL_COUNT = 12;

const Skills = () => {
  const posthog = usePostHog();
  const [featuredSkills, setFeaturedSkills] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);
    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleMotionChange);
    setIsVisible(true);
    return () => motionQuery.removeEventListener("change", handleMotionChange);
  }, []);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        setLoading(true);
        const data = await fetchFeaturedSkills();
        if (!alive) return;
        setFeaturedSkills(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching skills:", error);
        if (!alive) return;
        setFeaturedSkills([]);
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => { alive = false; };
  }, []);

  const categories = useMemo(
    () => [...new Set(featuredSkills.map((s) => s.type).filter(Boolean))],
    [featuredSkills]
  );

  const filteredSkills = useMemo(() =>
    selectedCategory === "All"
      ? featuredSkills
      : featuredSkills.filter((s) => s.type === selectedCategory),
    [featuredSkills, selectedCategory]
  );

  const displayedSkills = useMemo(() =>
    expanded ? filteredSkills : filteredSkills.slice(0, INITIAL_COUNT),
    [filteredSkills, expanded]
  );

  const hiddenCount = Math.max(0, filteredSkills.length - INITIAL_COUNT);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setExpanded(false);
    posthog?.capture("skill_category_filtered", { category });
  };

  return (
    <section
      id="ch-03"
      className={`skills section-light ${isVisible ? "skills--visible" : ""} ${
        prefersReducedMotion ? "skills--reduced-motion" : ""
      }`}
      aria-label="Capability matrix"
    >
      <div className="skills__bg" aria-hidden="true">
        <div className="skills__schema" />
      </div>

      <div className="skills__container">
        <header className="skills__header">
          <div className="skills__title-block">
            <span className="skills__label">
              <span className="skills__label-id">CH:03</span>
              <span className="skills__label-sep" />
              CAPABILITY MATRIX
            </span>
            <h2 className="skills__title">
              The instruments<br />on the bench.
            </h2>
            <p className="skills__subtitle">
              A working set of tools and domains. Filter by channel —
              edge silicon to cloud orchestration.
            </p>
          </div>

          <div className="skills__filters" aria-label="Skill filters">
            <span className="skills__filters-label">CHANNEL SELECTOR</span>
            <SkillFilterChips
              categories={categories}
              selected={selectedCategory}
              onSelect={handleCategorySelect}
            />
          </div>
        </header>

        <div className="skills__panel" role="region" aria-label="Skills browser">
          {loading ? (
            <div className="skills__skeleton">
              {Array.from({ length: 12 }).map((_, i) => (
                <div className="skills__skeleton-chip" key={i} />
              ))}
            </div>
          ) : displayedSkills.length === 0 ? (
            <div className="skills__empty">
              <h3>No skills found</h3>
              <p>Try a different channel.</p>
            </div>
          ) : (
            <ul className="skills__grid" aria-label="Skill modules">
              {displayedSkills.map((skill, i) => {
                const level = (skill?.level ?? "unknown").toLowerCase();
                const isNew = expanded && i >= INITIAL_COUNT;
                return (
                  <li
                    key={`${skill?.name ?? "skill"}-${i}`}
                    className={`skills__chip skills__chip--${level}`}
                    style={{
                      "--chip-delay": isNew
                        ? `${(i - INITIAL_COUNT) * 20}ms`
                        : `${i * 22}ms`,
                    }}
                  >
                    {skill?.icon ? (
                      <img
                        className="skills__chip-icon"
                        src={skill.icon}
                        alt=""
                        loading="lazy"
                      />
                    ) : (
                      <span className="skills__chip-icon skills__chip-icon--fallback" aria-hidden="true" />
                    )}
                    <span className="skills__chip-name">{skill?.name ?? "Untitled"}</span>
                    <span className="skills__chip-dot" aria-hidden="true" />
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && !expanded && hiddenCount > 0 && (
            <div className="skills__expand-row">
              <button
                className="skills__expand"
                onClick={() => {
                  setExpanded(true);
                  posthog?.capture("skills_expanded", {
                    revealed: hiddenCount,
                    category: selectedCategory,
                  });
                }}
              >
                <span>SHOW {hiddenCount} MORE</span>
                <span className="skills__expand-arrow" aria-hidden="true">↓</span>
              </button>
            </div>
          )}
        </div>

        <footer className="skills__footer">
          <a className="skills__cta" href="/projects">
            VIEW ALL PROJECTS
            <span className="skills__cta-arrow" aria-hidden="true">→</span>
          </a>
        </footer>
      </div>
    </section>
  );
};

export default Skills;
