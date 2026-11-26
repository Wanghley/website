import React from 'react';
import { SilkRule } from './SilkLabel';

// Top of an inner page. Put it in a `bp-sec bp-sec--head` band inside
// `bench-col`. `meta` is a short list of facts (counts, dates), shown in mono;
// `children` render after it (links, actions). size="md" for long titles such
// as a post or project name. `aside` sits beside the text on a wide screen and
// under it on a narrow one (an article's cover image).
export default function PageHeader({ refdes, title, lede, meta = [], size = 'lg', as: Title = 'h1', aside, children }) {
  const text = (
    <>
      <Title className="bp-head__title">{title}</Title>
      {lede && <p className="bp-head__lede">{lede}</p>}
      {meta.length > 0 && (
        <ul className="bp-head__meta">
          {meta.map((m) => <li key={m}>{m}</li>)}
        </ul>
      )}
      {children}
    </>
  );

  return (
    <header className={`bp-head${size === 'md' ? ' bp-head--md' : ''}`}>
      <SilkRule refdes={refdes} />
      {aside ? (
        <div className="bp-head__split">
          <div className="bp-head__main">{text}</div>
          <div className="bp-head__aside">{aside}</div>
        </div>
      ) : text}
    </header>
  );
}
