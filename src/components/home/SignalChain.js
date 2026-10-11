import React, { useEffect, useRef, useState } from 'react';
import { STORY, STAGES } from '../../data/signalChain';
import ChainFigure from './chain/ChainFigure';
import { useScrollToSection } from '../../lib/LenisRoot';
import './css/SignalChain.css';

// Who I am (values, not résumé), then one example of how I work.
//
// No pinning and no scroll-scrubbing: the page scrolls at its normal pace.
// On desktop the figure stays in view (position: sticky) while the steps
// scroll past it; when a step takes focus the waveform morphs once, over
// 900ms, whatever the scroll speed. Phones and tablets get a still per step.

function useMedia(query) {
  const [match, setMatch] = useState(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = (e) => setMatch(e.matches);
    mq.addEventListener('change', on);
    setMatch(mq.matches);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

function StageText({ stage, number }) {
  return (
    <>
      <p className="chain__stage-num">{String(number).padStart(2, '0')} · {stage.label}</p>
      <h3 className="chain__stage-heading">{stage.heading}</h3>
      <p className="chain__stage-body">{stage.body}</p>
      <a className="chain__link" href={stage.link.href}>
        {stage.link.text} <span aria-hidden="true">→</span>
      </a>
      {stage.note && <p className="chain__note">{stage.note}</p>}
    </>
  );
}

export default function SignalChain() {
  const figureRef = useRef(null);
  const stepRefs = useRef([]);
  const [active, setActive] = useState(0);
  const wide = useMedia('(min-width: 1024px)');
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const scrollToSection = useScrollToSection();

  // The step crossing the middle of the viewport owns the figure.
  useEffect(() => {
    if (!wide) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.dataset.index));
        });
      },
      { rootMargin: '-42% 0px -42% 0px', threshold: 0 }
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [wide]);

  useEffect(() => {
    figureRef.current?.goTo(active, reduced ? 0 : undefined);
  }, [active, reduced]);

  return (
    <section id="identity" className="chain" aria-labelledby="chain-heading">
      <div className="chain__inner bench-col">
        <div className="chain__lead">
          <div>
            <p className="chain__kicker">{STORY.kicker}</p>
            <h2 id="chain-heading" className="chain__title">{STORY.heading}</h2>
          </div>
          <div className="chain__story">
            <p className="chain__lede">{STORY.lede}</p>
            <ul className="chain__values">
              {STORY.values.map((v) => (
                <li key={v.name}>
                  <strong>{v.name}</strong>
                  <span>{v.text}</span>
                </li>
              ))}
            </ul>
            <p className="chain__links">
              {STORY.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className={l.primary ? 'btn btn--primary' : 'chain__link'}
                  {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {l.text}{' '}
                  <span aria-hidden="true">{l.external ? '↗' : '→'}</span>
                </a>
              ))}
            </p>
          </div>
        </div>

        <p className="chain__figure-kicker">{STORY.figureKicker}</p>

        {wide ? (
          <div className="chain__scroll">
            <ol className="chain__steps">
              {STAGES.map((s, i) => (
                <li
                  key={s.id}
                  ref={(el) => { stepRefs.current[i] = el; }}
                  data-index={i}
                  className={`chain__step${i === active ? ' is-active' : ''}`}
                >
                  <StageText stage={s} number={i + 1} />
                </li>
              ))}
            </ol>
            <div className="chain__figure">
              <ChainFigure ref={figureRef} />
            </div>
          </div>
        ) : (
          <ol className="chain__list">
            {STAGES.map((s, i) => (
              <li key={s.id} className="chain__card">
                <ChainFigure stage={i} title={`${s.label}: ${s.heading}`} />
                <div className="chain__card-text">
                  <StageText stage={s} number={i + 1} />
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="chain__closing">
          <p>{STORY.closing}</p>
          <button type="button" className="btn btn--ghost" onClick={() => scrollToSection('#work')}>
            See the projects <span aria-hidden="true">↓</span>
          </button>
        </div>
      </div>
    </section>
  );
}
