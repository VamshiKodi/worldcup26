import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, type MotionStyle } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface Props {
  children: ReactNode;
  /**
   * Vertical travel in px as the element scrolls through the viewport. Larger = more movement =
   * reads as "closer/faster". Positive drifts up on scroll-down; negative drifts down.
   */
  speed?: number;
  className?: string;
  style?: MotionStyle;
}

/**
 * Scroll-driven parallax layer. Translates its content vertically as it passes through the
 * viewport to create depth. Composes with <Reveal> (they animate different wrappers). Static
 * under prefers-reduced-motion.
 */
export function Parallax({ children, speed = 60, className, style }: Props) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);

  return (
    <motion.div ref={ref} className={className} style={reduced ? style : { ...style, y }}>
      {children}
    </motion.div>
  );
}
