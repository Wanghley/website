import React from 'react';
import { fetchHomePage, fetchRecentPosts } from '../../../api/site';
import { mediaUrl } from '../../../api/cms';
import useCmsData from '../../../hooks/useCmsData';
import { BenchCard, BenchCards } from '../../bench';

const date = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');

const load = () => fetchHomePage().then(async (home) => {
  const { data } = await fetchRecentPosts(home.blogCount || 3);
  return { home, posts: data };
});

export default function Blog() {
  const { status, data } = useCmsData(load);
  if (status !== 'ready' || !data) return null;

  return (
    <section id="blog" className="bp-sec bp-sec--light" aria-labelledby="blog-heading">
      <div className="bench-col">
        <h2 id="blog-heading" className="bp-sec__title">{data.home.blogHeading}</h2>
        {data.posts.length > 0 && (
          <BenchCards>
            {data.posts.map((p) => (
              <BenchCard
                key={p.documentId}
                href={`/blog/${p.slug}`}
                title={p.title}
                text={p.excerpt}
                meta={date(p.date || p.publishedAt)}
                image={mediaUrl(p.cover)}
              />
            ))}
          </BenchCards>
        )}
        <p className="bp-sec__more"><a className="bp-link" href="/blog">All posts <span aria-hidden="true">→</span></a></p>
      </div>
    </section>
  );
}
