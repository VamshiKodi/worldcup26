import { Html, useProgress } from '@react-three/drei';

/**
 * Suspense fallback rendered inside the Canvas while geometry/environment compile.
 * Themed cyan ring spinner with live load percentage; centered on the trophy.
 */
export function Loading() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-white/70">
        <span className="block h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-primary" />
        <span className="text-xs uppercase tracking-[0.3em]">{Math.round(progress)}%</span>
      </div>
    </Html>
  );
}
