import { Component, type ReactNode } from 'react';
import { Float } from '@react-three/drei';
import type { Group } from 'three';
import { TrophyModel } from './TrophyModel';
import { ProceduralTrophy } from './ProceduralTrophy';

interface TrophyProps {
  /** Group ref from useAutoRotate — drives the continuous Y spin. */
  groupRef: React.RefObject<Group>;
}

/** Renders the procedural gold trophy if the GLB model errors out. */
class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    // Non-fatal: log once and show the procedural trophy instead of a blank scene.
    console.warn('[Hero] trophy model failed to load — using procedural fallback.', error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * The hero centerpiece: the real GLB trophy (normalised in TrophyModel), wrapped in the
 * continuous-spin group and a gentle <Float> hover so it feels "alive". Loading is handled
 * by Scene's <Suspense> (themed spinner); a load error degrades gracefully to the
 * procedural gold trophy. Both paths share this group, so spin/float are identical.
 */
export function Trophy({ groupRef }: TrophyProps) {
  return (
    <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.35} floatingRange={[-0.04, 0.06]}>
      <group ref={groupRef} position={[0, 0.05, 0]}>
        <ModelBoundary fallback={<ProceduralTrophy />}>
          <TrophyModel />
        </ModelBoundary>
      </group>
    </Float>
  );
}
