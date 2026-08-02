import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  type: 'card' | 'list' | 'profile';
  className?: string;
}

export function LoadingSkeleton({ type, className }: LoadingSkeletonProps) {
  if (type === 'card') {
    return (
      <div className={cn("rounded-2xl border border-border bg-card p-4 space-y-4 shadow-sm animate-pulse", className)}>
        <div className="h-40 bg-muted rounded-xl" />
        <div className="space-y-2">
          <div className="h-5 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={cn("space-y-3", className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 animate-pulse">
            <div className="h-12 w-12 bg-muted rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-4 animate-pulse", className)}>
      <div className="h-16 w-16 bg-muted rounded-full" />
      <div className="space-y-2">
        <div className="h-5 bg-muted rounded w-32" />
        <div className="h-4 bg-muted rounded w-24" />
      </div>
    </div>
  );
}
