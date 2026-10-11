import React, { useEffect, useState } from 'react';
import { fetchProjects } from '../../../api/projects';
import { cloudinarySrc } from '../../../utils/cloudinaryImage';
import { PROJECTS } from '../../../data/home';

const imageOf = (p) => {
  const f = p?.attributes?.Featured?.data?.attributes;
  return f?.formats?.medium?.url || f?.formats?.large?.url || f?.formats?.small?.url || f?.url || null;
};

export default function Projects() {
  const [items, setItems] = useState(PROJECTS.fallback);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetchProjects(1, 30);
        const all = (Array.isArray(res.data) ? res.data : []).filter((p) => p?.attributes?.Title);
        const picked = PROJECTS.pick.map((re) => all.find((p) => re.test(p.attributes.Title))).filter(Boolean);
        const ordered = [...picked, ...all.filter((p) => !picked.includes(p))].slice(0, PROJECTS.count);
        const rows = ordered.map((p) => ({
          title: p.attributes.Title,
          teaser: p.attributes.Teaser || p.attributes.Description || '',
          image: imageOf(p),
          href: p.attributes.slug ? `/projects/${p.attributes.slug}` : '/projects',
        }));
        if (alive && rows.length) setItems(rows);
      } catch {
        /* keep the fallback */
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <section id="work" tabIndex={-1} className="hm-sec" aria-labelledby="work-heading">
      <div className="bench-col">
        <h2 id="work-heading" className="hm-sec__title">{PROJECTS.heading}</h2>
        <ul className="hm-cards">
          {items.map((it) => (
            <li key={it.href + it.title} className="hm-card">
              <a className="hm-card__media" href={it.href} tabIndex={-1} aria-hidden="true">
                {it.image ? (
                  <img src={cloudinarySrc(it.image, { width: 640 })} alt="" width="640" height="480" loading="lazy" decoding="async" />
                ) : <span className="hm-card__blank" />}
              </a>
              <h3 className="hm-card__title"><a href={it.href}>{it.title}</a></h3>
              {it.teaser && <p className="hm-card__text">{it.teaser}</p>}
            </li>
          ))}
        </ul>
        <p className="hm-sec__more"><a className="hm-link" href="/projects">All projects <span aria-hidden="true">→</span></a></p>
      </div>
    </section>
  );
}
