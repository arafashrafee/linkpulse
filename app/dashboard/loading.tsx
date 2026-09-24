export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 rounded bg-[var(--bg-subtle)]" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-14 rounded bg-[var(--bg-subtle)]" />
        <div className="h-14 rounded bg-[var(--bg-subtle)]" />
        <div className="h-14 rounded bg-[var(--bg-subtle)]" />
      </div>
      <div className="h-48 rounded bg-[var(--bg-subtle)]" />
    </div>
  );
}
