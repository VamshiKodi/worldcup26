import { useState } from 'react';

interface Props {
  name: string;
  photoUrl?: string;
  size?: number;
  className?: string;
}

/** Initials from a player's name, e.g. "Lionel Messi" → "LM". */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Round player headshot. Falls back to initials when no image is available or it fails. */
export function PlayerAvatar({ name, photoUrl, size = 40, className = '' }: Props) {
  const [broken, setBroken] = useState(false);
  const dims = { width: size, height: size };

  if (!photoUrl || broken) {
    return (
      <span
        className={`grid shrink-0 place-items-center rounded-full bg-white/10 font-display font-semibold text-white/70 ring-1 ring-white/15 ${className}`}
        style={{ ...dims, fontSize: size * 0.36 }}
      >
        {initials(name)}
      </span>
    );
  }

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
