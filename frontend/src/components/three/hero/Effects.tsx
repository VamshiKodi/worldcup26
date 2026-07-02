import { EffectComposer, Bloom, N8AO, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

interface EffectsProps {
  /** Lower quality on small/touch devices: skip the costly AO pass, smaller bloom. */
  lowPower?: boolean;
}

const bloom = (intensity: number) => (
  <Bloom
    mipmapBlur
    intensity={intensity}
    luminanceThreshold={0.75}
    luminanceSmoothing={0.25}
    radius={0.7}
  />
);

const grade = (
  <>
    <Vignette eskil={false} offset={0.25} darkness={0.7} />
    <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
  </>
);

/**
 * Post-processing stack for the cinematic look. Order matters — grade last.
 *
 * - N8AO: contact ambient occlusion that grounds the trophy on the pedestal (desktop only).
 * - Bloom: blooms the emissive cyan ring + gold highlights (mipmap blur = soft, cheap).
 * - Vignette: gently darkens the frame edges to focus the eye on the cup.
 * - ToneMapping: ACES Filmic, applied here (Canvas is `flat`) so it grades the final frame once.
 *
 * Two variants avoid a nullable child (EffectComposer's children type rejects null).
 */
export function Effects({ lowPower = false }: EffectsProps) {
  if (lowPower) {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        {bloom(0.5)}
        {grade}
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={4} enableNormalPass>
      <N8AO aoRadius={1.2} intensity={2.2} distanceFalloff={1} quality="performance" />
      {bloom(0.85)}
      {grade}
    </EffectComposer>
  );
}
