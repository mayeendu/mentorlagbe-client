export function TuitionSkeleton() {
  return (
    <div aria-label="Loading tuition listings" role="status" className="animate-pulse motion-reduce:animate-none">
      <div className="mb-5 h-11 rounded-xl bg-[#eee8f8]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="grid gap-4 rounded-2xl border bg-card p-6">
            <div className="size-11 rounded-xl bg-muted" /><div className="h-5 w-2/3 rounded bg-muted" /><div className="h-12 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard" className="grid min-h-[55vh] animate-pulse gap-6 bg-muted p-6 motion-reduce:animate-none md:grid-cols-[14rem_1fr] md:p-8">
      <div className="hidden rounded-2xl border bg-card md:block" />
      <div className="space-y-5">
        <div className="h-14 rounded-2xl border bg-card" />
        <div className="h-56 rounded-2xl border bg-card" />
      </div>
    </div>
  );
}
