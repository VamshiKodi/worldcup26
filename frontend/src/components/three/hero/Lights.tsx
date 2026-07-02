import { COLORS } from './constants';

/**
 * Studio lighting rig for the trophy.
 *
 * Three-point setup tuned for polished gold against a near-black scene:
 *  - low ambient so shadows stay rich
 *  - a warm key directional (casts the contact-ish shadow)
 *  - a cyan rim spot from behind to separate the cup from the dark background
 *  - a gold fill + cyan kicker as coloured point accents that catch the metal
 *
 * Lighting is physically scaled (R3F `physicallyCorrectLights` default in v8 via
 * watt-like intensities); the Environment supplies the bulk of the realistic
 * reflections, these lights add directional shape and the on-brand colour.
 */
export function Lights() {
  return (
    <>
      <ambientLight intensity={0.35} />

      {/* Key — warm, from upper front-right; the main shadow caster. */}
      <directionalLight
        position={[4, 7, 5]}
        intensity={2.4}
        color={COLORS.white}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-camera-near={1}
        shadow-camera-far={25}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />

      {/* Rim — cyan, from behind, hugs the silhouette. */}
      <spotLight
        position={[-3, 5, -6]}
        angle={0.5}
        penumbra={0.9}
        intensity={120}
        distance={30}
        color={COLORS.cyan}
      />

      {/* Gold fill — warms the shadow side. */}
      <pointLight position={[-5, 1, 3]} intensity={30} color={COLORS.gold} distance={28} />

      {/* Cyan kicker — sparkle on the bowl lip. */}
      <pointLight position={[5, 3, -2]} intensity={26} color={COLORS.cyan} distance={28} />
    </>
  );
}
