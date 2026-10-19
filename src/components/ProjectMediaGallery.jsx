import { useState, useEffect, useCallback, useRef } from "react";
import "./css/ProjectMediaGallery.css";
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

// A grid of buttons, each opening a lightbox. The lightbox is a real dialog:
// focus moves into it, Escape closes it, and focus goes back to the thumbnail
// that opened it.
function MediaGallery({ media }) {
  const [active, setActive] = useState(null); // index of the open image, or null
  const opener = useRef(null);
  const closeRef = useRef(null);
  const initial = typeof window !== 'undefined' && window.innerWidth < 768 ? 6 : 8;
  const [visible, setVisible] = useState(Math.min(initial, media.length));

  const close = useCallback(() => {
    setActive(null);
    opener.current?.focus();
  }, []);
  const step = useCallback((dir) => {
    setActive((i) => (i + dir + media.length) % media.length);
  }, [media.length]);

  useEffect(() => {
    if (active === null) return undefined;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [active, close, step]);

  if (!media || media.length === 0) return null;

  return (
    <div className="gallery">
      <ul className="gallery__grid">
        {media.slice(0, visible).map((url, index) => (
          <li key={url + index}>
            <button
              type="button"
              className="gallery__thumb"
              aria-label={`Open image ${index + 1} of ${media.length}`}
              onClick={(e) => { opener.current = e.currentTarget; setActive(index); }}
            >
              <img src={url} alt="" loading="lazy" />
            </button>
          </li>
        ))}
      </ul>

      {visible < media.length && (
        <button type="button" className="btn btn--ghost gallery__more" onClick={() => setVisible((v) => Math.min(v + 8, media.length))}>
          Show {Math.min(8, media.length - visible)} more of {media.length - visible} remaining
        </button>
      )}

      {active !== null && (
        <div className="gallery__overlay" role="dialog" aria-modal="true" aria-label={`Image ${active + 1} of ${media.length}`} onClick={close}>
          <div className="gallery__frame" onClick={(e) => e.stopPropagation()}>
            <img src={media[active]} alt={`Project media ${active + 1} of ${media.length}`} />
            <button type="button" ref={closeRef} className="gallery__btn gallery__btn--close" aria-label="Close" onClick={close}>
              <FaTimes aria-hidden="true" />
            </button>
            {media.length > 1 && (
              <>
                <button type="button" className="gallery__btn gallery__btn--prev" aria-label="Previous image" onClick={() => step(-1)}>
                  <FaChevronLeft aria-hidden="true" />
                </button>
                <button type="button" className="gallery__btn gallery__btn--next" aria-label="Next image" onClick={() => step(1)}>
                  <FaChevronRight aria-hidden="true" />
                </button>
                <p className="gallery__count" aria-hidden="true">{active + 1} / {media.length}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaGallery;
