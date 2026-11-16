import React from 'react';
import { SpecTable } from '../../bench';
import { fetchHomePage } from '../../../api/site';
import useCmsData from '../../../hooks/useCmsData';

export default function AboutMe() {
  const { status, data: home } = useCmsData(fetchHomePage);
  if (status !== 'ready' || !home) return null;

  const values = home.aboutValues || [];
  const links = home.aboutLinks || [];

  return (
    <section id="about" className="bp-sec bp-sec--light" aria-labelledby="about-heading">
      <div className="bench-col hm-about">
        <h2 id="about-heading" className="bp-sec__title">{home.aboutHeading}</h2>
        <div className="hm-about__body">
          <p className="hm-about__lede">{home.aboutLead}</p>
          <SpecTable rows={values.map((v) => ({ label: v.name, value: v.text }))} />
          <p className="hm-about__links">
            {links.map((l) => (
              <a
                key={`${l.url}-${l.label}`}
                href={l.url}
                className={l.primary ? 'btn btn--primary' : 'bp-link'}
                {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {l.label} <span aria-hidden="true">{l.external ? '↗' : '→'}</span>
              </a>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
