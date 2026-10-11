import React, { useEffect, useMemo, useState } from 'react';
import { fetchFeaturedSkills } from '../../../api/skills';
import { SKILLS } from '../../../data/home';

export default function Skills() {
  const [skills, setSkills] = useState(SKILLS.fallback);

  useEffect(() => {
    let alive = true;
    fetchFeaturedSkills()
      .then((rows) => { if (alive && Array.isArray(rows) && rows.length) setSkills(rows.map((r) => ({ name: r.name, type: r.type || 'Other' }))); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const groups = useMemo(() => {
    const by = {};
    skills.forEach((s) => { (by[s.type] = by[s.type] || []).push(s.name); });
    const known = SKILLS.order.filter((t) => by[t]);
    const rest = Object.keys(by).filter((t) => !SKILLS.order.includes(t));
    return [...known, ...rest].map((t) => ({ type: t, names: by[t] }));
  }, [skills]);

  return (
    <section id="skills" className="hm-sec" aria-labelledby="skills-heading">
      <div className="bench-col">
        <h2 id="skills-heading" className="hm-sec__title">{SKILLS.heading}</h2>
        <dl className="hm-skills">
          {groups.map((g) => (
            <div key={g.type} className="hm-skills__group">
              <dt>{g.type}</dt>
              <dd>
                <ul>
                  {g.names.map((n) => <li key={n}>{n}</li>)}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
