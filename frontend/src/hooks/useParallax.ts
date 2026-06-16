import { useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Maps an element's scroll progress through the viewport to a vertical offset.
 * `speed` > 0 moves the element slower than scroll (background); the returned
 * MotionValue is a static 0 under reduced motion.
 */
export function useParallax(speed = 0.3): {
  ref: React.RefObject<HTMLDivElement>;
  y: MotionValue<number>;
} {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const distance = reduced ? 0 : speed * 200;
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return { ref, y };
}
