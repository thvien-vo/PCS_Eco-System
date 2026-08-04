export function WalletSkeleton() {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      {/* Hero Card Skeleton */}
      <div className="shimmer h-40 w-full rounded-3xl" />

      {/* Activity Rings Skeleton */}
      <div className="flex items-center justify-between">
        <div className="shimmer h-8 w-32 rounded-lg" />
      </div>
      <div className="flex justify-center py-4">
        <div className="shimmer h-48 w-48 rounded-full" />
      </div>

      {/* Chart Skeleton */}
      <div className="shimmer h-48 w-full rounded-2xl" />

      {/* Inventory & History Skeletons */}
      <div className="space-y-4">
        <div className="shimmer h-8 w-40 rounded-lg" />
        <div className="flex gap-4 overflow-x-hidden">
          <div className="shimmer h-24 w-40 shrink-0 rounded-2xl" />
          <div className="shimmer h-24 w-40 shrink-0 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
