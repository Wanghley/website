import React, { useEffect, useState } from 'react';
import './css/ChannelRail.css';

const CHANNELS = [
  { id: '00', title: 'ORIGIN',        target: 'ch-00' },
  { id: '01', title: 'STORY',         target: 'ch-01' },
  { id: '02', title: 'IMPACT',        target: 'ch-02' },
  { id: '03', title: 'CAPABILITY',    target: 'ch-03' },
  { id: '04', title: 'ARCH',          target: 'ch-04' },
  { id: '05', title: 'FIELD REPORTS', target: 'ch-05' },
  { id: '06', title: 'FIELD NOTES',   target: 'ch-06' },
  { id: '07', title: 'TRANSMIT',      target: 'ch-07' },
];

const ChannelRail = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const viewportMid = window.innerHeight * 0.4;
      let bestIdx = 0;
      let bestDist = Infinity;

      CHANNELS.forEach((ch, idx) => {
        const el = document.getElementById(ch.target);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - viewportMid);
        if (rect.top <= viewportMid && dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      });

      setActiveIdx(bestIdx);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleClick = (target) => (e) => {
    e.preventDefault();
    const el = document.getElementById(target);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="channel-rail" aria-label="Section channels">
      <div className="channel-rail__inner">
        <span className="channel-rail__label">CHANNELS</span>
        <ol className="channel-rail__list">
          {CHANNELS.map((ch, idx) => (
            <li
              key={ch.id}
              className={`channel-rail__item${idx === activeIdx ? ' channel-rail__item--active' : ''}`}
            >
              <a
                href={`#${ch.target}`}
                onClick={handleClick(ch.target)}
                className="channel-rail__link"
              >
                <span className="channel-rail__id">CH:{ch.id}</span>
                <span className="channel-rail__title">{ch.title}</span>
                <span className="channel-rail__tick" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default ChannelRail;
