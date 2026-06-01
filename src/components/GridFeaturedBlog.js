import React, { useState, useEffect } from "react";
import { usePostHog } from "@posthog/react";
import { fetchBlogs } from "../api/blog";
import { cloudinarySrc, cloudinarySrcSet, CARD_SIZES } from "../utils/cloudinaryImage";
import "./css/FeaturedBlogGrid.css";

const getReadTime = (content) => {
  if (!content) return "3 MIN READ";
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} MIN READ`;
};

const formatDateline = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
};

const getTagStyle = (category) => {
  const styles = {
    tutorial:        "editorial__tag--tutorial",
    guide:           "editorial__tag--tutorial",
    "system design": "editorial__tag--system",
    architecture:    "editorial__tag--system",
    opinion:         "editorial__tag--opinion",
    rant:            "editorial__tag--opinion",
    research:        "editorial__tag--research",
    ai:              "editorial__tag--research",
    default:         "editorial__tag--default",
  };
  const key = (category || "").toLowerCase();
  return styles[key] || styles.default;
};

const GridFeaturedBlog = () => {
  const posthog = usePostHog();
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    let alive = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchBlogs();
        if (!alive) return;
        setBlogPosts(data?.slice(0, 5) || []);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
        if (!alive) return;
        setBlogPosts([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchData();
    return () => {
      alive = false;
    };
  }, []);

  const getPostImage = (post) => {
    const formats = post?.attributes?.Featured?.data?.attributes?.formats;
    return (
      formats?.large?.url ||
      formats?.medium?.url ||
      formats?.small?.url ||
      post?.attributes?.Featured?.data?.attributes?.url ||
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80"
    );
  };

  return (
    <section
      id="ch-06"
      className={`editorial ${isVisible ? "editorial--visible" : ""}`}
      aria-label="Field Notes — Writing & Thoughts"
    >
      <div className="editorial__container">
        {/* Header */}
        <div className="editorial__header">
          <div className="editorial__head-left">
            <span className="editorial__label">
              <span className="editorial__label-id">CH:06</span>
              <span className="editorial__label-sep" />
              FIELD NOTES · LOGBOOK
            </span>
            <h2 className="editorial__title">
              The engineering<br />notebook.
            </h2>
            <p className="editorial__subtitle">
              Insights on Edge AI, hardware constraints, and the future of health tech.
            </p>
          </div>

          <a className="editorial__cta" href="/blog" onClick={() => posthog?.capture('home_blog_cta_clicked')}>
            <span>VIEW ALL NOTES</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Bento Grid */}
        <div className="editorial__content" role="region" aria-label="Blog posts">
          {loading ? (
            <div className="editorial__bento" aria-label="Loading posts">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  className={`editorial__skeleton ${i === 0 ? "editorial__skeleton--hero" : ""}`}
                  key={i}
                />
              ))}
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="editorial__empty">
              <h3>No notes yet</h3>
              <p>New entries coming soon.</p>
            </div>
          ) : (
            <div className="editorial__bento" role="list">
              {blogPosts.map((post, index) => {
                const title = post?.attributes?.Title || "Untitled";
                const slug = post?.attributes?.slug;
                const href = slug ? `/blog/${slug}` : "/blog";
                const excerpt = post?.attributes?.Teaser || post?.attributes?.Excerpt;
                const content = post?.attributes?.Content;
                const categories = post?.attributes?.Categories || [];
                const published = post?.attributes?.publishedAt || post?.attributes?.published;
                const image = getPostImage(post);
                const isHero = index === 0;
                const noteId = `LOG-${String(index + 1).padStart(3, "0")}`;

                return (
                  <a
                    key={post?.id ?? `${title}-${index}`}
                    href={href}
                    className={`editorial__card ${isHero ? "editorial__card--hero" : ""}`}
                    role="listitem"
                    aria-label={`Read article: ${title}`}
                    style={{ '--card-idx': index }}
                    onClick={() => posthog?.capture('home_featured_blog_clicked', {
                      title,
                      slug,
                      category: categories[0] || null,
                      index,
                      is_hero: isHero,
                    })}
                  >
                    {/* Telemetry header row */}
                    <div className="editorial__card-head">
                      <span className="editorial__card-id">{noteId}</span>
                      <span className="editorial__card-dateline">
                        {formatDateline(published)} · DURHAM, NC
                      </span>
                      {isHero && (
                        <span className="editorial__card-pinned">
                          <span className="editorial__card-pinned-dot" />
                          PINNED NOTE
                        </span>
                      )}
                    </div>

                    {/* Image */}
                    <div className="editorial__card-image">
                      <img
                        src={cloudinarySrc(image, { width: 800 })}
                        srcSet={cloudinarySrcSet(image, [400, 800, 1200])}
                        sizes={CARD_SIZES}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="editorial__card-overlay" />
                    </div>

                    {/* Content */}
                    <div className="editorial__card-content">
                      {categories.length > 0 && (
                        <div className="editorial__card-tags">
                          {categories.slice(0, 2).map((cat, i) => (
                            <span key={i} className={`editorial__tag ${getTagStyle(cat)}`}>
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}

                      <h3 className="editorial__card-title">{title}</h3>

                      {isHero && excerpt && (
                        <p className="editorial__card-excerpt">{excerpt}</p>
                      )}

                      <div className="editorial__card-meta">
                        <span className="editorial__card-readtime">{getReadTime(content)}</span>
                        <span className="editorial__card-arrow">→</span>
                      </div>
                    </div>
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

export default GridFeaturedBlog;
