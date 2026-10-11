import React, { useEffect, useState } from 'react';
import { fetchAllPublications } from '../../../api/publication';
import { RESEARCH } from '../../../data/home';

const year = (d) => (d ? String(d).slice(0, 4) : '');

export default function Research() {
  const [pubs, setPubs] = useState([]);

  useEffect(() => {
    let alive = true;
    fetchAllPublications(20)
      .then((rows) => { if (alive) setPubs(rows.filter((r) => r?.attributes?.Title).slice(0, 6)); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <section id="research" className="sec" aria-labelledby="research-heading">
      <div className="bench-col">
        <p className="sec__kicker">{RESEARCH.kicker}</p>
        <h2 id="research-heading" className="sec__title">{RESEARCH.heading}</h2>
        {pubs.length > 0 && (
          <ul className="pubs">
            {pubs.map((p) => {
              const a = p.attributes;
              return (
                <li key={p.id} className="pubs__item">
                  <span className="pubs__year">{year(a.publication)}</span>
                  <span className="pubs__main">
                    {a.DOI ? (
                      <a href={a.DOI.startsWith('http') ? a.DOI : `https://doi.org/${a.DOI}`} target="_blank" rel="noopener noreferrer">{a.Title}</a>
                    ) : a.Title}
                    {a.publisher && <span className="pubs__venue">{a.publisher}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="sec__more">
          <a className="chain__link" href={RESEARCH.scholar.href} target="_blank" rel="noopener noreferrer">
            {RESEARCH.scholar.text} <span aria-hidden="true">↗</span>
          </a>
        </p>
      </div>
    </section>
  );
}
