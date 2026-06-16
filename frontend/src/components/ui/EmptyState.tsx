import { type ReactNode } from 'react';

export function EmptyState({
  title,
  message,
  icon = '⚽',
  action,
}: {
  title: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="glass grid place-items-center gap-2 px-6 py-16 text-center">
      <div className="text-4xl opacity-60">{icon}</div>
      <h3 className="font-display text-xl">{title}</h3>
      {message && <p className="max-w-md text-sm text-white/50">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
