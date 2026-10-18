import React, { useEffect, useState } from 'react';
import { fetchBlogs } from '../../../api/blog';
import { BLOG } from '../../../data/home';
import { BenchCard, BenchCards } from '../../bench';

const imageOf = (p) => {
  const f = p?.attributes?.Featured?.data?.attributes;
  return f?.formats?.medium?.url || f?.formats?.small?.url || f?.url || null;
};
const date = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let alive = true;
    fetchBlogs(1, BLOG.count)
      .then((res) => {
        const rows = (Array.isArray(res?.data) ? res.data : res || []).filter((p) => p?.attributes?.Title).slice(0, BLOG.count);
        if (alive) setPosts(rows);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <section id="blog" className="bp-sec bp-sec--light" aria-labelledby="blog-heading">
      <div className="bench-col">
        <h2 id="blog-heading" className="bp-sec__title">{BLOG.heading}</h2>
        {posts.length > 0 && (
          <BenchCards>
            {posts.map((p) => {
              const a = p.attributes;
              return (
                <BenchCard
                  key={p.id}
                  href={`/blog/${a.slug}`}
                  title={a.Title}
                  text={a.Excerpt}
                  meta={date(a.published || a.publishedAt)}
                  image={imageOf(p)}
                />
              );
            })}
          </BenchCards>
        )}
        <p className="bp-sec__more"><a className="bp-link" href="/blog">All posts <span aria-hidden="true">→</span></a></p>
      </div>
    </section>
  );
}
