import React from 'react';
import { fetchAffiliations, fetchHomePage } from '../../../api/site';
import useCmsData from '../../../hooks/useCmsData';

// Typographic, not a wall of logos: names only, grouped by how I know them.
// The CMS sorts the affiliations, so the groups appear in the order they first do.
const loadTrust = () => Promise.all([fetchHomePage(), fetchAffiliations()]).then(([home, rows]) => ({ home, rows }));

export default function TrustStrip() {
  const { status, data } = useCmsData(loadTrust);
  if (status !== 'ready' || !data) return null;

  const labels = data.home.trustGroupLabels || {};
  const groups = [];
  data.rows.forEach((row) => {
    let group = groups.find((g) => g.key === row.group);
    if (!group) {
      group = { key: row.group, label: labels[row.group] || row.group, names: [] };
      groups.push(group);
    }
    group.names.push(row.name);
  });
  if (!groups.length) return null;

  return (
    <section className="hm-trust bp-theme" aria-labelledby="trust-heading">
      <div className="bench-col">
        <h2 id="trust-heading" className="hm-trust__title">{data.home.trustHeading}</h2>
        <dl className="hm-trust__grid">
          {groups.map((g) => (
            <div key={g.key} className="hm-trust__group">
              <dt>{g.label}</dt>
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
