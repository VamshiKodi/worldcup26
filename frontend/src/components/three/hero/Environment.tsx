import { Environment as DreiEnvironment, Lightformer } from '@react-three/drei';
import { COLORS } from './constants';

/**
 * Image-based lighting for realistic gold reflections.
 *
 * Rather than fetch a multi-MB .hdr file, we build the environment locally from
 * Lightformers rendered to an off-screen cubemap (`resolution`). This is what
 * actually makes the gold look like metal: the bright bars and on-brand cyan/gold
 * panels are what you see mirrored in the polished surface as the trophy turns.
 * Zero network cost, fully themed, and disposed with the scene.
 */
export function Environment() {
  return (
    <DreiEnvironment resolution={256} frames={1}>
      {/* Dark studio backdrop so the metal reads against near-black. */}
      <color attach="background" args={[COLORS.bg]} />

      {/* Big soft key panel — the broad highlight that sweeps the bowl. */}
      <Lightformer
        form="rect"
        intensity={3.2}
        position={[0, 4, 2]}
        scale={[8, 5, 1]}
        rotation={[-Math.PI / 2, 0, 0]}
        color={COLORS.white}
      />

      {/* Vertical strip highlights — give the lathe a crisp specular seam. */}
      <Lightformer form="rect" intensity={2.2} position={[-4, 1, 1]} scale={[1, 6, 1]} color={COLORS.white} />
      <Lightformer form="rect" intensity={1.6} position={[4, 1, 2]} scale={[1, 6, 1]} color={COLORS.white} />

      {/* On-brand coloured fills, mirrored in the gold. */}
      <Lightformer form="ring" intensity={2.4} position={[-3, 2, -4]} scale={3} color={COLORS.cyan} />
      <Lightformer form="circle" intensity={1.8} position={[3, -1, -3]} scale={3} color={COLORS.gold} />
    </DreiEnvironment>
  );
}
