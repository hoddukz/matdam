// Tag: core
// Path: apps/web/src/app/[locale]/explore/loading.tsx

export default function ExploreLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 animate-pulse">
      {/* Title */}
      <div className="mb-8">
        <div className="h-8 w-32 rounded bg-muted" />
        <div className="mt-2 h-4 w-64 rounded bg-muted" />
      </div>
      {/* Search bar */}
      <div className="mb-6 h-10 w-full rounded-md bg-muted" />
      {/* Filter badges */}
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-muted" />
        ))}
      </div>
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
