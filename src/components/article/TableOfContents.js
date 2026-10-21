import React from 'react';
import { usePostHog } from '../../lib/analytics';

// Table of contents: a sticky rail on wide screens, a <details> on narrow ones.
// `event` is the PostHog event for a click (project_toc_clicked, blog_toc_clicked).
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
                        {heading.text}
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
