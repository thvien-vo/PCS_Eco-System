'use client';

/** Skeleton grid for Module 6 — 6 shimmer card placeholders */
export function MarketplaceSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
        >
          {/* Image placeholder */}
          <div className="aspect-[16/9] shimmer" />
          {/* Body placeholders */}
          <div className="flex flex-col gap-2 p-3">
            <div className="h-3 w-16 rounded shimmer" />
            <div className="h-4 w-full rounded shimmer" />
            <div className="h-3 w-3/4 rounded shimmer" />
            <div className="h-3 w-1/2 rounded shimmer" />
            <div className="mt-1 flex items-center justify-between">
              <div className="h-5 w-12 rounded shimmer" />
              <div className="h-7 w-20 rounded-full shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
