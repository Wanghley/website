import React, { useEffect, useState } from 'react';
import { fetchBlogs } from '../../../api/blog';
import { cloudinarySrc } from '../../../utils/cloudinaryImage';
import { BLOG } from '../../../data/home';

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
    <section id="blog" className="hm-sec" aria-labelledby="blog-heading">
      <div className="bench-col">
        <h2 id="blog-heading" className="hm-sec__title">{BLOG.heading}</h2>
        {posts.length > 0 && (
          <ul className="hm-cards hm-cards--three">
            {posts.map((p) => {
              const a = p.attributes;
              const href = `/blog/${a.slug}`;
              const img = imageOf(p);
              return (
                <li key={p.id} className="hm-card">
                  <a className="hm-card__media" href={href} tabIndex={-1} aria-hidden="true">
                    {img ? <img src={cloudinarySrc(img, { width: 640 })} alt="" width="640" height="480" loading="lazy" decoding="async" /> : <span className="hm-card__blank" />}
                  </a>
                  <p className="hm-card__meta">{date(a.published || a.publishedAt)}</p>
                  <h3 className="hm-card__title"><a href={href}>{a.Title}</a></h3>
                  {a.Excerpt && <p className="hm-card__text">{a.Excerpt}</p>}
                </li>
              );
            })}
          </ul>
        )}
        <p className="hm-sec__more"><a className="hm-link" href="/blog">All posts <span aria-hidden="true">→</span></a></p>
      </div>
    </section>
  );
}
