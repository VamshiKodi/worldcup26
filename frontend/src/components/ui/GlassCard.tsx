import { type HTMLAttributes } from 'react';

/** Frosted-glass surface used across cards and panels. */
export function GlassCard({
  className = '',
  hover = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={`glass p-5 ${
        hover ? 'transition hover:border-primary/40 hover:shadow-glow' : ''
      } ${className}`}
      {...props}
    />
  );
}
