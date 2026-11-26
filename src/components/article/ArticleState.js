import React from 'react';
import { PageHeader } from '../bench';

// A page that could not show its article: the load failed, or there is no such
// entry. `children` are the ways out (a retry, a link back to the list).
export default function ArticleState({ refdes, title, lede, children }) {
  return (
    <main id="main" className="article-page">
      <section className="bp-sec bp-sec--head">
        <div className="bench-col">
          <PageHeader refdes={refdes} title={title} size="md" lede={lede} />
        </div>
      </section>
      <section className="bp-sec bp-sec--light">
        <div className="bench-col article-state">{children}</div>
      </section>
    </main>
  );
}
