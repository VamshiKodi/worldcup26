import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, useTexture } from '@react-three/drei';
import { SRGBColorSpace, type Group, type Texture } from 'three';
import type { MotionValue } from 'framer-motion';

const EMBLEM_URL = '/wc2026-emblem.png';
const ASPECT = 960 / 1482; // emblem PNG is portrait

interface Props {
  tiltX?: MotionValue<number>;
  tiltY?: MotionValue<number>;
}

/**
 * The official 2026 FIFA World Cup emblem as a floating 3D centerpiece: the logo art on a plane
 * that sways and tilts to the pointer (so the flat mark reads as a dimensional object), with a
 * tinted halo plane behind it for glow/depth. Replaces the generic trophy in the hero.
 */
export function Emblem3D({ tiltX, tiltY }: Props) {
  const group = useRef<Group>(null);
  const tex = useTexture(EMBLEM_URL) as Texture;
  const H = 3.4;
  const W = H * ASPECT;

  // Logo art must render in sRGB or the colours wash out.
  useEffect(() => {
    tex.colorSpace = SRGBColorSpace;
    tex.needsUpdate = true;
  }, [tex]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const tx = tiltY?.get() ?? 0;
    const ty = tiltX?.get() ?? 0;
    // Slow idle sway + pointer tilt — kept small so the emblem never turns edge-on (invisible).
    const idle = Math.sin(state.clock.elapsedTime * 0.5) * 0.12;
    g.rotation.y += (ty * 0.4 + idle - g.rotation.y) * Math.min(1, delta * 3);
    g.rotation.x += (tx * 0.2 - g.rotation.x) * Math.min(1, delta * 3);
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.5}>
      <group ref={group}>
        {/* Glow halo behind the mark */}
        <mesh position={[0, 0, -0.15]} scale={1.12}>
          <planeGeometry args={[W, H]} />
          <meshBasicMaterial map={tex} transparent opacity={0.4} color="#00E5FF" depthWrite={false} />
        </mesh>
        {/* The emblem */}
        <mesh>
          <planeGeometry args={[W, H]} />
          <meshBasicMaterial map={tex} transparent alphaTest={0.04} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

useTexture.preload(EMBLEM_URL);
