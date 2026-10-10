import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { STAGES } from '../../data/signalChain';
import ChainFigure from './chain/ChainFigure';
import './css/SignalChain.css';

// One signal, one story: a single waveform travels down the page and is
// transformed at each stage, the way my systems transform data near the
// sensor. Pinned scroll on desktop; a designed still per stage on phones and
// for reduced motion.
const STAGE_COUNT = STAGES.length;

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
  const sectionRef = useRef(null);
  const figureRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      setPinned(true);
      let trigger;
      // wait a frame so the pinned layout exists before ScrollTrigger measures
      const raf = requestAnimationFrame(() => {
        if (!sectionRef.current) return;
        trigger = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${STAGE_COUNT * 75}%`,
          pin: true,
          scrub: 0.5,
          onUpdate(self) {
            figureRef.current?.setProgress(self.progress);
            setIdx(Math.min(STAGE_COUNT - 1, Math.floor(self.progress * STAGE_COUNT)));
          },
        });
        figureRef.current?.setProgress(0);
      });
      return () => {
        cancelAnimationFrame(raf);
        trigger?.kill();
        setPinned(false);
        setIdx(0);
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} id="identity" className={`chain${pinned ? ' chain--pinned' : ''}`} aria-labelledby="chain-heading">
      <div className="chain__inner bench-col">
        <header className="chain__head">
          <p className="chain__kicker">From the electrode to the answer</p>
          <h2 id="chain-heading" className="chain__title">How a hand becomes a decision.</h2>
        </header>

        {pinned ? (
          <div className="chain__stage">
            <div className="chain__text">
              <ol className="chain__rail" aria-hidden="true">
                {STAGES.map((s, i) => (
                  <li key={s.id} className={i === idx ? 'is-active' : i < idx ? 'is-passed' : ''}>
                    {String(i + 1).padStart(2, '0')}
                  </li>
                ))}
              </ol>
              <div className="chain__blocks">
                {STAGES.map((s, i) => (
                  <article key={s.id} className={`chain__block${i === idx ? ' is-active' : ''}`} aria-hidden={i !== idx}>
                    <StageText stage={s} number={i + 1} />
                  </article>
                ))}
              </div>
            </div>
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
      </div>
    </section>
  );
}
