import React from 'react';
import { SpecTable } from '../bench';

// The facts of a project or post as a datasheet block. `rows` are
// [{ label, value }]; empty rows are dropped, and with none left nothing renders.
//
//   variant 'rail'          the sticky column beside the text (wide screens)
//           'strip-narrow'  a strip above the text, shown only where the rail is not
//           'strip'         the strip, always (an entry with no write-up has no rail)
export default function ArticleFacts({ title = 'Details', rows, variant = 'rail' }) {
  const kept = rows.filter((row) => row && row.value);
  if (kept.length === 0) return null;

  return (
    <section className={`article-facts article-facts--${variant}`} aria-label={title}>
      {variant === 'rail' && <p className="article-facts__title">{title}</p>}
      <SpecTable rows={kept} stack />
    </section>
  );
}
