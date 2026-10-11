import React from 'react';
import { GAMBIARRA } from '../../../data/home';

export default function Gambiarra() {
  return (
    <section id="gambiarra" className="sec sec--gambiarra" aria-labelledby="gambiarra-heading">
      <div className="bench-col gambiarra">
        <div className="gambiarra__text">
          <p className="sec__kicker">{GAMBIARRA.kicker}</p>
          <h2 id="gambiarra-heading" className="sec__title">{GAMBIARRA.heading}</h2>
          {GAMBIARRA.paragraphs.map((t) => <p key={t} className="gambiarra__p">{t}</p>)}
          <p>
            <a className="btn btn--primary" href={GAMBIARRA.talk.href} target="_blank" rel="noopener noreferrer">
              {GAMBIARRA.talk.text} <span aria-hidden="true">↗</span>
            </a>
          </p>
        </div>
        <div className="gambiarra__art">
          <div className="gambiarra__photo" role="img" aria-label="Photo of an early prototype, to be added">
            <span>{GAMBIARRA.photoNote}</span>
          </div>
          <img
            className="gambiarra__figure"
            src="/hero/figure-thumbs.webp"
            width="800"
            height="800"
            alt="A figure of Wanghley giving a thumbs up"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
