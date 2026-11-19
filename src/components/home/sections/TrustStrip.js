import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchAffiliations, fetchHomePage } from '../../../api/site';
import { mediaUrl } from '../../../api/cms';
import useCmsData from '../../../hooks/useCmsData';

// "Where I have been": the CMS affiliations, grouped by how I know them, as a
// strip of logos that rolls on its own. Everything (heading, group labels, order,
// logos, links) comes from the CMS. An affiliation without a logo is shown as its
// name, so the strip is complete while logos are still being added.

// How fast the strip rolls, in pixels per second. The loop time follows the width
// of the content, so adding affiliations in the CMS never makes it run faster.
const SPEED = 36;

const loadTrust = () => Promise.all([fetchHomePage(), fetchAffiliations()]).then(([home, rows]) => ({ home, rows }));

// Logos are drawn as one-colour marks (see TrustStrip.css), which only works for
// formats that can be transparent. A JPEG logo would become a solid block, so it
// is shown as the name instead.
const canBeTransparent = (media) => /svg|png|webp|gif|avif/i.test(media.mime || media.ext || '');

function toMark(row) {
  const logo = row.logo && canBeTransparent(row.logo) ? row.logo : null;
  return {
    id: row.documentId || `${row.group}:${row.name}`,
    name: row.name,
    url: row.url || null,
    logo: logo && {
      src: mediaUrl(logo, ['small', 'medium']),
      width: logo.width || undefined,
      height: logo.height || undefined,
    },
  };
}

// Groups appear in the order the CMS sorts their first affiliation.
function groupMarks(rows, labels) {
  const groups = [];
  rows.forEach((row) => {
    let group = groups.find((g) => g.key === row.group);
    if (!group) {
      group = { key: row.group, label: labels[row.group] || row.group, marks: [] };
      groups.push(group);
    }
    group.marks.push(toMark(row));
  });
  return groups;
}

function Mark({ mark, clone }) {
  const face = mark.logo ? (
    <img
      className="hm-trust__logo"
      src={mark.logo.src}
      alt={mark.name}
      width={mark.logo.width}
      height={mark.logo.height}
      decoding="async"
      draggable="false"
    />
  ) : (
    <span className="hm-trust__wordmark">{mark.name}</span>
  );
  if (!mark.url) return face;
  return (
    <a
      className="hm-trust__link"
      href={mark.url}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={clone ? -1 : undefined}
    >
      {face}
    </a>
  );
}

// One full pass of the strip. It is rendered twice, so the loop has no seam; the
// second pass is hidden from assistive tech and the keyboard.
const MarkSet = React.forwardRef(function MarkSet({ groups, clone }, ref) {
  return (
    <dl className="hm-trust__set" ref={ref} aria-hidden={clone ? 'true' : undefined}>
      {groups.map((g) => (
        <div key={g.key} className="hm-trust__group">
          <dt>{g.label}</dt>
          <dd>
            <ul>
              {g.marks.map((m) => (
                <li key={m.id}><Mark mark={m} clone={clone} /></li>
              ))}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  );
});

export default function TrustStrip() {
  const { status, data } = useCmsData(loadTrust);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);
  const setRef = useRef(null);

  const groups = useMemo(
    () => (data ? groupMarks(data.rows, data.home.trustGroupLabels || {}) : []),
    [data],
  );
  const hasGroups = groups.length > 0;

  // Loop time = one pass of the content / SPEED, kept current as the logos load.
  useEffect(() => {
    const track = trackRef.current;
    const pass = setRef.current;
    if (!track || !pass) return undefined;
    const apply = () => {
      const width = pass.getBoundingClientRect().width;
      if (width > 0) track.style.setProperty('--trust-dur', `${(width / SPEED).toFixed(1)}s`);
    };
    apply();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(apply);
    observer.observe(pass);
    return () => observer.disconnect();
  }, [hasGroups]);

  if (status !== 'ready' || !data || !hasGroups) return null;

  return (
    <section className={`hm-trust bp-theme${paused ? ' is-paused' : ''}`} aria-labelledby="trust-heading">
      <div className="bench-col hm-trust__head">
        <h2 id="trust-heading" className="hm-trust__title">{data.home.trustHeading}</h2>
        <button type="button" className="hm-trust__toggle" onClick={() => setPaused((p) => !p)}>
          {paused ? 'Play' : 'Pause'}
        </button>
      </div>
      <div className="hm-trust__viewport">
        <div className="hm-trust__track" ref={trackRef}>
          <MarkSet groups={groups} ref={setRef} />
          <MarkSet groups={groups} clone />
        </div>
      </div>
    </section>
  );
}
