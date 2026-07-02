import { useMemo, useEffect } from 'react';
import {
  CylinderGeometry,
  TorusGeometry,
  CircleGeometry,
  type BufferGeometry,
} from 'three';
import { COLORS } from './constants';

/**
 * Museum-display pedestal beneath the trophy.
 *
 * Layered for depth: a brushed-metal base, a black-glass slab (transmission + low
 * roughness so it catches reflections), a thin emissive cyan neon ring that feeds
 * Bloom, and a soft additive glow disc just under the trophy. Sits at the trophy's
 * feet (y ≈ -1.6) so the cup appears to stand on it.
 */
export function Pedestal() {
  // Memoize every geometry and dispose them together on unmount.
  const geos = useMemo(() => {
    const metalBase = new CylinderGeometry(1.9, 2.1, 0.22, 96);
    const glassSlab = new CylinderGeometry(1.7, 1.85, 0.34, 96);
    const ring = new TorusGeometry(1.74, 0.045, 24, 160);
    const glowDisc = new CircleGeometry(1.6, 96);
    return { metalBase, glassSlab, ring, glowDisc };
  }, []);

  useEffect(
    () => () => Object.values(geos).forEach((g: BufferGeometry) => g.dispose()),
    [geos],
  );

  const baseY = -1.62;

  return (
    <group position={[0, baseY, 0]}>
      {/* Brushed-metal foot */}
      <mesh geometry={geos.metalBase} position={[0, -0.18, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#15171c" metalness={0.95} roughness={0.32} envMapIntensity={1.1} />
      </mesh>

      {/* Black-glass slab the trophy stands on */}
      <mesh geometry={geos.glassSlab} position={[0, 0.04, 0]} receiveShadow>
        <meshPhysicalMaterial
          color="#05070a"
          metalness={0.2}
          roughness={0.08}
          transmission={0.55}
          thickness={1.2}
          ior={1.4}
          clearcoat={1}
          clearcoatRoughness={0.06}
          envMapIntensity={1.4}
          reflectivity={0.9}
        />
      </mesh>

      {/* Neon cyan ring — emissive, picked up by Bloom */}
      <mesh geometry={geos.ring} position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color={COLORS.cyan}
          emissive={COLORS.cyan}
          emissiveIntensity={4.5}
          toneMapped={false}
          metalness={0}
          roughness={0.4}
        />
      </mesh>

      {/* Soft glow disc just above the slab, under the trophy */}
      <mesh geometry={geos.glowDisc} position={[0, 0.235, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.12} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
