import React from 'react';
import { Link } from 'react-router-dom';
import fetchAbout from '../api/about';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageHeader, Prose, SpecTable } from './bench';
import { useActiveHeading } from './article/hooks';
import { slugify, textOf } from './article/utils';
import { ABOUT_PAGE } from '../data/about';
import { CONTACT } from '../data/home';
import './css/AboutArticle.css';

const AboutText = () => {
    const [about, setAbout] = useState(null);
    const [personalInfo, setPersonalInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [headings, setHeadings] = useState([]);
    const [references, setReferences] = useState([]);

    const getAbout = async () => {
        try {
            const data = await fetchAbout();
            const aboutContent = data.data.attributes.about;
            
            // Extract reference section first
            const referencesSectionMatch = aboutContent.match(/## References\s+([\s\S]+)$/);
            const referencesSection = referencesSectionMatch ? referencesSectionMatch[1] : '';
            
            // Extract references — handle both [N]: and [^N]: formats
            const referenceRegex = /\[\^?(\d+)\](?::|-)?\s*(.*?)(?=\n\s*\[\^?\d+\](?::|-)|\n\s*$|$)/gs;
            const refs = [];
            let match;

            while ((match = referenceRegex.exec(referencesSection)) !== null) {
                refs.push({
                    id: match[1],
                    text: match[2].trim()
                });
            }

            // Remove the entire references section from content
            let cleanedContent = aboutContent;
            if (referencesSectionMatch) {
                cleanedContent = aboutContent.replace(/## References[\s\S]+$/, '').trim();
            }

            // Also collect inline footnote definitions [^N]: text outside the references section
            const inlineFootnoteRegex = /^\[\^(\d+)\]:\s*(.+)$/gm;
            let fnMatch;
            while ((fnMatch = inlineFootnoteRegex.exec(cleanedContent)) !== null) {
                const matchId = fnMatch[1];
                const matchText = fnMatch[2];
                if (!refs.some(r => r.id === matchId)) {
                    refs.push({ id: matchId, text: matchText.trim() });
                }
            }
            // Remove inline footnote definition lines from content
            cleanedContent = cleanedContent.replace(/^\[\^(\d+)\]:\s*.+$/gm, '').trim();

            // Clean up any HTML link remnants that might be at the end
            cleanedContent = cleanedContent.replace(/\[\d+\]\([^)]+\)/g, '');

            // Convert [N] numeric citations to links
            cleanedContent = cleanedContent.replace(/\[(\d+)\](?:-|\s+)?/g, (match, refId) => {
                if (refs.some(ref => ref.id === refId)) {
                    return `[[${refId}]](#reference-${refId})`;
                }
                return match;
            });

            // Convert [^N] footnote references to citation links
            cleanedContent = cleanedContent.replace(/\[\^(\d+)\]/g, (match, refId) => {
                if (refs.some(ref => ref.id === refId)) {
                    return `[[${refId}]](#reference-${refId})`;
                }
                return match;
            });

            // Sort refs numerically
            refs.sort((a, b) => parseInt(a.id) - parseInt(b.id));
            
            setAbout(cleanedContent);
            setReferences(refs);
            
            // Set personal info if available
            if (data.data.attributes.personalInfo) {
                setPersonalInfo(data.data.attributes.personalInfo);
            }
            
            // Extract headings for the index (ignoring h1, only h2 and beyond)
            const tempHeadings = [];
            let sectionCounter = 0;
            let subsectionCounter = 0;
            
            cleanedContent.split('\n').forEach(line => {
                const match = line.match(/^(#{2,3})\s+(.*)/); // Only match ## and ###
                if (match) {
                    const level = match[1].length;
                    const text = match[2];
                    const id = slugify(text);
                    
                    if (level === 2) {
                        sectionCounter++;
                        subsectionCounter = 0;
                    } else if (level === 3) {
                        subsectionCounter++;
                    }
                    
                    tempHeadings.push({ 
                        level, 
                        text,
                        id,
                        number: level === 2 ? sectionCounter : `${sectionCounter}.${subsectionCounter}`
                    });
                }
            });
            setHeadings(tempHeadings);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load content');
            setLoading(false);
        }
    };

    useEffect(() => {
        getAbout();
    }, []);

    const activeHeading = useActiveHeading(!loading && !error);

    const markdownComponents = {
        // The page already has its h1 (the title), so a stray # in the article is an h2.
        h1: ({ children }) => <h2 id={slugify(textOf(children))}>{children}</h2>,
        h2: ({ children }) => <h2 id={slugify(textOf(children))}>{children}</h2>,
        h3: ({ children }) => <h3 id={slugify(textOf(children))}>{children}</h3>,
        p: ({ node, children }) => {
            // footnote definitions are stripped above; a stray one renders nothing
            if (React.Children.count(children) === 1 &&
                typeof children === 'string' &&
                children.match(/^\[\^\d+\]:/)) {
                return null;
            }
            // an image on its own line becomes a figure, never a figure inside a <p>
            if (node.children?.length === 1 && node.children[0].tagName === 'img') {
                return <>{children}</>;
            }
            return <p>{children}</p>;
        },
        a: ({ href, children }) => {
            // citation links: [1] jumps to the reference list
            if (href && href.startsWith('#reference-') && String(children).match(/^\[\d+\]$/)) {
                const refId = String(children).match(/\d+/)[0];
                return <a href={href} className="about-cite" title={`Jump to reference ${refId}`}>{children}</a>;
            }
            return <a href={href} target="_blank" rel="noopener noreferrer">{children} <span aria-hidden="true">↗</span></a>;
        },
        // images get captions, as in an encyclopedia
        img: ({ src, alt }) => (
            <figure className="about-figure">
                <img src={src} alt={alt || ''} loading="lazy" />
                {alt && <figcaption>{alt}</figcaption>}
            </figure>
        ),
        // a wide table scrolls inside a focusable wrapper
        table: ({ children }) => (
            <div className="bp-scroll" tabIndex={0} role="group" aria-label="Table">
                <table>{children}</table>
            </div>
        ),
    };

    if (loading) {
        return (
            <>
                <section className="bp-sec bp-sec--head" aria-busy="true">
                    <div className="bench-col">
                        <div className="bp-rule" aria-hidden="true" />
                        <div className="about-skeleton about-skeleton--title" />
                        <div className="about-skeleton about-skeleton--lede" />
                    </div>
                </section>
                <section className="bp-sec bp-sec--light">
                    <div className="bench-col">
                        {[1, 2, 3].map((n) => <div key={n} className="about-skeleton about-skeleton--line" />)}
                    </div>
                </section>
                <p className="sr-only" role="status">Loading the article.</p>
            </>
        );
    }

    if (error) {
        return (
            <>
                <section className="bp-sec bp-sec--head">
                    <div className="bench-col">
                        <PageHeader refdes="J1" title="Wanghley" lede={ABOUT_PAGE.tagline} />
                    </div>
                </section>
                <section className="bp-sec bp-sec--light">
                    <div className="bench-col about-error">
                        <p>The article did not load. Check your connection and try again, or email <a className="bp-link" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</p>
                        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>Try again</button>
                    </div>
                </section>
            </>
        );
    }

    // Infobox rows: a field the CMS sets wins; the static facts fill the gaps.
    const info = personalInfo || {};
    const infoRows = ABOUT_PAGE.infobox
        .map(({ label, key, value }) => {
            const v = info[key] || value;
            if (!v) return null;
            return {
                label,
                value: key === 'website'
                    ? <a href={v} target="_blank" rel="noopener noreferrer">{String(v).replace(/^https?:\/\//, '')}</a>
                    : v,
            };
        })
        .filter(Boolean);
    const photo = info.photo ? { src: info.photo, alt: 'Wanghley' } : ABOUT_PAGE.photo;

    // Wikipedia numbers its contents list, not the headings themselves.
    const referencesNumber = headings.filter((h) => h.level === 2).length + 1;
    const contents = (
        <ol className="about-toc__list">
            {headings.map((heading) => (
                <li key={heading.id} className={`about-toc__item about-toc__item--${heading.level}`}>
                    <a href={`#${heading.id}`} aria-current={activeHeading === heading.id ? 'true' : undefined}>
                        <span className="about-toc__n">{heading.number}</span>{heading.text}
                    </a>
                </li>
            ))}
            {references.length > 0 && (
                <li className="about-toc__item about-toc__item--2">
                    <a href="#references" aria-current={activeHeading === 'references' ? 'true' : undefined}>
                        <span className="about-toc__n">{referencesNumber}</span>References
                    </a>
                </li>
            )}
        </ol>
    );

    // Reference text comes from the CMS: escape it, then turn URLs and DOIs into links.
    const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const formatReferenceText = (text) => {
        const withLinks = escapeHtml(text).replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        return withLinks.replace(
            /\bDOI:\s*([^\s<]+)/gi,
            'DOI: <a href="https://doi.org/$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
    };

    return (
        <>
            <section className="bp-sec bp-sec--head">
                <div className="bench-col">
                    <PageHeader
                        refdes="J1"
                        title={<>Wanghley <span className="about-ipa">({ABOUT_PAGE.pronunciation})</span></>}
                        lede={ABOUT_PAGE.tagline}
                    />
                </div>
            </section>

            <section className="bp-sec bp-sec--light about-body">
                <div className="bench-col about-layout">
                    <nav className="about-toc about-toc--rail" aria-label="Contents">
                        <p className="about-toc__label">Contents</p>
                        {contents}
                    </nav>

                    <article className="about-article">
                        <details className="about-toc about-toc--inline">
                            <summary>Contents</summary>
                            {contents}
                        </details>

                        <p className="about-hatnote">
                            {ABOUT_PAGE.hatnote} <Link to="/about">{ABOUT_PAGE.hatnoteLink}</Link>.
                        </p>

                        <aside className="about-infobox" aria-label="Wanghley at a glance">
                            <p className="about-infobox__title">Wanghley</p>
                            <figure>
                                <img src={photo.src} alt={photo.alt} width="240" height="320" />
                            </figure>
                            <SpecTable rows={infoRows} />
                        </aside>

                        <Prose className="article-content about-content">
                            <p className="about-lead"><strong>Wanghley</strong> {ABOUT_PAGE.lead}</p>

                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {about}
                            </ReactMarkdown>

                            {references.length > 0 && (
                                <>
                                    <h2 id="references">References</h2>
                                    <ol className="about-refs">
                                        {references.map((ref) => (
                                            <li key={ref.id} id={`reference-${ref.id}`}>
                                                <span className="about-refs__id">[{ref.id}]</span>
                                                <span dangerouslySetInnerHTML={{ __html: formatReferenceText(ref.text.replace(/^.*?References\s*/is, '')) }} />
                                            </li>
                                        ))}
                                    </ol>
                                </>
                            )}
                        </Prose>
                    </article>
                </div>
            </section>
        </>
    );
};

export default AboutText;
