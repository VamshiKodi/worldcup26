import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './hero/Scene';
import { CAMERA } from './hero/constants';

/**
 * Lazy-loaded R3F canvas for the hero (default export so it stays code-split out of the
 * initial bundle: `lazy(() => import('./HeroCanvas'))`).
 *
 * Cinematic config: 35mm-ish FOV, `flat` so tone mapping is owned by the post-processing
 * ToneMapping pass (single grade), soft shadows on, DPR + effect quality scaled down on
 * small/touch devices to hold 60 FPS. The canvas captures pointer events for drag-to-rotate.
 */
export default function HeroCanvas() {
  // Decide quality once at mount. Any touch-capable device takes the low-power path:
  // it disables MSAA + N8AO (which flicker/"blink" on mobile GPUs) and drops the
  // drag-to-orbit controls so a finger swipe scrolls the page instead of rotating the
  // trophy. `pointer: coarse` alone misses some tablets/large phones and in-app
  // browsers, so we also check the touch-event APIs and viewport width.
  const lowPower = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const touch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-expect-error legacy IE/Edge pointer count
      navigator.msMaxTouchPoints > 0;
    return coarse || touch || window.innerWidth < 768;
  }, []);

  return (
    <Canvas
      flat
      shadows
      dpr={lowPower ? [1, 1.5] : [1, 2]}
      // No MSAA on touch/low-power: a multisampled default framebuffer fights the
      // EffectComposer's render targets on many mobile GPUs and makes the frame
      // flicker ("blinking"). The composer handles AA on desktop (multisampling).
      gl={{ alpha: true, antialias: !lowPower, powerPreference: 'high-performance' }}
      camera={{ position: CAMERA.position, fov: CAMERA.fov, near: 0.1, far: 100 }}
      // pan-y lets a vertical swipe scroll the page instead of being captured here.
      style={{ touchAction: 'pan-y' }}
    >
      <Scene lowPower={lowPower} />
    </Canvas>
  );
}
