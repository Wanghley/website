import React, { useEffect, useMemo, useState } from "react";
import { usePostHog } from "@posthog/react";
import SkillFilterChips from "./SkillFilterChips";
import { fetchFeaturedSkills } from "../api/skills";
import "./css/Skills.css";

const Skills = () => {
  const posthog = usePostHog();
  const [featuredSkills, setFeaturedSkills] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleMotionChange);

    const mobileQuery = window.matchMedia("(max-width: 600px)");
    setIsMobile(mobileQuery.matches);

    const handleMobileChange = (e) => setIsMobile(e.matches);
    mobileQuery.addEventListener("change", handleMobileChange);

    setIsVisible(true);

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      mobileQuery.removeEventListener("change", handleMobileChange);
    };
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
    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(
    () => [...new Set(featuredSkills.map((skill) => skill.type).filter(Boolean))],
    [featuredSkills]
  );

  const maxSkills = isMobile ? 8 : 24;

  const displayedSkills = useMemo(() => {
    const list =
      selectedCategory === "All"
        ? featuredSkills
        : featuredSkills.filter((skill) => skill.type === selectedCategory);

    return list.slice(0, maxSkills);
  }, [featuredSkills, selectedCategory, maxSkills]);

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
              onSelect={(category) => {
                setSelectedCategory(category);
                posthog?.capture('skill_category_filtered', { category });
              }}
            />
          </div>
        </header>

        <div className="skills__panel" role="region" aria-label="Skills browser">
          <div className="skills__matrix-head">
            <span className="skills__col-head skills__col-head--name">MODULE</span>
            <span className="skills__col-head skills__col-head--level">LEVEL</span>
            <span className="skills__col-head skills__col-head--bar">PROFICIENCY</span>
            <span className="skills__col-head skills__col-head--score">VAL</span>
          </div>

          {loading ? (
            <div className="skills__skeleton" aria-label="Loading skills">
              {Array.from({ length: isMobile ? 6 : 12 }).map((_, i) => (
                <div className="skills__skeleton-row" key={i} />
              ))}
            </div>
          ) : displayedSkills.length === 0 ? (
            <div className="skills__empty">
              <h3>No skills found</h3>
              <p>Try a different channel.</p>
            </div>
          ) : (
            <ul className="skills__matrix" aria-label="Skill modules">
              {displayedSkills.map((skill, i) => {
                const score = Number(skill?.score) || 0;
                const level = (skill?.level ?? "unknown").toLowerCase();
                return (
                  <li
                    className="skills__row"
                    key={`${skill?.name ?? "skill"}-${i}`}
                    style={{ "--skill-delay": `${i * 30}ms` }}
                  >
                    <div className="skills__cell skills__cell--name">
                      <span className="skills__idx">{String(i + 1).padStart(2, "0")}</span>
                      {skill?.icon ? (
                        <img
                          className="skills__icon"
                          src={skill.icon}
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        <span className="skills__icon skills__icon--fallback" aria-hidden="true" />
                      )}
                      <span className="skills__name">{skill?.name ?? "Untitled"}</span>
                    </div>

                    <div className="skills__cell skills__cell--level">
                      <span className={`skills__level skills__level--${level}`}>
                        {skill?.level ?? "—"}
                      </span>
                    </div>

                    <div className="skills__cell skills__cell--bar">
                      <div
                        className="skills__bar"
                        role="progressbar"
                        aria-label={`${skill?.name ?? "Skill"} proficiency`}
                        aria-valuenow={score}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div className="skills__bar-fill" style={{ width: `${score}%` }} />
                      </div>
                    </div>

                    <div className="skills__cell skills__cell--score">
                      <span className="skills__score">{score}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
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
