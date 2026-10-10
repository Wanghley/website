import React from 'react';
import { NEWS } from '../../data/news';
import './css/LatestNews.css';

const TYPE_DOT_CLASS = {
  talk: 'latest-news__dot--talk',
  publication: 'latest-news__dot--publication',
  press: 'latest-news__dot--press',
  milestone: 'latest-news__dot--milestone',
  award: 'latest-news__dot--award',
};

// Best-effort chronological sort — seed dates carry a "(confirm)" suffix
// and partial "XX" placeholders that Date can't parse, so entries that
// don't resolve fall back to their authored (already reverse-chronological)
// order via a stable sort.
const sortKey = (dateString) => {
  const direct = Date.parse(dateString);
  if (!Number.isNaN(direct)) return direct;
  const match = /^(\d{4})-(\d{2})/.exec(dateString);
  if (match) {
    const guess = Date.parse(`${match[1]}-${match[2]}-01`);
    if (!Number.isNaN(guess)) return guess;
  }
  return 0;
};

export default function LatestNews() {
  const items = [...NEWS].sort((a, b) => sortKey(b.date) - sortKey(a.date));

  if (items.length === 0) return null;

  return (
    <section id="news" className="latest-news" aria-labelledby="latest-news-heading">
      <div className="home-grid latest-news__head">
        <span className="channel-mark">
          <span className="channel-mark__id">CH:06</span>
          <span className="channel-mark__sep" />
          <span className="channel-mark__title">TRANSMISSIONS</span>
        </span>
        <h2 className="latest-news__heading" id="latest-news-heading">
          Recent signal.
        </h2>
        <p className="latest-news__subtitle">
          Talks, papers, and things that happened since the last update.
        </p>
      </div>

      <div className="home-grid latest-news__list-wrap">
        <ul className="latest-news__list">
          {items.map((item) => (
            <li className="latest-news__item" key={item.id}>
              <span className={`latest-news__dot ${TYPE_DOT_CLASS[item.type] || ''}`} aria-hidden="true" />
              <span className="latest-news__date">{item.date}</span>
              {item.url ? (
                <a className="latest-news__title latest-news__title--link" href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              ) : (
                <span className="latest-news__title">{item.title}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
