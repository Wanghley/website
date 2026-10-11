import React, { useEffect, useRef, useState } from 'react';
import { CONTACT } from '../../../data/home';
import useInView from '../../../hooks/useInView';
import rubrica from '../../../assets/handwriting/rubrica.png';

export default function ClosingContact() {
  const videoRef = useRef(null);
  const [signRef, signed] = useInView();
  const [reduced, setReduced] = useState(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = (e) => setReduced(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // play only while on screen
  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduced) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <section id="contact" className="sec sec--contact" aria-labelledby="contact-heading">
      <div className="bench-col contact">
        <div className="contact__text">
          <h2 id="contact-heading" className="sec__title">{CONTACT.heading}</h2>
          <p className="sec__lede">{CONTACT.open}</p>
          <p>
            <a className="btn btn--primary" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </p>
          <ul className="contact__links">
            {CONTACT.links.map((l) => (
              <li key={l.href}>
                <a className="chain__link" href={l.href} target="_blank" rel="noopener noreferrer">{l.text} <span aria-hidden="true">↗</span></a>
              </li>
            ))}
          </ul>
          <img ref={signRef} className={`contact__sign${signed ? ' is-in' : ''}`} src={rubrica} alt="" width="120" height="61" loading="lazy" />
        </div>
        <div className="contact__figure">
          {reduced ? (
            <img src="/hero/figure-wave.webp" width="640" height="640" alt="A figure of Wanghley waving" loading="lazy" />
          ) : (
            <video
              ref={videoRef}
              width="640"
              height="640"
              muted
              loop
              playsInline
              preload="metadata"
              poster="/hero/figure-wave.webp"
              aria-label="A figure of Wanghley waving"
            >
              <source src="/hero/figure-wave.webm" type="video/webm" />
              <source src="/hero/figure-wave.mp4" type="video/mp4" />
            </video>
          )}
        </div>
      </div>
    </section>
  );
}
