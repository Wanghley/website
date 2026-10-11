import React from 'react';
import useInView from '../../../hooks/useInView';
import { ECOSYSTEM, RECOGNITION } from '../../../data/home';

// Schematic, not a map: longitude and latitude plotted on a plain frame.
const W = 560;
const H = 420;
const LON = [-108, -40];
const LAT = [-24, 42];
const px = (lon) => ((lon - LON[0]) / (LON[1] - LON[0])) * (W - 120) + 60;
const py = (lat) => H - 50 - ((lat - LAT[0]) / (LAT[1] - LAT[0])) * (H - 100);

function RouteLine() {
  const [ref, seen] = useInView({ rootMargin: '0px 0px -20% 0px', threshold: 0.3 });
  const pts = ECOSYSTEM.route.map((c) => [px(c.lon), py(c.lat)]);
  // Brasília -> Durham -> Houston: two gentle arcs, one line
  const [b, d0, h] = pts;
  const d = `M${b[0]} ${b[1]} Q ${(b[0] + d0[0]) / 2 - 90} ${(b[1] + d0[1]) / 2 + 10} ${d0[0]} ${d0[1]} Q ${(d0[0] + h[0]) / 2} ${Math.min(d0[1], h[1]) - 50} ${h[0]} ${h[1]}`;
  return (
    <svg
      ref={ref}
      className={`route${seen ? ' is-in' : ''}`}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="A thin line from Brasília to Durham to Houston"
    >
      <path className="route__line" d={d} pathLength="1" />
      {ECOSYSTEM.route.map((c, i) => (
        <g key={c.name} className="route__stop" style={{ '--i': i }}>
          <circle cx={pts[i][0]} cy={pts[i][1]} r="5" />
          <text x={pts[i][0] + (i === 2 ? -14 : 14)} y={pts[i][1] + 5} textAnchor={i === 2 ? 'end' : 'start'}>{c.name}</text>
        </g>
      ))}
    </svg>
  );
}

export default function Ecosystem() {
  return (
    <section id="community" className="sec" aria-labelledby="community-heading">
      <div className="bench-col community">
        <div>
          <h2 id="community-heading" className="sec__title">{ECOSYSTEM.heading}</h2>
          <p className="sec__lede">{ECOSYSTEM.lede}</p>
          <ul className="roles">
            {ECOSYSTEM.roles.map((r) => (
              <li key={r.what}>
                <strong>{r.what}</strong>
                <span>{r.role}</span>
                {r.when && <em>{r.when}</em>}
              </li>
            ))}
          </ul>
        </div>
        <RouteLine />
      </div>

      <div className="bench-col">
        <h3 className="recog__title">Recognition</h3>
        <ul className="recog">
          {RECOGNITION.map((r) => (
            <li key={r.name}>
              <span className="recog__year">{r.year || ' '}</span>
              <strong>{r.name}</strong>
              {r.what && <span>{r.what}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
