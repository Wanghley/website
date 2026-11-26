import React from 'react';
import { usePostHog } from '../../lib/analytics';

// Table of contents: a sticky rail on wide screens, a <details> on narrow ones.
// `event` is the PostHog event for a click (project_toc_clicked, blog_toc_clicked).
// Write-ups often open a heading with an emoji; the contents list reads better
// without it. Display only: the anchor id is unchanged.
const plain = (text) => text.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '') || text;

const TableOfContents = React.memo(({ headings, activeId, slug, event, inline = false }) => {
    const posthog = usePostHog();
    if (!headings || headings.length === 0) return null;

    const list = (
        <ul className="article-toc__list">
            {headings.map((heading, index) => (
                <li key={`${heading.id}-${index}`} className={`article-toc__item article-toc__item--${heading.depth ?? heading.level}`}>
                    <a
                        href={`#${heading.id}`}
                        aria-current={activeId === heading.id ? 'true' : undefined}
                        onClick={() => posthog?.capture(event, { slug, heading: heading.text, level: heading.level })}
                    >
                        {plain(heading.text)}
                    </a>
                </li>
            ))}
        </ul>
    );

    return inline ? (
        <details className="article-toc article-toc--inline">
            <summary>On this page</summary>
            {list}
        </details>
    ) : (
        <nav className="article-toc article-toc--rail" aria-label="On this page">
            <p className="article-toc__title">On this page</p>
            {list}
        </nav>
    );
});

TableOfContents.displayName = 'TableOfContents';

export default TableOfContents;
