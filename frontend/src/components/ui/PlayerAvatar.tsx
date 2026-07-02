import { useState } from 'react';

interface Props {
  name: string;
  photoUrl?: string;
  size?: number;
  className?: string;
}

/** Initials from a player's name, e.g. "Lionel Messi" → "LM". */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Deterministic hue (0–359) from a name, so each player keeps a stable colour. */
function hueFromName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

/**
 * Round player headshot. Shows a real photo when `photoUrl` is set; otherwise renders a
 * colourful generated avatar (deterministic gradient + initials) so every player displays a
 * distinct image instead of a flat placeholder.
 *
 * Real headshots: the football-data.org free tier doesn't provide them, so set `photoUrl`
 * per player in the Admin panel (or via a data source that supplies headshots) and it renders
 * automatically here.
 */
export function PlayerAvatar({ name, photoUrl, size = 40, className = '' }: Props) {
  const [broken, setBroken] = useState(false);
  const dims = { width: size, height: size };

  if (photoUrl && !broken) {
    return (
      <img
        src={photoUrl}
        alt={name}
        loading="lazy"
        onError={() => setBroken(true)}
        className={`shrink-0 rounded-full bg-white/5 object-cover ring-1 ring-white/15 ${className}`}
        style={dims}
      />
    );
  }

  const hue = hueFromName(name);
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-display font-semibold text-white ring-1 ring-white/15 ${className}`}
      style={{
        ...dims,
        fontSize: size * 0.36,
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 72% 46%), hsl(${(hue + 40) % 360} 72% 30%))`,
      }}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}
