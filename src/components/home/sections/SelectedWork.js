import React, { useEffect, useState } from 'react';
import { fetchProjects } from '../../../api/projects';
import { cloudinarySrc } from '../../../utils/cloudinaryImage';
import useInView from '../../../hooks/useInView';
import { WORK } from '../../../data/home';

const imageOf = (p) => {
  const f = p?.attributes?.Featured?.data?.attributes;
  return f?.formats?.medium?.url || f?.formats?.large?.url || f?.formats?.small?.url || f?.url || null;
};

function Card({ item, index }) {
  const [ref, seen] = useInView();
  return (
    <article ref={ref} className={`work-card${seen ? ' is-in' : ''}`} style={{ '--i': index }}>
      <a className="work-card__media" href={item.href} aria-label={`${item.title}: read the case study`}>
        {item.image ? (
          <img
            src={cloudinarySrc(item.image, { width: 800 })}
            alt=""
            width="800"
            height="600"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="work-card__ph" aria-hidden="true" />
        )}
        <svg className="work-card__trace" viewBox="0 0 120 24" aria-hidden="true">
          <path d="M2 18 H30 L38 6 H62 L70 18 H118" pathLength="1" />
        </svg>
      </a>
      <div className="work-card__body">
        <h3 className="work-card__title">{item.title}</h3>
        <p className="work-card__problem">{item.teaser}</p>
        {item.facts && (
          <dl className="work-card__facts">
            <div><dt>Constraint</dt><dd>{item.facts.constraint}</dd></div>
            <div><dt>Result</dt><dd>{item.facts.result}</dd></div>
            <div><dt>My role</dt><dd>{item.facts.role}</dd></div>
          </dl>
        )}
        <a className="chain__link" href={item.href}>Read the case study <span aria-hidden="true">→</span></a>
      </div>
    </article>
  );
}

export default function SelectedWork() {
  const [items, setItems] = useState(WORK.fallback);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetchProjects(1, 30);
        const all = (Array.isArray(res.data) ? res.data : []).filter((p) => p?.attributes?.Title);
        // featured projects first (in the order chosen in WORK.pick), then the rest
        const picked = WORK.pick
          .map((rule) => all.find((p) => rule.match.test(p.attributes.Title)))
          .filter(Boolean);
        const ordered = [...picked, ...all.filter((p) => !picked.includes(p))].slice(0, 4);
        const rows = ordered.map((p) => {
          const rule = WORK.pick.find((r) => r.match.test(p.attributes.Title));
          const f = rule && rule.constraint && rule.result && rule.role ? rule : null;
          return {
            facts: f,
            title: p.attributes.Title,
            teaser: p.attributes.Teaser || p.attributes.Description || '',
            image: imageOf(p),
            href: p.attributes.slug ? `/projects/${p.attributes.slug}` : '/projects',
          };
        });
        if (alive && rows.length) setItems(rows);
      } catch {
        /* keep the fallback */
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <section id="work" tabIndex={-1} className="sec" aria-labelledby="work-heading">
      <div className="bench-col">
        <h2 id="work-heading" className="sec__title">{WORK.heading}</h2>
        <div className="work-grid">
          {items.map((it, i) => <Card key={it.href + it.title} item={it} index={i} />)}
        </div>
        <p className="sec__more"><a className="chain__link" href="/projects">All projects <span aria-hidden="true">→</span></a></p>
      </div>
    </section>
  );
}
