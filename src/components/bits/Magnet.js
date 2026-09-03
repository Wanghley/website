import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Magnetic hover wrapper — the CTA button gently pulls toward the pointer
 * within `strength` px, then springs back on leave. Ported from the inline
 * useMotionValue/useSpring pair in the legacy Hero.js so every CTA on the
 * new homepage shares one implementation.
 *
 * Renders a `motion.div` by default. The spring is applied via a MotionValue
 * `style={{ x, y }}`, which only animates on actual framer-motion components
 * — pass `as={motion.button}` / `as={motion.a}` when wrapping those elements.
 */
export default function Magnet({
  children,
  strength = 0.35,
  range = 8,
  disabled = false,
  className,
  as: Component = motion.div,
  ...rest
}) {
  const ref = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 280, damping: 26 });
  const y = useSpring(rawY, { stiffness: 280, damping: 26 });

  const handlePointerMove = (e) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rawX.set(Math.max(-range, Math.min(range, (e.clientX - cx) * strength)));
    rawY.set(Math.max(-range, Math.min(range, (e.clientY - cy) * strength)));
  };

  const handlePointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <Component
      ref={ref}
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={disabled ? undefined : { x, y }}
      {...rest}
    >
      {children}
    </Component>
  );
}
