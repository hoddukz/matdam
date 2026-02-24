// Tag: core
// Path: apps/web/src/app/[locale]/recipe/[slug]/loading.tsx

export default function RecipeDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8 sm:px-6 animate-pulse">
      {/* Title */}
      <div className="h-9 w-3/4 rounded bg-muted mb-2" />
      <div className="h-5 w-full rounded bg-muted mb-4" />
      {/* Author row */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="flex gap-2 ml-auto">
          <div className="h-9 w-24 rounded-md bg-muted" />
          <div className="h-9 w-24 rounded-md bg-muted" />
        </div>
      </div>
      {/* Meta badges */}
      <div className="flex gap-4 mb-8">
        <div className="h-6 w-20 rounded-full bg-muted" />
        <div className="h-6 w-16 rounded bg-muted" />
        <div className="h-6 w-16 rounded bg-muted" />
      </div>
      {/* Hero image */}
      <div className="aspect-video w-full rounded-lg bg-muted mb-8" />
      {/* Taste profile */}
      <div className="rounded-lg border bg-muted/30 p-4 mb-8 h-28" />
      {/* Ingredients */}
      <div className="h-7 w-24 rounded bg-muted mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-5 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
      {/* Steps */}
      <div className="mt-8 h-7 w-28 rounded bg-muted mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6">
            <div className="h-5 w-16 rounded bg-muted mb-3" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
