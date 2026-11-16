import React, { useMemo } from 'react';
import { fetchFeaturedSkills, fetchHomePage } from '../../../api/site';
import useCmsData from '../../../hooks/useCmsData';
import { SKILL_ORDER } from '../../../data/layout';

const loadSkills = () => Promise.all([fetchHomePage(), fetchFeaturedSkills()]).then(([home, rows]) => ({ home, rows }));

export default function Skills() {
  const { status, data } = useCmsData(loadSkills);

  const groups = useMemo(() => {
    const by = {};
    (data?.rows || []).forEach((s) => { (by[s.category || 'Other'] = by[s.category || 'Other'] || []).push(s.name); });
    const known = SKILL_ORDER.filter((t) => by[t]);
    const rest = Object.keys(by).filter((t) => !SKILL_ORDER.includes(t));
    return [...known, ...rest].map((t) => ({ type: t, names: by[t] }));
  }, [data]);

  if (status !== 'ready' || !data || !groups.length) return null;

  return (
    <section id="skills" className="bp-sec bp-sec--light" aria-labelledby="skills-heading">
      <div className="bench-col">
        <h2 id="skills-heading" className="bp-sec__title">{data.home.skillsHeading}</h2>
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
