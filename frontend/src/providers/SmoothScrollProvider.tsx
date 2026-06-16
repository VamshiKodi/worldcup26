import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

// Module singleton so route changes can reset scroll without prop-drilling the instance.
let lenisInstance: Lenis | null = null;

/** Jump to top. Uses Lenis when active, native scroll otherwise (reduced motion). */
export function scrollToTop(immediate = true) {
  if (lenisInstance) lenisInstance.scrollTo(0, { immediate });
  else window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
}

/**
 * One smooth-scroll loop (Lenis) synced to GSAP ScrollTrigger — see docs/SCROLL_STRATEGY.md.
 * Skipped entirely under prefers-reduced-motion, leaving native scroll in place.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenisInstance = lenis;

    // ScrollTrigger must read Lenis's virtual scroll, not the native scrollbar.
    lenis.on('scroll', ScrollTrigger.update);
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [reduced]);

  return <>{children}</>;
}
