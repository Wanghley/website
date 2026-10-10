import React, { useEffect, useRef, useState } from 'react';
import photoLibrary from '../../assets/wanghley/offduty/library-book.webp';
import photoGradWalk from '../../assets/wanghley/offduty/grad-candid-walk.webp';
import photoSigning from '../../assets/wanghley/offduty/signing-in.webp';
import photoGarden from '../../assets/wanghley/offduty/garden-portrait.webp';
import photoBench from '../../assets/wanghley/offduty/bench-call.webp';
import './css/OffDutyStrip.css';

// Exported for src/data/photos.js to reuse verbatim — these are the only
// photos in the repo with real, non-invented captions.
export const PHOTOS = [
  { src: photoGradWalk, tag: 'FIELD LOG · 001', caption: 'Diploma in hand, still not sure it’s real.' },
  { src: photoSigning, tag: 'FIELD LOG · 002', caption: 'Big hair day, signing something official-looking.' },
  { src: photoLibrary, tag: 'FIELD LOG · 003', caption: 'Off the clock still means reading something huge.' },
  { src: photoGarden, tag: 'FIELD LOG · 004', caption: 'Between meetings, found some actual sunlight.' },
  { src: photoBench, tag: 'FIELD LOG · 005', caption: 'Taking a call the way it was meant to be taken.' },
];

export default function OffDutyStrip() {
  const sectionRef = useRef(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setEntered(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="off-duty"
      className="off-duty"
      aria-labelledby="off-duty-heading"
    >
      <div className="off-duty__head">
        <span className="channel-mark channel-mark--green channel-mark--dark">
          <span className="channel-mark__id">EXTRA</span>
          <span className="channel-mark__sep" />
          <span className="channel-mark__title">OFF DUTY</span>
        </span>
        <h2 className="off-duty__heading" id="off-duty-heading">
          Same person, fewer datasheets.
        </h2>
        <p className="off-duty__subtitle">
          The engineer takes breaks too — a few unfiltered moments between
          builds, panels, and the occasional cape.
        </p>
      </div>

      <div className={`off-duty__rail${entered ? ' is-entered' : ''}`}>
        {PHOTOS.map((photo, i) => (
          <figure className="off-duty__card" key={photo.tag} style={{ transitionDelay: `${i * 70}ms` }}>
            <img
              className="off-duty__img"
              src={photo.src}
              alt={photo.caption}
              loading="lazy"
              decoding="async"
            />
            <div className="off-duty__overlay" aria-hidden="true" />
            <figcaption className="off-duty__caption">
              <span className="off-duty__caption-tag">{photo.tag}</span>
              <span className="off-duty__caption-text">{photo.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <span className="off-duty__hint">Swipe to explore →</span>
    </section>
  );
}
