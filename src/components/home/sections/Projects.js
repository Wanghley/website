import React, { useEffect, useState } from 'react';
import { fetchProjects } from '../../../api/projects';
import { PROJECTS } from '../../../data/home';
import { BenchCard, BenchCards } from '../../bench';

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
    <section id="work" tabIndex={-1} className="bp-sec" aria-labelledby="work-heading">
      <div className="bench-col">
        <h2 id="work-heading" className="bp-sec__title">{PROJECTS.heading}</h2>
        <BenchCards>
          {items.map((it) => (
            <BenchCard key={it.href + it.title} href={it.href} title={it.title} text={it.teaser} image={it.image} />
          ))}
        </BenchCards>
        <p className="bp-sec__more"><a className="bp-link" href="/projects">All projects <span aria-hidden="true">→</span></a></p>
      </div>
    </section>
  );
}
