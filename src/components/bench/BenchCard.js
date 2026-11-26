import React from 'react';
import { Link } from 'react-router-dom';
import { cloudinarySrc } from '../../utils/cloudinaryImage';

// Internal paths use the router, so moving between pages does not reload the
// site; anything else is a plain link.
function Anchor({ href, children, ...props }) {
  return href.startsWith('/')
    ? <Link to={href} {...props}>{children}</Link>
    : <a href={href} {...props}>{children}</a>;
}

// <ul> of cards; each BenchCard renders its own <li>. With `bento`, the cards
// are tiles of different sizes on one grid (see BenchCard's `size`).
export function BenchCards({ children, bento = false }) {
  return <ul className={`bp-cards${bento ? ' bp-cards--bento' : ''}`}>{children}</ul>;
}

// One entry: image, a mono meta line, a title link, a clamped teaser. The image
// link is hidden from assistive tech and the tab order because the title
// already links to the same place. Without an image it shows a plain tile.
// `actions` are extra outbound links under the teaser: [{ label, href, onClick }].
//
// `size` turns the card into a bento tile: 'lead' (2x2), 'wide' (2x1) or 'std'
// (1x1). A tile is one big click target (the title link stretches over it); the
// actions sit above that. A tile with no image is a graphite face carrying its
// text, not an empty box. Leave `size` out for the plain card.
export default function BenchCard({ href, title, text, meta, image, onClick, actions = [], size }) {
  const tile = Boolean(size);
  const face = tile && !image;
  const className = [
    'bp-card',
    tile && `bp-card--${size}`,
    face && 'bp-card--face bp-theme',
  ].filter(Boolean).join(' ');
  // Big tiles show the cover larger, so they ask for more pixels.
  const width = size === 'lead' || size === 'wide' ? 1280 : 640;

  return (
    <li className={className}>
      {!face && (
        <Anchor href={href} onClick={onClick} className="bp-card__media" tabIndex={-1} aria-hidden="true">
          {image
            ? <img src={cloudinarySrc(image, { width })} alt="" width="640" height="480" loading="lazy" decoding="async" />
            : <span className="bp-card__blank" />}
        </Anchor>
      )}
      <div className="bp-card__body">
        {meta && <p className="bp-card__meta">{meta}</p>}
        <h3 className="bp-card__title"><Anchor href={href} onClick={onClick}>{title}</Anchor></h3>
        {text && <p className="bp-card__text">{text}</p>}
        {actions.length > 0 && (
          <p className="bp-card__actions">
            {actions.map((a) => (
              <a key={a.href} className="bp-link" href={a.href} target="_blank" rel="noopener noreferrer" onClick={a.onClick}>
                {a.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </p>
        )}
      </div>
    </li>
  );
}

// The shape of a tile while the list loads: the same sizes, plain blocks.
export function BenchCardSkeleton({ size = 'std' }) {
  return (
    <li className={`bp-card bp-card--${size}`}>
      <span className="bp-card__media"><span className="bp-card__blank" /></span>
      <div className="bp-card__body">
        <span className="list-skeleton list-skeleton--meta" />
        <span className="list-skeleton list-skeleton--title" />
        <span className="list-skeleton list-skeleton--text" />
      </div>
    </li>
  );
}
