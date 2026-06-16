import { useEffect } from 'react';
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion';
import { useReducedMotion } from './useReducedMotion';

interface MouseFollow {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

/**
 * Pointer position as springy MotionValues in the range [-1, 1] (centre = 0),
 * for hero lights and card tilt. Frozen at centre under reduced motion.
 */
export function useMouseFollow(stiffness = 80, damping = 20): MouseFollow {
  const reduced = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness, damping });
  const y = useSpring(rawY, { stiffness, damping });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced, rawX, rawY]);

  return { x, y };
}
