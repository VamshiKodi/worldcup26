import { useEffect, useState } from 'react';

/**
 * True only on desktop-class devices (wide viewport + a real hover pointer). Heavy scroll
 * effects — Lenis smooth-scroll and GSAP pinning — trap touch scrolling on phones/tablets
 * (see SCROLL_STRATEGY.md), so we gate them behind this and let mobile use native scroll.
 *
 * Starts `false` so the safe path (native scroll) renders first, then upgrades after mount.
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isDesktop;
}
