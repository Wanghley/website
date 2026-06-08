import React, { useEffect, useMemo, useState } from "react";
import { usePostHog } from "@posthog/react";
import { fetchProjects } from "../api/projects";
import { cloudinarySrc, cloudinarySrcSet, CARD_SIZES } from "../utils/cloudinaryImage";
import "./css/GridFeaturedProjects.css";

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

const getFallbackImage = (index) => {
  const fallbacks = [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
  ];
  return fallbacks[index % fallbacks.length];
};

const getProjectHref = (project) => {
  const slug = project?.attributes?.slug;
  return slug ? `/projects/${slug}` : "/projects";
};

/* Deterministic build ID per project — uses slug or index */
const getBuildId = (project, index) => {
  const base = (project?.attributes?.slug || `proj-${index}`)
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 4)
    .padEnd(4, "X");
  const year = 2024 + (index % 2);
  const seq = String(index + 1).padStart(3, "0");
  return `BLD-${year}-${seq} · ${base}`;
};

/* Derive a status from category (purely visual, no real meaning) */
const getStatus = (project, index) => {
  const cat = (project?.attributes?.Category || "").toLowerCase();
  if (cat.includes("research") || cat.includes("paper")) return { label: "RESEARCH", className: "deployed--research" };
  if (cat.includes("archive") || cat.includes("legacy")) return { label: "ARCHIVED", className: "deployed--archived" };
  if (index === 0) return { label: "LIVE", className: "deployed--live" };
  return { label: "DEPLOYED", className: "deployed--green" };
};

const GridFeatured = () => {
  const posthog = usePostHog();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        setLoading(true);
        const response = await fetchProjects(1, 10);
        if (!alive) return;
        const projectsData = response.data || [];
        setProjects(Array.isArray(projectsData) ? projectsData.slice(0, 5) : []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        if (!alive) return;
        setProjects([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(() => projects, [projects]);

  return (
    <section
      id="projects"
      className={`eng-showroom ${isVisible ? "eng-showroom--visible" : ""}`}
      aria-label="Field Reports — Selected Engineering Projects"
    >
      <div className="eng-showroom__bg" aria-hidden="true">
        <div className="eng-showroom__grid-pattern" />
        <div className="eng-showroom__glow eng-showroom__glow--1" />
        <div className="eng-showroom__glow eng-showroom__glow--2" />
      </div>

      <div className="eng-showroom__container">
        {/* Left Column - Header & CTA */}
        <div className="eng-showroom__header">
          <span className="eng-showroom__label">
            <span className="eng-showroom__label-id">CH:05</span>
            <span className="eng-showroom__label-sep" />
            FIELD REPORTS
          </span>
          <h2 className="eng-showroom__title">
            Builds in<br />production.
          </h2>
          <p className="eng-showroom__subtitle">
            End-to-end systems built with precision. From custom silicon to cloud infrastructure.
          </p>

          <div className="eng-showroom__meta">
            <span className="eng-showroom__meta-row">
              <span className="eng-showroom__meta-key">UNITS</span>
              <span className="eng-showroom__meta-val">{items.length || "—"}</span>
            </span>
            <span className="eng-showroom__meta-row">
              <span className="eng-showroom__meta-key">DOMAIN</span>
              <span className="eng-showroom__meta-val">SILICON → CLOUD</span>
            </span>
            <span className="eng-showroom__meta-row">
              <span className="eng-showroom__meta-key">REGION</span>
              <span className="eng-showroom__meta-val">GLOBAL</span>
            </span>
          </div>

          <a className="eng-showroom__cta" href="/projects" onClick={() => posthog?.capture('home_projects_cta_clicked')}>
            <span>VIEW ALL PROJECTS</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Right Column - Bento Grid */}
        <div className="eng-showroom__content" role="region" aria-label="Project cards">
          {loading ? (
            <div className="eng-showroom__bento" aria-label="Loading projects">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  className={`eng-showroom__skeleton ${i === 0 ? "eng-showroom__skeleton--hero" : ""}`}
                  key={i}
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="eng-showroom__empty">
              <h3>No projects found</h3>
              <p>Engineering projects coming soon.</p>
            </div>
          ) : (
            <div className="eng-showroom__bento" role="list">
              {items.map((project, index) => {
                const title = project?.attributes?.Title || "Untitled Project";
                const teaser = project?.attributes?.Teaser;
                const category = project?.attributes?.Category;
                const image = getProjectImage(project) || getFallbackImage(index);
                const isHero = index === 0;
                const buildId = getBuildId(project, index);
                const status = getStatus(project, index);

                return (
                  <a
                    key={project?.id ?? `${title}-${index}`}
                    href={getProjectHref(project)}
                    className={`eng-showroom__card ${isHero ? "eng-showroom__card--hero" : ""}`}
                    role="listitem"
                    aria-label={`Open project: ${title}`}
                    style={{ '--card-idx': index }}
                    onClick={() => posthog?.capture('featured_project_clicked', { title, category, index })}
                  >
                    {/* Telemetry strip on top */}
                    <div className="eng-showroom__card-telemetry">
                      <span className="eng-showroom__card-build">{buildId}</span>
                      <span className={`eng-showroom__card-status eng-showroom__card-status--${status.className}`}>
                        <span className="eng-showroom__card-status-dot" />
                        {status.label}
                      </span>
                    </div>

                    {/* Image */}
                    <div className="eng-showroom__card-image">
                      <img
                        src={cloudinarySrc(image, { width: 800 })}
                        srcSet={cloudinarySrcSet(image, [400, 800, 1200])}
                        sizes={CARD_SIZES}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="eng-showroom__card-overlay" />
                      {isHero && (
                        <div className="eng-showroom__card-signal" aria-hidden="true">
                          <svg viewBox="0 0 120 24" preserveAspectRatio="none">
                            <path
                              d="M0 12 L10 12 L14 6 L18 18 L22 12 L40 12 L44 4 L48 20 L52 12 L70 12 L74 8 L78 16 L82 12 L100 12 L104 6 L108 18 L112 12 L120 12"
                              fill="none"
                              stroke="#3AAFF1"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="eng-showroom__card-content">
                      {category && (
                        <div className="eng-showroom__card-tags">
                          <span className="eng-showroom__tag">{category}</span>
                        </div>
                      )}

                      <h3 className="eng-showroom__card-title">{title}</h3>

                      {isHero && teaser && (
                        <p className="eng-showroom__card-teaser">{teaser}</p>
                      )}

                      <span className="eng-showroom__card-link">
                        EXPLORE
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>

                    <div className="eng-showroom__card-glow" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GridFeatured;
