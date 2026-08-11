'use client';

/**
 * B2B Chart Wrappers
 * ──────────────────
 * next/dynamic with { ssr: false } MUST live in a 'use client' file in Next.js 16+.
 * This wrapper is the correct place per pcs-tech-standards §10b.
 */
import dynamic from 'next/dynamic';

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      className="w-full animate-pulse rounded-xl bg-[var(--border)]"
      style={{ height }}
    />
  );
}

export const WeeklyPlasticChartDynamic = dynamic(
  () => import('@/components/b2b/WeeklyPlasticChart'),
  { ssr: false, loading: () => <ChartSkeleton height={220} /> },
);

export const PassRejectChartDynamic = dynamic(
  () => import('@/components/b2b/PassRejectChart'),
  { ssr: false, loading: () => <ChartSkeleton height={220} /> },
);
