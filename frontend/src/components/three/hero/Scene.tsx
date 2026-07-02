import { Suspense } from 'react';
import { OrbitControls, ContactShadows, Sparkles, Float } from '@react-three/drei';
import { Trophy } from './Trophy';
import { Pedestal } from './Pedestal';
import { Lights } from './Lights';
import { Environment } from './Environment';
import { Effects } from './Effects';
import { Loading } from './Loading';
import { useAutoRotate } from './useAutoRotate';
import { CAMERA, COLORS } from './constants';

interface SceneProps {
  /** Mobile / touch: lighter post-processing + fewer particles. */
  lowPower?: boolean;
}

/**
 * The full hero scene graph: studio environment + lights, the rotating trophy on its
 * pedestal, grounding contact shadow, ambient sparkles, and the post-processing stack.
 *
 * Rotation model: the trophy group spins continuously (useAutoRotate). Dragging orbits
 * the camera 360° around it — locked to a near-level polar band so it never flips — and
 * pauses the spin; releasing eases the spin back in. Zoom/pan are disabled so the page
 * keeps scrolling normally and there are no gesture conflicts.
 */
export function Scene({ lowPower = false }: SceneProps) {
  const auto = useAutoRotate();

  return (
    <>
      <Environment />
      <Lights />

      <Suspense fallback={<Loading />}>
        <Trophy groupRef={auto.ref} />
      </Suspense>

      <Pedestal />

      {/* Grounding shadow under the pedestal. */}
      <ContactShadows
        position={[0, -1.92, 0]}
        scale={9}
        far={6}
        blur={3}
        opacity={0.55}
        color="#000000"
        resolution={lowPower ? 512 : 1024}
      />

      {/* Ambient glowing squares drifting in depth — feeds Bloom, stays subtle. */}
      <Float speed={1} floatIntensity={0.6} rotationIntensity={0}>
        <Sparkles
          count={lowPower ? 40 : 90}
          scale={[12, 7, 6]}
          size={3}
          speed={0.3}
          opacity={0.5}
          color={COLORS.cyan}
        />
      </Float>

      <OrbitControls
        makeDefault
        target={CAMERA.target}
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        minPolarAngle={Math.PI / 2 - 0.32}
        maxPolarAngle={Math.PI / 2 + 0.18}
        onStart={auto.onDragStart}
        onEnd={auto.onDragEnd}
      />

      <Effects lowPower={lowPower} />
    </>
  );
}
