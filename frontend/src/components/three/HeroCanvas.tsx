import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import { Emblem3D } from './Emblem3D';
import { Particles } from './Particles';

interface Props {
  tiltX?: MotionValue<number>;
  tiltY?: MotionValue<number>;
}

/**
 * Lazy-loaded R3F scene for the hero. Default export so it can be code-split
 * (`lazy(() => import('./HeroCanvas'))`) and kept out of the initial bundle.
 */
export default function HeroCanvas({ tiltX, tiltY }: Props) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.3, 4.2], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 4, 4]} intensity={60} color="#00E5FF" />
      <pointLight position={[-4, -2, 2]} intensity={40} color="#FFB800" />
      <spotLight position={[0, 6, 3]} angle={0.4} penumbra={0.8} intensity={50} color="#ffffff" />
      <Suspense fallback={null}>
        <Emblem3D tiltX={tiltX} tiltY={tiltY} />
      </Suspense>
      <Particles />
    </Canvas>
  );
}
