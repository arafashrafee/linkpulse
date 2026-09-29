import { formatCount } from "@/lib/format";

type StatProps = {
  label: string;
  value: number;
};

export function Stat({ label, value }: StatProps) {
  return (
    <div className="stat-panel min-w-0">
      <p className="text-sm font-medium text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-[var(--foreground)]">
        {formatCount(value)}
      </p>
    </div>
  );
}

type BreakdownListProps = {
  title: string;
  items: Array<{ label: string; count: number }>;
  empty: string;
};

export function BreakdownList({ title, items, empty }: BreakdownListProps) {
  const max = items[0]?.count ?? 0;

  return (
    <section>
      <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => {
            const width = max > 0 ? Math.round((item.count / max) * 100) : 0;
            return (
              <li key={item.label}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate text-[var(--foreground)]">
                    {item.label}
                  </span>
                  <span className="shrink-0 tabular-nums text-[var(--muted)]">
                    {formatCount(item.count)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded bg-[var(--bg-subtle)]">
                  <div
                    className="h-full rounded bg-[var(--accent)]"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
