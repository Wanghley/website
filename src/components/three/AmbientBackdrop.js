import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import useCanRender3D from '../../hooks/useCanRender3D';
import './css/AmbientBackdrop.css';

// The R3F canvas + three.js payload never touches the main bundle — it's
// only fetched once the wrapper actually scrolls near the viewport AND the
// device clears useCanRender3D(). Reduced-motion / low-end visitors never
// download it at all.
const AmbientShader = lazy(() => import('./AmbientShader'));

export default function AmbientBackdrop({ intensity = 1, className = '' }) {
  const canRender3D = useCanRender3D();
  const wrapperRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          // Only need to know it's been seen once — AmbientShader's own
          // observer takes over pausing/resuming the render loop after that.
          io.disconnect();
        }
      },
      { rootMargin: '400px 0px' }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const showCanvas = canRender3D && inView;

  return (
    <div ref={wrapperRef} className={`ambient-backdrop ${className}`.trim()}>
      <div className="ambient-backdrop__fallback" aria-hidden="true" />
      {showCanvas && (
        <Suspense fallback={null}>
          <AmbientShader intensity={intensity} />
        </Suspense>
      )}
    </div>
  );
}
