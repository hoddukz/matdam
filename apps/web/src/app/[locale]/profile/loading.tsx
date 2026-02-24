// Tag: core
// Path: apps/web/src/app/[locale]/profile/loading.tsx

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 animate-pulse">
      {/* Profile header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-6 w-40 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
      </div>
      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b pb-2">
        <div className="h-8 w-20 rounded bg-muted" />
        <div className="h-8 w-20 rounded bg-muted" />
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
