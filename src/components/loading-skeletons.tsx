function CardGridSkeleton() {
  return (
    <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="min-h-52 space-y-4 rounded-2xl border bg-card p-5">
          <div className="size-11 rounded-xl bg-muted" />
          <div className="h-5 w-2/3 rounded bg-muted" />
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-8 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function TuitionSkeleton({ sidebar = false }: { sidebar?: boolean }) {
  return (
    <div role="status" aria-label="Loading tuition listings" className="space-y-4 motion-safe:animate-pulse">
      {sidebar && <div className="h-9 w-24 rounded-full bg-muted" />}
      <div className="flex gap-5">
        {sidebar && <div className="hidden h-80 w-60 shrink-0 rounded-2xl border bg-muted md:block" />}
        <CardGridSkeleton />
      </div>
    </div>
  );
}

export function TuitionDetailSkeleton() {
  return (
    <div role="status" aria-label="Loading tuition details" className="space-y-4 motion-safe:animate-pulse">
      <div className="h-9 w-24 rounded-full bg-muted" />
      <div className="overflow-hidden rounded-3xl border bg-card">
        <div className="h-48 bg-muted sm:h-72" />
        <div className="space-y-6 p-5 sm:p-8">
          <div className="space-y-2">
            <div className="h-5 w-40 max-w-full rounded bg-muted" />
            <div className="h-9 w-4/5 rounded bg-muted sm:h-10" />
          </div>
          <div className="grid gap-4 rounded-xl bg-muted p-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="space-y-1">
              <div className="h-5 w-1/2 rounded bg-background/70" />
              <div className="h-5 w-3/4 rounded bg-background/70" />
            </div>)}
          </div>
          <div className="h-24 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function ContentSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="w-full space-y-4 motion-safe:animate-pulse">
      <div className="h-9 w-40 rounded-lg bg-muted" />
      <div className="space-y-4 rounded-2xl border bg-card p-5">
        <div className="h-6 w-1/3 rounded bg-muted" />
        <div className="h-12 rounded bg-muted" />
        <div className="h-12 rounded bg-muted" />
      </div>
    </div>
  );
}

export function TableSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="divide-y rounded-2xl border bg-card motion-safe:animate-pulse">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex min-h-14 items-center justify-between gap-3 p-4">
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-6 w-16 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid min-h-dvh flex-1 gap-4 bg-muted p-4 md:grid-cols-[14rem_1fr] md:p-8">
      <div className="hidden rounded-2xl border bg-card md:block" />
      <ContentSkeleton label="Loading dashboard" />
    </div>
  );
}
