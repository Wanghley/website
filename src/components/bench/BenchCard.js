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

// <ul> of cards; each BenchCard renders its own <li>.
export function BenchCards({ children }) {
  return <ul className="bp-cards">{children}</ul>;
}

// One entry: image, a mono meta line, a title link, a clamped teaser. The image
// link is hidden from assistive tech and the tab order because the title
// already links to the same place. Without an image it shows a plain tile.
// `actions` are extra outbound links under the teaser: [{ label, href, onClick }].
export default function BenchCard({ href, title, text, meta, image, onClick, actions = [] }) {
  return (
    <li className="bp-card">
      <Anchor href={href} onClick={onClick} className="bp-card__media" tabIndex={-1} aria-hidden="true">
        {image
          ? <img src={cloudinarySrc(image, { width: 640 })} alt="" width="640" height="480" loading="lazy" decoding="async" />
          : <span className="bp-card__blank" />}
      </Anchor>
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
    </li>
  );
}
