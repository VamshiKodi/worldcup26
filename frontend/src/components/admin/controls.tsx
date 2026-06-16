import { type ReactNode } from 'react';

export const inputCls =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-primary/60';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.65rem] uppercase tracking-wide text-white/40">{label}</span>
      {children}
    </label>
  );
}

/** Small destructive/secondary row action button. */
export function RowAction({
  children,
  onClick,
  tone = 'default',
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
        tone === 'danger'
          ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
          : 'bg-white/10 text-white/70 hover:bg-white/20'
      }`}
    >
      {children}
    </button>
  );
}
