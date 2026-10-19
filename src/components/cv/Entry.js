import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prose } from '../bench';

// One CV line: when and where on the left, who and what on the right. `as` is
// the heading level of the organisation, so the outline never skips a level.
export default function CvEntry({ when, where, org, role, as: Org = 'h4', children }) {
  return (
    <li className="cv-entry">
      <div className="cv-entry__meta">
        {when && <p className="cv-entry__when">{when}</p>}
        {where && <p className="cv-entry__where">{where}</p>}
      </div>
      <div className="cv-entry__body">
        <Org className="cv-entry__org">{org}</Org>
        {role && <p className="cv-entry__role">{role}</p>}
        {children}
      </div>
    </li>
  );
}

// CMS descriptions are markdown. react-markdown 9 takes no className, so the
// wrapper carries the class.
export function CvText({ children }) {
  if (!children || !String(children).trim()) return null;
  return (
    <Prose className="bp-prose--dense cv-entry__text">
      <ReactMarkdown>{String(children)}</ReactMarkdown>
    </Prose>
  );
}
