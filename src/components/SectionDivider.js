import React from 'react';
import './css/SectionDivider.css';

/**
 * SectionDivider — hairline rule with a centered channel mark.
 * Place between major homepage sections.
 *
 * Props:
 *   channel:  "01" / "02" / ...
 *   title:    short label e.g. "ORIGIN STORY"
 *   variant:  "dark" (default) | "light"  — for placement on dark/light backgrounds
 *   accent:   "blue" (default) | "green" | "amber"
 */
const SectionDivider = ({ channel, title, variant = 'dark', accent = 'blue' }) => {
  return (
    <div
      className={`sec-divider sec-divider--${variant} sec-divider--${accent}`}
      role="separator"
      aria-label={`Channel ${channel}: ${title}`}
    >
      <span className="sec-divider__rule" />
      <span className="sec-divider__mark">
        <span className="sec-divider__arrow">↓</span>
        <span className="sec-divider__id">CH:{channel}</span>
        <span className="sec-divider__sep" />
        <span className="sec-divider__title">{title}</span>
        <span className="sec-divider__arrow">↓</span>
      </span>
      <span className="sec-divider__rule" />
    </div>
  );
};

export default SectionDivider;
