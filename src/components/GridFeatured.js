import React, { useEffect, useMemo, useState } from "react";
import { fetchProjects } from "../api/projects";
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

// Fallback abstract images for projects without images
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

const GridFeatured = () => {
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
        const response = await fetchProjects(1, 10); // Fetch first page with 10 items
        if (!alive) return;

        // Fix: Access the data array from response.data
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
      className={`eng-showroom ${isVisible ? "eng-showroom--visible" : ""}`}
      aria-label="Selected Engineering Projects"
    >
      {/* Background effects */}
      <div className="eng-showroom__bg" aria-hidden="true">
        <div className="eng-showroom__grid-pattern" />
        <div className="eng-showroom__glow eng-showroom__glow--1" />
        <div className="eng-showroom__glow eng-showroom__glow--2" />
      </div>

      <div className="eng-showroom__container">
        {/* Left Column - Header & CTA */}
        <div className="eng-showroom__header">
          <span className="eng-showroom__label">Portfolio</span>
          <h2 className="eng-showroom__title">Selected Engineering</h2>
          <p className="eng-showroom__subtitle">
            End-to-end systems built with precision. From custom silicon to cloud infrastructure.
          </p>

          <a className="eng-showroom__cta" href="/projects">
            <span>View All Projects</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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

                return (
                  <a
                    key={project?.id ?? `${title}-${index}`}
                    href={getProjectHref(project)}
                    className={`eng-showroom__card ${isHero ? "eng-showroom__card--hero" : ""}`}
                    role="listitem"
                    aria-label={`Open project: ${title}`}
                  >
                    {/* Image */}
                    <div className="eng-showroom__card-image">
                      <img src={image} alt="" loading="lazy" />
                      <div className="eng-showroom__card-overlay" />
                    </div>

                    {/* Content */}
                    <div className="eng-showroom__card-content">
                      {/* Category Badge */}
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
                        Explore
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>

                    {/* Glow effect on hover */}
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
