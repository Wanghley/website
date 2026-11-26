import React from 'react';

// Term and description rows. `data` sets the values in mono (measurements,
// dates, part numbers). `keyWidth` overrides the term column, e.g. "12rem".
// `stack` puts each term above its value, for a narrow rail.
export default function SpecTable({ rows, data = false, keyWidth, stack = false }) {
  return (
    <dl
      className={`bp-spec${data ? ' bp-spec--data' : ''}${stack ? ' bp-spec--stack' : ''}`}
      style={keyWidth ? { '--spec-key': keyWidth } : undefined}
    >
      {rows.map((r) => (
        <div key={r.label} className="bp-spec__row">
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
