import React from 'react';
import { ABOUT } from '../../../data/home';

export default function AboutMe() {
  return (
    <section id="about" className="hm-sec hm-sec--light" aria-labelledby="about-heading">
      <div className="bench-col hm-about">
        <h2 id="about-heading" className="hm-sec__title">{ABOUT.heading}</h2>
        <div className="hm-about__body">
          <p className="hm-about__lede">{ABOUT.lede}</p>
          <ul className="hm-about__values">
            {ABOUT.values.map((v) => (
              <li key={v.name}><strong>{v.name}</strong><span>{v.text}</span></li>
            ))}
          </ul>
          <p className="hm-about__links">
            {ABOUT.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={l.primary ? 'btn btn--primary' : 'link'}
                {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {l.text} <span aria-hidden="true">{l.external ? '↗' : '→'}</span>
              </a>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
