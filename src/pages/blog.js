import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { usePostHog } from '../lib/analytics';
import { fetchAllPosts } from '../api/site';
import { mediaUrl } from '../api/cms';
import { formatMonth } from '../utils/formatDate';
import { calculateReadingTime } from '../components/article/utils';
import { PageHeader, BenchCard, BenchCards, BenchCardSkeleton, ListToolbar } from '../components/bench';
import { newestFirst, postSizes, readingOrder, visibleChips } from '../components/bench/bento';
import '../components/css/list-page.css';

// The whole list is a handful of posts, so it loads in one go: search and the
// category filter then cover every post.

const SKELETON_SIZES = ['lead', 'std', 'std', 'std', 'std', 'std'];
const postDate = (p) => p.date || p.publishedAt;

const Blogs = () => {
    const posthog = usePostHog();
    const [posts, setPosts] = useState([]);
    const [status, setStatus] = useState('loading'); // loading | ready | error
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const load = useCallback(async () => {
        setStatus('loading');
        try {
            const rows = await fetchAllPosts();
            setPosts(newestFirst(rows.filter((p) => p?.title), postDate));
            setStatus('ready');
        } catch {
            setStatus('error');
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const onSearch = useCallback((val) => {
        setSearchTerm(val);
        if (val.trim().length >= 3) posthog?.capture('blog_searched', { search_term: val.trim() });
    }, [posthog]);

    const onChip = useCallback((name) => {
        setActiveCategory(name);
        posthog?.capture('blog_category_filtered', { category: name });
    }, [posthog]);

    const filtering = Boolean(searchTerm.trim()) || activeCategory !== 'All';
    const clearFilters = () => { setSearchTerm(''); setActiveCategory('All'); };

    // Chips count every post; only the topics with two or more are offered. The
    // other topics still show on their post and still match a search.
    const chips = useMemo(() => {
        const counts = {};
        posts.forEach((p) => (p.categories || []).forEach((c) => { counts[c] = (counts[c] || 0) + 1; }));
        const named = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).map((name) => ({ name, count: counts[name] }));
        return visibleChips([{ name: 'All', count: posts.length }, ...named]);
    }, [posts]);

    const shown = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return posts.filter((a) => {
            const matchesSearch = !q || a.title.toLowerCase().includes(q) || (a.excerpt || '').toLowerCase().includes(q);
            const matchesCategory = activeCategory === 'All' || (a.categories || []).includes(activeCategory);
            return matchesSearch && matchesCategory;
        });
    }, [posts, searchTerm, activeCategory]);

    // The tiles in the order they appear on the grid, so tabbing goes the way the eye does.
    const tiles = useMemo(() => {
        const sizes = postSizes(shown, { uniform: filtering });
        return readingOrder(sizes).map((i) => ({ post: shown[i], size: sizes[i] }));
    }, [shown, filtering]);

    return (
        <main id="main" className="blog-page list-page">
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
                        meta={status === 'ready' ? [`${posts.length} posts`] : []}
                    />
                </div>
            </section>

            <section className="bp-sec bp-sec--light blog-body" aria-label="Post list">
                <div className="bench-col">
                    <ListToolbar
                        noun="posts"
                        status={status}
                        searchTerm={searchTerm}
                        onSearch={onSearch}
                        chips={chips}
                        activeCategory={activeCategory}
                        onChip={onChip}
                        total={posts.length}
                        shown={shown.length}
                    />

                    {status === 'loading' && (
                        <ul className="bp-cards bp-cards--bento" aria-hidden="true">
                            {SKELETON_SIZES.map((size, i) => <BenchCardSkeleton key={i} size={size} />)}
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
                        <BenchCards bento>
                            {tiles.map(({ post, size }, index) => {
                                const { title: Title, excerpt: Teaser, categories: Categories, slug, cover, body: Content } = post;
                                const readTime = calculateReadingTime(Content);
                                return (
                                    <BenchCard
                                        key={post.documentId ?? slug}
                                        size={size}
                                        href={`/blog/${slug}`}
                                        title={Title}
                                        text={Teaser}
                                        meta={[postDate(post) && formatMonth(postDate(post)), Categories?.[0], readTime ? `${readTime} min read` : null].filter(Boolean).join(' · ')}
                                        image={mediaUrl(cover, size === 'std' ? ['medium', 'small', 'large'] : ['large', 'medium'])}
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
                            {filtering && <button type="button" className="btn btn--primary" onClick={clearFilters}>Show all {posts.length} posts</button>}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Blogs;
