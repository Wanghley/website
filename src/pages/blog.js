import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { usePostHog } from '../lib/analytics';
import { fetchAllPosts } from '../api/site';
import { mediaUrl } from '../api/cms';
import { formatMonth } from '../utils/formatDate';
import { calculateReadingTime } from '../components/article/utils';
import { PageHeader, BenchCard, BenchCards } from '../components/bench';
import '../components/css/list-page.css';

// The whole list is a handful of posts, so it loads in one go: search and the
// category filter then cover every post.

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

const Blogs = () => {
    const posthog = usePostHog();
    const [posts, setPosts] = useState([]);
    const [status, setStatus] = useState('loading'); // loading | ready | error
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const searchInputRef = useRef(null);

    const load = useCallback(async () => {
        setStatus('loading');
        try {
            const rows = await fetchAllPosts();
            setPosts(rows.filter((p) => p?.title));
            setStatus('ready');
        } catch {
            setStatus('error');
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // Keyboard: Cmd/Ctrl+K focuses search, Escape clears it
    useEffect(() => {
        const onKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setSearchTerm('');
                searchInputRef.current?.blur();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // newest first
    const sorted = useMemo(
        () => [...posts].sort((a, b) => String(b.date || b.publishedAt || '').localeCompare(String(a.date || a.publishedAt || ''))),
        [posts]
    );

    const categories = useMemo(() => {
        const counts = {};
        sorted.forEach((p) => (p.categories || []).forEach((c) => { counts[c] = (counts[c] || 0) + 1; }));
        const named = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).map((name) => ({ name, count: counts[name] }));
        return [{ name: 'All', count: sorted.length }, ...named];
    }, [sorted]);

    const shown = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return sorted.filter((a) => {
            const matchesSearch = !q || a.title.toLowerCase().includes(q) || (a.excerpt || '').toLowerCase().includes(q);
            const matchesCategory = activeCategory === 'All' || (a.categories || []).includes(activeCategory);
            return matchesSearch && matchesCategory;
        });
    }, [sorted, searchTerm, activeCategory]);

    const filtering = Boolean(searchTerm.trim()) || activeCategory !== 'All';
    const clearFilters = () => { setSearchTerm(''); setActiveCategory('All'); };

    return (
        <main id="main" className="blog-page">
            <Helmet>
                <title>Blog | Wanghley Martins</title>
                <meta name="description" content="Notes by Wanghley Martins on building, studying and the detours between." />
                <link rel="canonical" href="https://wanghley.com/blog" />
                <meta property="og:title" content="Blog | Wanghley Martins" />
                <meta property="og:description" content="Notes on building, studying and the detours between." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://wanghley.com/blog" />
            </Helmet>

            <section className="bp-sec bp-sec--head">
                <div className="bench-col">
                    <PageHeader
                        refdes="U3"
                        title="Blog"
                        lede="Notes on building, studying and the detours between, newest first."
                        meta={status === 'ready' ? [`${sorted.length} posts`] : []}
                    />
                </div>
            </section>

            <section className="bp-sec bp-sec--light blog-body" aria-label="Post list">
                <div className="bench-col">
                    <div className="list-toolbar">
                        <div className="list-search">
                            <label htmlFor="list-search" className="sr-only">Search posts</label>
                            <input
                                id="list-search"
                                ref={searchInputRef}
                                type="search"
                                placeholder="Search posts"
                                autoComplete="off"
                                value={searchTerm}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSearchTerm(val);
                                    if (val.trim().length >= 3) posthog?.capture('blog_searched', { search_term: val.trim() });
                                }}
                            />
                            {searchTerm ? (
                                <button type="button" className="list-search__clear" onClick={() => setSearchTerm('')}>Clear</button>
                            ) : (
                                <kbd aria-hidden="true">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
                            )}
                        </div>

                        {categories.length > 2 && (
                            <div className="list-filters" role="group" aria-label="Filter by category">
                                {categories.map(({ name, count }) => (
                                    <button
                                        key={name}
                                        type="button"
                                        className="list-chip"
                                        aria-pressed={activeCategory === name}
                                        onClick={() => { setActiveCategory(name); posthog?.capture('blog_category_filtered', { category: name }); }}
                                    >
                                        {name}<span className="list-chip__n">{count}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className="list-results" role="status" aria-live="polite">
                        {status === 'loading' && 'Loading posts.'}
                        {status === 'ready' && (filtering
                            ? `${shown.length} of ${sorted.length} posts${activeCategory !== 'All' ? ` in ${activeCategory}` : ''}${searchTerm.trim() ? ` matching "${searchTerm.trim()}"` : ''}`
                            : `${sorted.length} posts`)}
                    </p>

                    {status === 'loading' && (
                        <ul className="bp-cards" aria-hidden="true">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <li key={i} className="bp-card">
                                    <span className="bp-card__media"><span className="bp-card__blank" /></span>
                                    <span className="list-skeleton list-skeleton--meta" />
                                    <span className="list-skeleton list-skeleton--title" />
                                    <span className="list-skeleton list-skeleton--text" />
                                </li>
                            ))}
                        </ul>
                    )}

                    {status === 'error' && (
                        <div className="list-empty">
                            <h2 className="list-empty__title">The posts did not load</h2>
                            <p>The data service did not answer. Check your connection and try again.</p>
                            <button type="button" className="btn btn--primary" onClick={load}>Try again</button>
                        </div>
                    )}

                    {status === 'ready' && shown.length > 0 && <h2 className="sr-only">All posts</h2>}

                    {status === 'ready' && shown.length > 0 && (
                        <BenchCards>
                            {shown.map((post, index) => {
                                const { title: Title, excerpt: Teaser, categories: Categories, date, publishedAt, slug, cover, body: Content } = post;
                                const readTime = calculateReadingTime(Content);
                                return (
                                    <BenchCard
                                        key={post.documentId ?? slug}
                                        href={`/blog/${slug}`}
                                        title={Title}
                                        text={Teaser}
                                        meta={[(date || publishedAt) && formatMonth(date || publishedAt), Categories?.[0], readTime ? `${readTime} min read` : null].filter(Boolean).join(' · ')}
                                        image={mediaUrl(cover, ['medium', 'small', 'large'])}
                                        onClick={() => posthog?.capture('blog_card_clicked', { title: Title, slug, category: Categories?.[0], index })}
                                    />
                                );
                            })}
                        </BenchCards>
                    )}

                    {status === 'ready' && shown.length === 0 && (
                        <div className="list-empty">
                            <h2 className="list-empty__title">No posts match</h2>
                            <p>Try a shorter search, or another category.</p>
                            {filtering && <button type="button" className="btn btn--primary" onClick={clearFilters}>Show all {sorted.length} posts</button>}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Blogs;
