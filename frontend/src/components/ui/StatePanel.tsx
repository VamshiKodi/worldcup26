import { type ReactNode } from 'react';
import { EmptyState } from './EmptyState';

/**
 * Renders the right thing for an async resource: a skeleton while loading,
 * an error panel on failure, an empty state when there's no data, else children.
 */
export function StatePanel({
  loading,
  error,
  isEmpty,
  onRetry,
  skeleton,
  emptyTitle = 'Nothing here yet',
  emptyMessage,
  children,
}: {
  loading: boolean;
  error: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  skeleton?: ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  children: ReactNode;
}) {
  if (loading) {
    return <>{skeleton ?? <div className="glass h-48 animate-pulse" />}</>;
  }
  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Couldn't load this"
        message={error}
        action={
          onRetry && (
            <button onClick={onRetry} className="text-sm text-primary hover:underline">
              Try again
            </button>
          )
        }
      />
    );
  }
  if (isEmpty) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }
  return <>{children}</>;
}
