import React, { useCallback, useRef } from 'react';

/**
 * Wraps any glass tile with a pointer-tracked radial highlight — the classic
 * "spotlight card" effect, implemented with a CSS custom property updated
 * imperatively (no re-render per mousemove) so it stays cheap across a grid
 * of many tiles (Venture Showcase, Tech Matrix).
 *
 * Consumers style the highlight themselves via `.spotlight-card::before`
 * (see global.css) reading `--spot-x` / `--spot-y`; this component only
 * tracks the pointer and toggles `--spot-o` (opacity) on enter/leave.
 */
export default function SpotlightCard({
  children,
  className,
  as: Component = 'div',
  color,
  ...rest
}) {
  const ref = useRef(null);

  const handlePointerMove = useCallback((e) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    node.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  }, []);

  const handlePointerEnter = useCallback(() => {
    ref.current?.style.setProperty('--spot-o', '1');
  }, []);

  const handlePointerLeave = useCallback(() => {
    ref.current?.style.setProperty('--spot-o', '0');
  }, []);

  return (
    <Component
      ref={ref}
      className={`spotlight-card ${className ?? ''}`.trim()}
      style={color ? { '--spot-color': color } : undefined}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      {...rest}
    >
      {children}
    </Component>
  );
}
