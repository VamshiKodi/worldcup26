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
  // Decide quality once at mount — coarse pointer or narrow viewport ⇒ low-power path.
  const lowPower = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    return coarse || window.innerWidth < 768;
  }, []);

  return (
    <Canvas
      flat
      shadows
      dpr={lowPower ? [1, 1.5] : [1, 2]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: CAMERA.position, fov: CAMERA.fov, near: 0.1, far: 100 }}
      style={{ touchAction: 'pan-y' }}
    >
      <Scene lowPower={lowPower} />
    </Canvas>
  );
}
