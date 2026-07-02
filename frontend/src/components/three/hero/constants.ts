import { Vector2 } from 'three';

/**
 * Shared palette + geometry data for the hero trophy scene.
 * Colours mirror the site theme (tailwind.config.js) so the 3D layer stays on-brand.
 */
export const COLORS = {
  bg: '#050505',
  cyan: '#00E5FF', // theme `primary`
  gold: '#FFB800', // theme `secondary`
  green: '#00FF88', // theme `accent`
  goldMetal: '#E9B949', // physical gold albedo for the trophy body
  goldDeep: '#8A5A1A', // shadowed gold for contrast in reflections
  white: '#ffffff',
} as const;

/**
 * Lathe profile (x = radius, y = height) for the procedural trophy.
 *
 * A FIFA-style cup reads as: two intertwined figures sweeping up from a round base
 * into an open bowl. We approximate that silhouette with a smooth revolved profile —
 * pinched waist, flared bowl, banded base — which, in polished gold under studio
 * light, reads unmistakably as a championship trophy without any external model.
 *
 * Points run bottom → top. `revalidate` keeps the curve dense for a clean highlight.
 */
const PROFILE: Array<[number, number]> = [
  [0.0, -1.55], // base centre (closes the bottom)
  [0.62, -1.55], // base outer edge
  [0.62, -1.42], // base rim
  [0.5, -1.4],
  [0.46, -1.28], // base step
  [0.5, -1.2],
  [0.5, -1.08], // plinth top
  [0.34, -1.0], // waist begins
  [0.22, -0.78],
  [0.16, -0.5], // narrow stem
  [0.15, -0.2],
  [0.18, 0.05],
  [0.26, 0.32], // body swells
  [0.4, 0.62],
  [0.56, 0.92],
  [0.72, 1.18], // bowl flares open
  [0.86, 1.38],
  [0.96, 1.52],
  [1.0, 1.62], // bowl lip outer
  [0.92, 1.62], // lip rolls inward
  [0.86, 1.5], // inner wall (hollow look)
];

export const TROPHY_PROFILE: Vector2[] = PROFILE.map(([x, y]) => new Vector2(x, y));

export const TROPHY_LATHE_SEGMENTS = 128;

/** Camera framing — cinematic 35mm-ish, slightly above centre, looking at the cup body. */
export const CAMERA = {
  position: [0, 0.4, 7.2] as [number, number, number],
  fov: 35,
  target: [0, -0.1, 0] as [number, number, number],
} as const;

/** Real trophy model (served from /public). Falls back to procedural geometry if it fails. */
export const MODEL_URL = '/models/trophy.glb';
/** Target on-screen height (world units) the loaded model is normalised to. */
export const TROPHY_TARGET_HEIGHT = 3.15;
/** World-Y the trophy's base is seated at (just into the pedestal top). */
export const TROPHY_BASE_Y = -1.5;

/** Auto-rotation speed in radians/sec (eased in/out by the hook). */
export const AUTO_ROTATE_SPEED = 0.5;
/** Delay before auto-rotation resumes after the user releases a drag (seconds). */
export const RESUME_DELAY = 0.9;
