import React from 'react';
import { GAMBIARRA } from '../../../data/home';

export default function Gambiarra() {
  return (
    <section id="gambiarra" className="sec sec--gambiarra" aria-labelledby="gambiarra-heading">
      <div className="bench-col gambiarra">
        <div className="gambiarra__text">
          <h2 id="gambiarra-heading" className="sec__title">{GAMBIARRA.heading}</h2>
          {GAMBIARRA.paragraphs.map((t) => <p key={t} className="gambiarra__p">{t}</p>)}
          <p>
            <a className="btn btn--primary" href={GAMBIARRA.talk.href} target="_blank" rel="noopener noreferrer">
              {GAMBIARRA.talk.text} <span aria-hidden="true">↗</span>
            </a>
          </p>
        </div>
        <div className={`gambiarra__art${GAMBIARRA.photo ? ' has-photo' : ''}`}>
          {GAMBIARRA.photo && (
            <img className="gambiarra__photo" src={GAMBIARRA.photo} alt="An early prototype held together with whatever was on the bench" loading="lazy" decoding="async" />
          )}
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
