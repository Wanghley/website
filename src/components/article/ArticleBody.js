import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import 'katex/dist/katex.min.css';
import benchPrism from '../../lib/benchPrism';
import { Prose } from '../bench';
import MermaidDiagram from './MermaidDiagram';
import { slugify, textOf } from './utils';

// Markdown element renderers. The page has one h1 (its title), so the headings
// in the write-up render at the `depth` extractHeadings worked out for them (the
// shallowest is an h2, and none skips a level). A heading it did not list, such
// as a #### one, keeps its place relative to the shallowest.
const markdownComponents = (headings) => {
    const depthById = new Map();
    headings.forEach((h) => { if (!depthById.has(h.id)) depthById.set(h.id, h.depth); });
    const base = headings.length ? Math.min(...headings.map((h) => h.level)) : 2;

    const heading = (level) => ({ children }) => {
        const id = slugify(textOf(children));
        const depth = depthById.get(id) ?? Math.min(6, Math.max(2, level + 2 - base));
        const Tag = `h${depth}`;
        return <Tag id={id}>{children}</Tag>;
    };
    return {
        h1: heading(1), h2: heading(2), h3: heading(3), h4: heading(4), h5: heading(5), h6: heading(6),
        // A paragraph holding only an image is a figure. Anything else keeps the
        // image inline, so a figure is never nested inside a <p>.
        p: ({ node, children }) => {
            const only = node.children?.length === 1 && node.children[0].tagName === 'img';
            if (only) {
                const alt = node.children[0].properties?.alt;
                return <figure className="article-figure">{children}{alt && <figcaption>{alt}</figcaption>}</figure>;
            }
            return <p>{children}</p>;
        },
        img: ({ src, alt }) => <img src={src} alt={alt || ''} loading="lazy" />,
        // A wide table scrolls sideways on a phone, so its wrapper takes focus for keyboard users.
        table: ({ children }) => (
            <div className="bp-scroll" tabIndex={0} role="group" aria-label="Table">
                <table>{children}</table>
            </div>
        ),
        // A task-list checkbox has no label of its own; the state is read out as text.
        input: ({ type, checked }) => (type === 'checkbox' ? (
            <>
                <span className="sr-only">{checked ? 'Done: ' : 'To do: '}</span>
                <input type="checkbox" checked={!!checked} readOnly disabled aria-hidden="true" tabIndex={-1} />
            </>
        ) : null),
        // react-markdown 9 has no `inline` flag: a fenced block arrives as <pre><code>.
        // `pre` steps aside so a block brings its own wrapper; inline code stays inline.
        pre: ({ children }) => <>{children}</>,
        code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            if (!language && !codeString.includes('\n')) {
                return <code className="article-inline-code" {...props}>{children}</code>;
            }
            if (language === 'mermaid' || language === 'mmd') {
                return <MermaidDiagram code={codeString} />;
            }
            return (
                <div className="article-code-wrapper">
                    {language && <span className="article-code-lang">{language}</span>}
                    <SyntaxHighlighter
                        style={benchPrism}
                        language={language || undefined}
                        PreTag="div"
                        className="article-code-block"
                        tabIndex={0}
                        role="group"
                        aria-label={`${language || 'Code'} block`}
                    >
                        {codeString}
                    </SyntaxHighlighter>
                </div>
            );
        },
        a: ({ href, children }) => {
            if (href?.startsWith('#')) return <a href={href}>{children}</a>;
            if (href?.startsWith('/')) return <Link to={href}>{children}</Link>;
            return <a href={href} target="_blank" rel="noopener noreferrer">{children} <span aria-hidden="true">↗</span></a>;
        },
    };
};

// A markdown write-up in the kit's Prose column. `raw` also allows the HTML that
// some blog posts embed.
export default function ArticleBody({ source, headings, raw = false }) {
    const components = useMemo(() => markdownComponents(headings), [headings]);

    return (
        <Prose className="article-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={raw ? [rehypeKatex, rehypeRaw] : [rehypeKatex]}
                components={components}
            >
                {source}
            </ReactMarkdown>
        </Prose>
    );
}
