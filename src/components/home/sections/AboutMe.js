import React from 'react';
import { ABOUT } from '../../../data/home';
import { SpecTable } from '../../bench';

export default function AboutMe() {
  return (
    <section id="about" className="bp-sec bp-sec--light" aria-labelledby="about-heading">
      <div className="bench-col hm-about">
        <h2 id="about-heading" className="bp-sec__title">{ABOUT.heading}</h2>
        <div className="hm-about__body">
          <p className="hm-about__lede">{ABOUT.lede}</p>
          <SpecTable rows={ABOUT.values.map((v) => ({ label: v.name, value: v.text }))} />
          <p className="hm-about__links">
            {ABOUT.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={l.primary ? 'btn btn--primary' : 'bp-link'}
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
