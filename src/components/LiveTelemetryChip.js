import React, { useEffect, useState, useRef } from 'react';
import './css/LiveTelemetryChip.css';

const LiveTelemetryChip = () => {
  const [hr, setHr] = useState(82);
  const [clockStr, setClockStr] = useState('');
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    reducedMotionRef.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }, []);

  /* Heart-rate ticker — pseudo-random walk between 72–96 */
  useEffect(() => {
    if (reducedMotionRef.current) return;
    const id = setInterval(() => {
      setHr((prev) => {
        const delta = Math.round((Math.random() - 0.5) * 6);
        let next = prev + delta;
        if (next < 72) next = 72 + Math.floor(Math.random() * 4);
        if (next > 96) next = 96 - Math.floor(Math.random() * 4);
        return next;
      });
    }, 1400);
    return () => clearInterval(id);
  }, []);

  /* Clock — updates every 30s, formatted as HH:MM UTC */
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getUTCHours()).padStart(2, '0');
      const mm = String(now.getUTCMinutes()).padStart(2, '0');
      setClockStr(`${hh}:${mm} UTC`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="live-chip" aria-hidden="true">
      <div className="live-chip__inner">
        <span className="live-chip__seg live-chip__seg--loc">
          <span className="live-chip__dot live-chip__dot--green" />
          DURHAM, NC
        </span>
        <span className="live-chip__divider" />
        <span className="live-chip__seg live-chip__seg--time">{clockStr}</span>
        <span className="live-chip__divider" />
        <span className="live-chip__seg live-chip__seg--hr">
          <span className="live-chip__dot live-chip__dot--red" />
          <span className="live-chip__hr">{hr}</span>
          <span className="live-chip__hr-unit">BPM</span>
        </span>
      </div>
    </div>
  );
};

export default LiveTelemetryChip;
