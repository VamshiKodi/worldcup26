import { type ReactNode } from 'react';

type Tone = 'default' | 'primary' | 'accent' | 'secondary' | 'live' | 'muted';

const tones: Record<Tone, string> = {
  default: 'bg-white/10 text-white/80',
  primary: 'bg-primary/15 text-primary',
  accent: 'bg-accent/15 text-accent',
  secondary: 'bg-secondary/15 text-secondary',
  live: 'bg-red-500/20 text-red-400',
  muted: 'bg-white/5 text-white/50',
};

export function Badge({
  children,
  tone = 'default',
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
