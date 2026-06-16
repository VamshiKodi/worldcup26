import { motion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

const OFFSET = 40;
const offsetFor = (d: Direction) => {
  switch (d) {
    case 'up':
      return { y: OFFSET };
    case 'down':
      return { y: -OFFSET };
    case 'left':
      return { x: OFFSET };
    case 'right':
      return { x: -OFFSET };
    default:
      return {};
  }
};

interface Props {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  /** Stagger children that are themselves <Reveal> or motion elements. */
  stagger?: boolean;
}

/**
 * Reveal-on-view wrapper. Slides + fades children into view once.
 * Under reduced motion it collapses to a near-instant opacity fade.
 */
export function Reveal({ children, direction = 'up', delay = 0, className, stagger }: Props) {
  const reduced = useReducedMotion();

  const variants: Variants = reduced
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.001 } },
      }
    : {
        hidden: { opacity: 0, ...offsetFor(direction) },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration: 0.6,
            delay,
            ease: [0.22, 1, 0.36, 1],
            ...(stagger ? { staggerChildren: 0.08 } : {}),
          },
        },
      };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </motion.div>
  );
}

/** A direct child of a `stagger` Reveal — inherits the parent's stagger timing. */
export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const variants: Variants = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      };
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
