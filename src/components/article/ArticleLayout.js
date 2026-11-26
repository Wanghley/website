import React from 'react';

// The body of a project or post. On a wide screen: contents on the left, the
// text in the middle, the facts on the right. Narrower: the facts become a strip
// above the text, and the contents a <details> (the same pair as the rail, shown
// instead of it). Each piece is passed in as a slot.
//   toc         the contents rail      tocInline   the narrow-screen contents
//   facts       the facts rail         factsInline the narrow-screen strip
//   hasToc      false when the text has no headings: the contents column is left out
export default function ArticleLayout({ toc, tocInline, facts, factsInline, hasToc = true, children }) {
  return (
    <div className={`article-layout${hasToc ? '' : ' article-layout--no-toc'}`}>
      {hasToc && <aside className="article-aside">{toc}</aside>}
      <article className="article-main">
        {factsInline}
        {tocInline}
        {children}
      </article>
      <aside className="article-facts-rail">{facts}</aside>
    </div>
  );
}
