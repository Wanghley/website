import React from 'react';

// Term and description rows. `data` sets the values in mono (measurements,
// dates, part numbers). `keyWidth` overrides the term column, e.g. "12rem".
export default function SpecTable({ rows, data = false, keyWidth }) {
  return (
    <dl className={`bp-spec${data ? ' bp-spec--data' : ''}`} style={keyWidth ? { '--spec-key': keyWidth } : undefined}>
      {rows.map((r) => (
        <div key={r.label} className="bp-spec__row">
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
