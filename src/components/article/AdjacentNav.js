import React from 'react';
import { Link } from 'react-router-dom';

// The end of an article: the entry just newer and the one just older, as two
// tiles. Each of `newer` and `older` is { href, title, meta, image } or null.
// `onNavigate` gets 'newer' or 'older' (for analytics).
function Tile({ direction, label, entry, onNavigate }) {
  return (
    <Link
      to={entry.href}
      className={`article-adjacent__item article-adjacent__item--${direction}`}
      onClick={() => onNavigate?.(direction)}
    >
      {entry.image && <img src={entry.image} alt="" width="96" height="72" loading="lazy" decoding="async" />}
      <span className="article-adjacent__text">
        <span className="article-adjacent__dir">{label}</span>
        <span className="article-adjacent__title">{entry.title}</span>
        {entry.meta && <span className="article-adjacent__meta">{entry.meta}</span>}
      </span>
    </Link>
  );
}

export default function AdjacentNav({ newer, older, label, onNavigate }) {
  if (!newer && !older) return null;
  return (
    <nav className="article-adjacent" aria-label={label}>
      {newer && <Tile direction="newer" label="← Newer" entry={newer} onNavigate={onNavigate} />}
      {older && <Tile direction="older" label="Older →" entry={older} onNavigate={onNavigate} />}
    </nav>
  );
}
