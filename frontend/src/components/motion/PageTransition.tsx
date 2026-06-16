import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/** Wraps a route's content with an enter/exit fade-slide for AnimatePresence. */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.001 }}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
