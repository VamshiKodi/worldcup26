import { useMemo, useEffect } from 'react';
import { LatheGeometry, type LatheGeometry as LatheGeometryType } from 'three';
import { COLORS, TROPHY_PROFILE, TROPHY_LATHE_SEGMENTS, TROPHY_BASE_Y } from './constants';

/**
 * Procedural FIFA-style trophy mesh — the fallback used if the GLB model fails to load.
 *
 * A single revolved profile (TROPHY_PROFILE) in polished PBR gold: metalness 1 + low
 * roughness + clearcoat so the studio Environment and rim lights yield believable gold
 * reflections. Geometry is memoized and disposed on unmount. No <Float>/spin here — the
 * parent <Trophy> owns those so model and fallback animate identically.
 */
export function ProceduralTrophy() {
  const geometry = useMemo<LatheGeometryType>(
    () => new LatheGeometry(TROPHY_PROFILE, TROPHY_LATHE_SEGMENTS),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} position={[0, TROPHY_BASE_Y + 1.55, 0]} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={COLORS.goldMetal}
        metalness={1}
        roughness={0.18}
        clearcoat={1}
        clearcoatRoughness={0.12}
        reflectivity={1}
        envMapIntensity={1.6}
        emissive={COLORS.goldDeep}
        emissiveIntensity={0.18}
      />
    </mesh>
  );
}
