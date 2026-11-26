import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../bench';

// The dark title band of a project or post: breadcrumbs, title, lede and
// actions, with the cover beside them on a wide screen. `cover` is
// { url, width, height } from pickImage. The frame follows the picture's own
// shape (kept between 4:5 and 2:1) and never grows past the file's own width,
// so a small cover is not blown up.
const ratioOf = ({ width, height }) => {
  if (!width || !height) return 4 / 3;
  return Math.min(2, Math.max(0.8, width / height));
};

export default function ArticleHero({ section, sectionPath, refdes, title, lede, meta, cover, children }) {
  return (
    <section className="bp-sec bp-sec--head article-hero">
      <div className="bench-col">
        <nav className="article-crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to={sectionPath}>{section}</Link>
        </nav>
        <PageHeader
          size="md"
          refdes={refdes}
          title={title}
          lede={lede}
          meta={meta}
          aside={cover && (
            <figure className="article-hero__cover" style={{ aspectRatio: ratioOf(cover), '--cover-w': cover.width ? `${cover.width}px` : undefined }}>
              <img src={cover.url} alt={title} width={cover.width} height={cover.height} />
            </figure>
          )}
        >
          {children}
        </PageHeader>
      </div>
    </section>
  );
}
