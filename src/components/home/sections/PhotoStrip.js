import React from 'react';
import { PHOTOS, PLACES } from '../../../data/home';

// Small drawn flags (not emoji: those render as letters on some systems).
function Flag({ code }) {
  if (code === 'br') {
    return (
      <svg className="hm-flag" viewBox="0 0 20 14" aria-hidden="true">
        <rect width="20" height="14" rx="2" fill="#009C3B" />
        <path d="M10 1.8 18 7l-8 5.2L2 7z" fill="#FFDF00" />
        <circle cx="10" cy="7" r="3.1" fill="#002776" />
      </svg>
    );
  }
  return (
    <svg className="hm-flag" viewBox="0 0 20 14" aria-hidden="true">
      <clipPath id="hm-us-clip"><rect width="20" height="14" rx="2" /></clipPath>
      <g clipPath="url(#hm-us-clip)">
        <rect width="20" height="14" fill="#fff" />
        {[0, 4, 8, 12].map((y) => <rect key={y} y={y} width="20" height="2" fill="#B22234" />)}
        <rect width="9" height="7.5" fill="#3C3B6E" />
      </g>
    </svg>
  );
}

export default function PhotoStrip() {
  return (
    <section className="hm-strip bp-theme bench-col" aria-label="Photos of Wanghley">
      <ul className="hm-strip__row">
        {PHOTOS.map((p) => (
          <li key={p.src}>
            <img src={p.src} alt={p.alt} width="240" height="320" loading="lazy" decoding="async" />
          </li>
        ))}
      </ul>
      <ol className="hm-strip__places" aria-label="Places I have lived">
        {PLACES.map((pl) => (
          <li key={pl.city}>
            <Flag code={pl.flag} />
            <span>{pl.city}, {pl.country}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
