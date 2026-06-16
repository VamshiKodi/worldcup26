import { type ReactNode } from 'react';

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-secondary">{eyebrow}</p>
        )}
        <h1 className="font-display text-4xl font-bold sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-white/50">{subtitle}</p>}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
