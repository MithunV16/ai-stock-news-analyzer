export function DashboardSkeleton() {
  return (
    <div className="flex h-screen flex-col bg-canvas">
      <div className="h-12 shrink-0 border-b border-surface-border bg-surface" />
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-52 shrink-0 border-r border-surface-border bg-surface md:block" />
        <div className="min-h-0 flex-1 p-3">
          <div className="h-full animate-pulse rounded-lg border border-surface-border bg-surface-raised" />
        </div>
      </div>
    </div>
  );
}
