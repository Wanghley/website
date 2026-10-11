import React from 'react';
import { PHOTOS, PHOTO_CAPTION } from '../../../data/home';

export default function PhotoStrip() {
  return (
    <section className="hm-strip bench-col" aria-label="Photos of Wanghley">
      <ul className="hm-strip__row">
        {PHOTOS.map((p) => (
          <li key={p.src}>
            <img src={p.src} alt={p.alt} width="240" height="320" loading="lazy" decoding="async" />
          </li>
        ))}
      </ul>
      <p className="hm-strip__caption">{PHOTO_CAPTION}</p>
    </section>
  );
}
