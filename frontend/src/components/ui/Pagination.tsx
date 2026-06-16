interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-4 text-sm">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-full border border-white/10 px-4 py-1.5 transition enabled:hover:border-primary/50 disabled:opacity-30"
      >
        ← Prev
      </button>
      <span className="text-white/60">
        Page <span className="text-white">{page}</span> of {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-full border border-white/10 px-4 py-1.5 transition enabled:hover:border-primary/50 disabled:opacity-30"
      >
        Next →
      </button>
    </div>
  );
}
