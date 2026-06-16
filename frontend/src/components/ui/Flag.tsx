import { useState } from 'react';

interface Props {
  code: string;
  flagUrl?: string;
  size?: number;
  className?: string;
}

/** Round flag chip. Falls back to the 3-letter code when no image is available or it fails. */
export function Flag({ code, flagUrl, size = 28, className = '' }: Props) {
  const [broken, setBroken] = useState(false);
  const dims = { width: size, height: size };

  if (!flagUrl || broken) {
    return (
      <span
        className={`grid place-items-center rounded-full bg-white/10 text-[0.6rem] font-bold text-white/70 ${className}`}
        style={dims}
      >
        {code}
      </span>
    );
  }

  return (
    <img
      src={flagUrl}
      alt={code}
      loading="lazy"
      onError={() => setBroken(true)}
      className={`rounded-full object-cover ring-1 ring-white/15 ${className}`}
      style={dims}
    />
  );
}
