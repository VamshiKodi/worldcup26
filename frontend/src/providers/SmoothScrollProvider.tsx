import { type ReactNode } from 'react';

/**
 * Lenis smooth-scroll provider — Phase 1 pass-through.
 * Phase 5 wires Lenis + syncs it to GSAP ScrollTrigger (see docs/SCROLL_STRATEGY.md):
 *
 *   const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
 *   lenis.on('scroll', ScrollTrigger.update);
 *   gsap.ticker.add((t) => lenis.raf(t * 1000));
 *
 * Disabled automatically when prefers-reduced-motion is set.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
