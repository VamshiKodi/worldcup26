interface Props<T extends string> {
  options: readonly T[];
  value: T | null;
  onChange: (value: T | null) => void;
  allLabel?: string;
  labels?: Record<string, string>;
}

/** Pill row of mutually-exclusive filters with an "All" reset. */
export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  allLabel = 'All',
  labels,
}: Props<T>) {
  const base = 'rounded-full px-4 py-1.5 text-sm font-medium transition';
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`${base} ${value === null ? 'bg-primary text-bg' : 'glass text-white/70 hover:text-white'}`}
      >
        {allLabel}
      </button>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`${base} ${value === opt ? 'bg-primary text-bg' : 'glass text-white/70 hover:text-white'}`}
        >
          {labels?.[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}
