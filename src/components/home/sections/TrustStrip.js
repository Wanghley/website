import React from 'react';
import { TRUST } from '../../../data/home';

// Typographic, not a wall of logos: names only, grouped by how I know them.
export default function TrustStrip() {
  return (
    <section className="hm-trust bp-theme" aria-labelledby="trust-heading">
      <div className="bench-col">
        <h2 id="trust-heading" className="hm-trust__title">{TRUST.heading}</h2>
        <dl className="hm-trust__grid">
          {TRUST.groups.map((g) => (
            <div key={g.label} className="hm-trust__group">
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
