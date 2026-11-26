import React from 'react';

// Loading: the same two bands with plain blocks where the text will be.
export default function ArticleSkeleton({ label }) {
  return (
    <main id="main" className="article-page" aria-busy="true">
      <section className="bp-sec bp-sec--head">
        <div className="bench-col">
          <div className="bp-rule" aria-hidden="true" />
          <div className="article-skeleton article-skeleton--title" />
          <div className="article-skeleton article-skeleton--lede" />
        </div>
      </section>
      <section className="bp-sec bp-sec--light">
        <div className="bench-col">
          <div className="article-skeleton article-skeleton--line" />
          <div className="article-skeleton article-skeleton--line article-skeleton--short" />
          <div className="article-skeleton article-skeleton--line" />
        </div>
      </section>
      <p className="sr-only" role="status">{label}</p>
    </main>
  );
}
