import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePostHog } from '@posthog/react';
import { fetchBlogs } from '../../api/blog';
import { cloudinarySrc, cloudinarySrcSet, CARD_SIZES } from '../../utils/cloudinaryImage';
import './css/LatestWriting.css';

// Copied (not imported) from the dead GridFeaturedBlog.js — that file's CSS
// is barrel-excluded on purpose, so the mapping is duplicated here rather
// than pulling in unscoped rules.
const TAG_STYLES = {
  tutorial: 'latest-writing__tag--tutorial',
  guide: 'latest-writing__tag--tutorial',
  'system design': 'latest-writing__tag--system',
  architecture: 'latest-writing__tag--system',
  opinion: 'latest-writing__tag--opinion',
  rant: 'latest-writing__tag--opinion',
  research: 'latest-writing__tag--research',
  ai: 'latest-writing__tag--research',
  default: 'latest-writing__tag--default',
};

const getTagStyle = (category) => TAG_STYLES[(category || '').toLowerCase()] || TAG_STYLES.default;

// No date library exists in this codebase — hand-rolled, matching the
// six other formatters already scattered across the app.
const formatRelativeDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getPostImage = (post) => {
  const formats = post?.attributes?.Featured?.data?.attributes?.formats;
  return (
    formats?.medium?.url ||
    formats?.small?.url ||
    formats?.large?.url ||
    formats?.thumbnail?.url ||
    post?.attributes?.Featured?.data?.attributes?.url ||
    null
  );
};

function WritingCard({ post, posthog, index }) {
  const { Title, Teaser, Categories, publishedAt, slug } = post.attributes;
  const category = Categories && Categories.length > 0 ? Categories[0] : null;
  const image = getPostImage(post);

  return (
    <Link
      to={`/blog/${slug}`}
      className="latest-writing__card"
      onClick={() => posthog?.capture('home_latest_writing_clicked', { title: Title, slug, index })}
    >
      <div className="latest-writing__card-image">
        {image ? (
          <img
            className="latest-writing__card-image-el"
            src={cloudinarySrc(image, { width: 700 })}
            srcSet={cloudinarySrcSet(image, [350, 700, 1050])}
            sizes={CARD_SIZES}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="latest-writing__card-image-fallback" aria-hidden="true">
            <span>{Title}</span>
          </div>
        )}
      </div>

      <div className="latest-writing__card-body">
        <div className="latest-writing__card-meta">
          {category && (
            <span className={`latest-writing__tag ${getTagStyle(category)}`}>{category}</span>
          )}
          {publishedAt && <span className="latest-writing__date">{formatRelativeDate(publishedAt)}</span>}
        </div>
        <h3 className="latest-writing__card-title">{Title}</h3>
        {Teaser && <p className="latest-writing__card-teaser">{Teaser}</p>}
        <span className="latest-writing__card-link" aria-hidden="true">
          Read the write-up
          <span className="latest-writing__card-link-arrow">→</span>
        </span>
      </div>
    </Link>
  );
}

export default function LatestWriting() {
  const posthog = usePostHog();
  const [posts, setPosts] = useState(null); // null = loading, [] = resolved empty

  useEffect(() => {
    let cancelled = false;
    fetchBlogs(1, 3, 'publishedAt', 'desc').then((data) => {
      if (!cancelled) setPosts(Array.isArray(data) ? data : []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (posts !== null && posts.length === 0) return null;

  return (
    <section id="writing" className="latest-writing section-blend-from-dark" aria-labelledby="latest-writing-heading">
      <div className="home-grid latest-writing__head">
        <span className="channel-mark channel-mark--dark">
          <span className="channel-mark__id">CH:03</span>
          <span className="channel-mark__sep" />
          <span className="channel-mark__title">DISPATCHES</span>
        </span>
        <h2 className="latest-writing__heading" id="latest-writing-heading">
          Notes from the bench.
        </h2>
        <p className="latest-writing__subtitle">
          Write-ups, half-finished ideas, and the occasional rant.
        </p>
      </div>

      <div className="home-grid latest-writing__grid">
        {posts === null &&
          Array.from({ length: 3 }).map((_, i) => (
            <div className="latest-writing__card latest-writing__card--skeleton" key={i} />
          ))}

        {posts !== null &&
          posts.map((post, index) => (
            <WritingCard post={post} posthog={posthog} index={index} key={post.id} />
          ))}
      </div>

      {posts !== null && posts.length > 0 && (
        <div className="home-grid latest-writing__foot">
          <Link
            className="latest-writing__cta"
            to="/blog"
            onClick={() => posthog?.capture('home_latest_writing_view_all_clicked')}
          >
            VIEW ALL POSTS
            <span className="latest-writing__cta-arrow">→</span>
          </Link>
        </div>
      )}
    </section>
  );
}
