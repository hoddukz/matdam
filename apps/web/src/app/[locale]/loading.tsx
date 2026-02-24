// Tag: core
// Path: apps/web/src/app/[locale]/loading.tsx

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="mb-12 rounded-2xl bg-muted h-[340px]" />
      {/* Section title */}
      <div className="mb-6 h-7 w-40 rounded bg-muted" />
      {/* Card grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border">
            <div className="aspect-video bg-muted" />
            <div className="p-4 space-y-2">
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
