import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { STAGES, IMPACT_STATS, CREDENTIALS } from '../../data/signalChain';
import SignalChainDiagram from './SignalChainDiagram';
import CountUp from '../bits/CountUp';
import './css/SignalChain.css';

const formatStat = (val, stat) => `${stat.prefix}${Math.round(val).toLocaleString()}${stat.suffix}`;

export default function SignalChain() {
  const sectionRef = useRef(null);
  const diagramRef = useRef(null);
  const tickerTrackRef = useRef(null);
  const tickerGroupRef = useRef(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [pinned, setPinned] = useState(true);

  // The track's real loop point is one copy's width plus the gap that
  // follows it, not a flat 50% — 50% only matches when every item happens
  // to be the same width, which credential names/subs never are. Measured
  // directly (and re-measured on resize) instead of hardcoded so the fix
  // holds regardless of how many CREDENTIALS entries exist.
  useEffect(() => {
    const track = tickerTrackRef.current;
    const group = tickerGroupRef.current;
    if (!track || !group) return undefined;

    const measure = () => {
      const groupWidth = group.getBoundingClientRect().width;
      const gapPx = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0');
      track.style.setProperty('--group-shift', `${groupWidth + gapPx}px`);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(group);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Single pinned/scrubbed ScrollTrigger drives both the narrative
  // cross-fade (stageIndex, React state — changes only 5 times across the
  // whole scroll, cheap) and the diagram's line-draw (via the imperative
  // ref API, no re-render per frame). gsap.matchMedia() re-arms/disarms
  // automatically on resize across the 1024px breakpoint — pass-1's
  // IdentityFocus checked window.innerWidth once at mount and never did.
  useEffect(() => {
    if (reduced) return undefined;

    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      setPinned(true);
      const section = sectionRef.current;
      if (!section) return undefined;

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=260%',
        pin: true,
        scrub: 0.8,
        onUpdate(self) {
          const scaled = self.progress * STAGES.length;
          const idx = Math.min(STAGES.length - 1, Math.floor(scaled));
          setStageIndex(idx);
          diagramRef.current?.setProgress(scaled);
        },
      });

      return () => trigger.kill();
    });

    mm.add('(max-width: 1023px)', () => {
      setPinned(false);
      setStageIndex(-1); // -1 = "show all stages", the mobile stacked list
      return undefined;
    });

    return () => mm.revert();
  }, [reduced]);

  const showAll = !pinned || reduced || stageIndex === -1;

  return (
    <section ref={sectionRef} id="identity" className="signal-chain" aria-labelledby="signal-chain-heading">
      <div className="home-grid signal-chain__grid">
        <div className="signal-chain__index" aria-hidden={!pinned}>
          {STAGES.map((stage, i) => (
            <span
              key={stage.id}
              className={`signal-chain__index-tick${i === stageIndex ? ' is-active' : ''}${i < stageIndex ? ' is-passed' : ''}`}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
          ))}
        </div>

        <div className="signal-chain__narrative">
          <span className="channel-mark">
            <span className="channel-mark__id">CH:01</span>
            <span className="channel-mark__sep" />
            <span className="channel-mark__title">SYSTEM PROFILE</span>
          </span>
          <h2 className="signal-chain__intro-heading" id="signal-chain-heading">
            Where physical limits meet <em>digital intelligence.</em>
          </h2>

          {showAll ? (
            <div className="signal-chain__stack">
              {STAGES.map((stage, i) => (
                <article key={stage.id} className="signal-chain__stage-block">
                  <span className="telemetry">
                    {stage.channel} · {String(i + 1).padStart(2, '0')}/05
                  </span>
                  <h3>{stage.heading}</h3>
                  <p>{stage.body}</p>
                  {stage.id === 'impact' && <ImpactPayload run reduced={reduced} />}
                </article>
              ))}
            </div>
          ) : (
            <div className="signal-chain__stage-viewport">
              {STAGES.map((stage, i) => (
                <article
                  key={stage.id}
                  className={`signal-chain__stage-block${i === stageIndex ? ' is-visible' : ''}`}
                  aria-hidden={i !== stageIndex}
                >
                  <span className="telemetry">
                    {stage.channel} · {String(i + 1).padStart(2, '0')}/05
                  </span>
                  <h3>{stage.heading}</h3>
                  <p>{stage.body}</p>
                  {stage.id === 'impact' && (
                    <ImpactPayload run={stageIndex === 4} reduced={reduced} />
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="signal-chain__diagram-wrap">
          <SignalChainDiagram ref={diagramRef} staticFull={showAll} />
        </div>
      </div>

      <div className="signal-chain__creds section-blend-from-dark">
        <div className="signal-chain__creds-head">
          <span className="telemetry telemetry--dark">CREDENTIALS · LIVE FEED</span>
          <span className="signal-chain__creds-meta">{CREDENTIALS.length} ENTRIES</span>
        </div>
        <div className="ticker ticker--light">
          <div className="ticker__track" ref={tickerTrackRef}>
            <div className="ticker__group" ref={tickerGroupRef}>
              {CREDENTIALS.map((c) => (
                <span className="ticker__item" key={c.name}>
                  <strong>{c.name}</strong>&nbsp;/&nbsp;{c.sub}
                  <span className="ticker__sep">·</span>
                </span>
              ))}
            </div>
            <div className="ticker__group" aria-hidden="true">
              {CREDENTIALS.map((c) => (
                <span className="ticker__item" key={`${c.name}-dup`}>
                  <strong>{c.name}</strong>&nbsp;/&nbsp;{c.sub}
                  <span className="ticker__sep">·</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImpactPayload({ run, reduced }) {
  return (
    <div className="signal-chain__impact">
      {IMPACT_STATS.map((stat) => (
        <div key={stat.label} className="signal-chain__impact-stat">
          <CountUp
            className="signal-chain__impact-value"
            target={stat.target}
            format={(v) => formatStat(v, stat)}
            finalText={stat.value}
            run={run}
            reduced={reduced}
          />
          <span className="signal-chain__impact-label">{stat.label}</span>
          <span className="signal-chain__impact-source">{stat.source}</span>
        </div>
      ))}
    </div>
  );
}
