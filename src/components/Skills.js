import React, { useEffect, useMemo, useState } from "react";
import SkillFilterChips from "./SkillFilterChips";
import { fetchFeaturedSkills } from "../api/skills";
import "./css/Skills.css";

const Skills = () => {
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

  const maxSkills = isMobile ? 6 : 18;

  const displayedSkills = useMemo(() => {
    const list =
      selectedCategory === "All"
        ? featuredSkills
        : featuredSkills.filter((skill) => skill.type === selectedCategory);

    return list.slice(0, maxSkills);
  }, [featuredSkills, selectedCategory, maxSkills]);

  return (
    <section
      className={`skills ${isVisible ? "skills--visible" : ""} ${
        prefersReducedMotion ? "skills--reduced-motion" : ""
      }`}
      aria-label="Featured skills"
    >
      <div className="skills__bg" aria-hidden="true">
        <div className="skills__orb skills__orb--1" />
        <div className="skills__orb skills__orb--2" />
        <div className="skills__grid" />
      </div>

      <div className="skills__container">
        <header className="skills__header">
          <span className="skills__label">Skills</span>
          <h2 className="skills__title">Featured Skills</h2>
          <p className="skills__subtitle">
            A curated snapshot of the tools and domains I use to ship real systems—edge to cloud.
          </p>
        </header>

        <div className="skills__panel" role="region" aria-label="Skills browser">
          <div className="skills__filters" aria-label="Skill filters">
            <SkillFilterChips
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>

          <div className="skills__grid-wrap">
            {loading ? (
              <div className="skills__skeleton" aria-label="Loading skills">
                {Array.from({ length: isMobile ? 6 : 12 }).map((_, i) => (
                  <div className="skills__skeleton-card" key={i} />
                ))}
              </div>
            ) : displayedSkills.length === 0 ? (
              <div className="skills__empty">
                <h3>No skills found</h3>
                <p>Try a different category.</p>
              </div>
            ) : (
              <div className="skills-grid" aria-label="Skill cards">
                {displayedSkills.map((skill, i) => (
                  <article className="skill-card" key={`${skill?.name ?? "skill"}-${i}`}>
                    <div className="skill-card__top">
                      {skill?.icon ? (
                        <img
                          src={skill.icon}
                          alt={skill?.name ? `${skill.name} icon` : "Skill icon"}
                          loading="lazy"
                        />
                      ) : (
                        <div className="skill-card__icon-fallback" aria-hidden="true" />
                      )}
                      <span className="skill-card__name">{skill?.name ?? "Untitled"}</span>
                    </div>

                    <div className="skill-meta">
                      <small className={`level ${(skill?.level ?? "unknown").toLowerCase()}`}>
                        {skill?.level ?? "—"}
                      </small>

                      <div
                        className="skill-bar"
                        role="progressbar"
                        aria-label={`${skill?.name ?? "Skill"} proficiency`}
                        aria-valuenow={Number(skill?.score) || 0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div className="skill-bar-fill" style={{ width: `${Number(skill?.score) || 0}%` }} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        <footer className="skills__footer">
          <a className="skills__cta" href="/curriculum-vitae" aria-label="View my full CV">
            View full CV
            <span className="skills__cta-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </footer>
      </div>
    </section>
  );
};

export default Skills;