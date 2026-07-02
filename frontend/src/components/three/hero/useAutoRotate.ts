import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { AUTO_ROTATE_SPEED, RESUME_DELAY } from './constants';

export interface AutoRotateApi {
  /** Ref to attach to the rotating <group>. */
  ref: React.RefObject<Group>;
  /** Call when the user starts dragging (pauses auto-rotation). */
  onDragStart: () => void;
  /** Call when the user releases (schedules a smooth resume). */
  onDragEnd: () => void;
}

/**
 * Continuous, eased Y-axis auto-rotation that yields to the user.
 *
 * While idle the group spins at `AUTO_ROTATE_SPEED`, with the speed eased up from 0
 * on resume so motion never "snaps" on. Dragging zeroes the speed instantly; on
 * release we wait `RESUME_DELAY` then ease back in. All math is delta-based, so the
 * motion is identical at 30, 60 or 120 FPS and never accumulates drift.
 */
export function useAutoRotate(enabled = true): AutoRotateApi {
  const ref = useRef<Group>(null);
  const dragging = useRef(false);
  const resumeAt = useRef(0); // clock time at which easing-in may begin
  const speed = useRef(AUTO_ROTATE_SPEED); // current eased angular velocity
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g || !enabled) return;

    // Clamp delta so a tab-switch stall can't fling the trophy on the next frame.
    const dt = Math.min(delta, 1 / 20);
    elapsed.current += dt;

    const target =
      dragging.current || elapsed.current < resumeAt.current ? 0 : AUTO_ROTATE_SPEED;

    // Critically-damped approach to the target speed → smooth ease in/out.
    speed.current += (target - speed.current) * Math.min(1, dt * 3);
    g.rotation.y += speed.current * dt;
  });

  return {
    ref,
    onDragStart: () => {
      dragging.current = true;
      speed.current = 0;
    },
    onDragEnd: () => {
      dragging.current = false;
      resumeAt.current = elapsed.current + RESUME_DELAY;
    },
  };
}
