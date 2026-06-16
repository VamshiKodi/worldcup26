import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import type { Group } from 'three';
import type { MotionValue } from 'framer-motion';

/**
 * A stylised golden trophy built from primitives (no external GLTF to keep it offline + light).
 * Auto-rotates; nudged by the pointer via the optional tilt MotionValues.
 */
export function Trophy({ tiltX, tiltY }: { tiltX?: MotionValue<number>; tiltY?: MotionValue<number> }) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += delta * 0.4;
    const tx = tiltY?.get() ?? 0;
    const ty = tiltX?.get() ?? 0;
    // Ease toward pointer-driven tilt without fighting the spin.
    g.rotation.x += (tx * 0.25 - g.rotation.x) * 0.05;
    g.position.x += (ty * 0.3 - g.position.x) * 0.05;
  });

  const gold = { color: '#FFB800', metalness: 1, roughness: 0.22 } as const;

  return (
    <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.6}>
      <group ref={group} scale={1.15}>
        {/* Bowl */}
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.62, 48, 48, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
          <meshStandardMaterial {...gold} side={2} />
        </mesh>
        {/* Bowl rim */}
        <mesh position={[0, 0.55, 0]}>
          <torusGeometry args={[0.6, 0.05, 16, 48]} />
          <meshStandardMaterial {...gold} />
        </mesh>
        {/* Handles */}
        <mesh position={[-0.62, 0.5, 0]} rotation={[0, 0, Math.PI / 2.6]}>
          <torusGeometry args={[0.22, 0.04, 12, 32, Math.PI]} />
          <meshStandardMaterial {...gold} />
        </mesh>
        <mesh position={[0.62, 0.5, 0]} rotation={[0, 0, -Math.PI / 2.6]}>
          <torusGeometry args={[0.22, 0.04, 12, 32, Math.PI]} />
          <meshStandardMaterial {...gold} />
        </mesh>
        {/* Stem */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.12, 0.18, 0.5, 32]} />
          <meshStandardMaterial {...gold} />
        </mesh>
        {/* Base tiers */}
        <mesh position={[0, -0.26, 0]}>
          <cylinderGeometry args={[0.3, 0.34, 0.12, 32]} />
          <meshStandardMaterial {...gold} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.4, 0.44, 0.14, 32]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.5} />
        </mesh>
      </group>
    </Float>
  );
}
