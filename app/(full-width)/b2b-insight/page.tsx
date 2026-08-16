'use client';

import Link from 'next/link';
import { Database, BarChart2, Activity, ChevronLeft, ArrowRight } from 'lucide-react';
import { MOCK_WEEKLY_PLASTIC, MOCK_PASS_REJECT, MOCK_STATION_ACTIVITY } from '@/lib/mock-data';
// Chart wrappers live in a 'use client' file — required by Next.js 16+ Turbopack
// (ssr:false is not allowed directly in Server Components per pcs-tech-standards §10b).
import {
  WeeklyPlasticChartDynamic as WeeklyPlasticChart,
  PassRejectChartDynamic as PassRejectChart,
} from '@/components/b2b/ChartWrappers';
import { useTranslation } from '@/hooks/use-translation';
import { useHasMounted } from '@/hooks/use-has-mounted';

// ─── Metric summary chips ──────────────────────────────────────────────────────
const TOTAL_SCANS = MOCK_PASS_REJECT.reduce((acc, d) => acc + d.pass + d.reject, 0);
const TOTAL_PASS = MOCK_PASS_REJECT.reduce((acc, d) => acc + d.pass, 0);
const TOTAL_KG = MOCK_WEEKLY_PLASTIC.reduce((acc, d) => acc + d.kgSorted, 0);
const PASS_RATE = Math.round((TOTAL_PASS / TOTAL_SCANS) * 100);
const MAX_SCANS = Math.max(...MOCK_STATION_ACTIVITY.map((s) => s.scansThisWeek));

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function B2BInsightPage() {
  const { t } = useTranslation();
  const hasMounted = useHasMounted();
  const tb = t.b2b;

  // Prevent hydration mismatch
  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-[#0d1b2e]">
        <div className="h-16 border-b border-[#263a52] bg-[#0d1b2e]/95" />
        <div className="mx-auto max-w-6xl px-6 pt-10 space-y-6">
          <div className="h-64 rounded-2xl bg-[#0f2540] animate-pulse" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-[#0f2540] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const KPI_CHIPS = [
    { label: tb.kpi.totalScans.label, value: TOTAL_SCANS.toLocaleString('vi-VN'), unit: tb.kpi.totalScans.unit },
    { label: tb.kpi.passRate.label, value: `${PASS_RATE}`, unit: tb.kpi.passRate.unit },
    { label: tb.kpi.totalPlastic.label, value: TOTAL_KG.toLocaleString('vi-VN'), unit: tb.kpi.totalPlastic.unit },
    { label: tb.kpi.activeStations.label, value: MOCK_STATION_ACTIVITY.length.toLocaleString('vi-VN'), unit: tb.kpi.activeStations.unit },
  ];

  const weeklyLabels = {
    tooltipSeries: tb.charts.weeklyPlastic.tooltipSeries,
    tooltipWeekPrefix: tb.charts.weeklyPlastic.tooltipWeekPrefix,
  };

  const passRejectLabels = {
    legendPass: tb.charts.passReject.legendPass,
    legendReject: tb.charts.passReject.legendReject,
    tooltipPass: tb.charts.passReject.tooltipPass,
    tooltipReject: tb.charts.passReject.tooltipReject,
  };

  return (
    <div className="min-h-screen bg-[#0d1b2e] text-[var(--foreground)]">
      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-30 border-b border-[#263a52] bg-[#0d1b2e]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/landing"
            className="flex items-center gap-1.5 text-sm text-[var(--b2b-cool-grey)] transition-colors hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            {tb.nav.backHome}
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--b2b-navy)]">
              <Database className="h-3.5 w-3.5 text-[#7eb8f5]" />
            </div>
            <span className="text-sm font-semibold text-white">{tb.nav.title}</span>
            <span className="rounded-full border border-[#263a52] bg-[#1a2f48] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--b2b-cool-grey)]">
              {tb.nav.sampleDataBadge}
            </span>
          </div>

          <div className="w-24" aria-hidden="true" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        {/* ══════════════════════════════════════════════════════════════
            VALUE STATEMENT — single most visually prominent element
            Source: pcs-domain-knowledge §7 (verbatim principle, no
            fabricated statistics)
            ══════════════════════════════════════════════════════════════ */}
        <section className="mb-14 rounded-2xl border border-[#1e3a5f] bg-gradient-to-br from-[#0f2540] to-[#0d1b2e] px-8 py-14 text-center shadow-2xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--b2b-cool-grey)]">
            {tb.valueStatement.eyebrow}
          </p>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            {tb.valueStatement.headlinePart1}{' '}
            <span className="text-[#7eb8f5]">{tb.valueStatement.headlinePart2}</span>{' '}
            {tb.valueStatement.headlinePart3pre}{' '}
            <span className="text-[#5acfb0]">{tb.valueStatement.headlinePart3highlight}</span>
          </h1>
          <p className="mt-8 mx-auto max-w-3xl text-base leading-relaxed text-[var(--b2b-cool-grey)] md:text-lg">
            {tb.valueStatement.body}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--b2b-cool-grey)]">
            <span className="flex items-center gap-1.5 rounded-full border border-[#263a52] bg-[#1a2f48] px-4 py-1.5">
              🔬 {tb.valueStatement.pipeline.ftir}
            </span>
            <ArrowRight className="h-4 w-4 opacity-40" />
            <span className="flex items-center gap-1.5 rounded-full border border-[#263a52] bg-[#1a2f48] px-4 py-1.5">
              🤖 {tb.valueStatement.pipeline.ml}
            </span>
            <ArrowRight className="h-4 w-4 opacity-40" />
            <span className="flex items-center gap-1.5 rounded-full border border-[#263a52] bg-[#1a2f48] px-4 py-1.5">
              ♻️ {tb.valueStatement.pipeline.feedstock}
            </span>
          </div>
        </section>

        {/* ── KPI CHIPS ── */}
        <section className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {KPI_CHIPS.map((chip) => (
            <div
              key={chip.label}
              className="rounded-xl border border-[#1e3a5f] bg-[#0f2540] p-5 text-center"
            >
              <p className="text-2xl font-extrabold text-white">
                {chip.value}
                {chip.unit && (
                  <span className="ml-1 text-sm font-medium text-[var(--b2b-cool-grey)]">
                    {chip.unit}
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-[var(--b2b-cool-grey)]">{chip.label}</p>
            </div>
          ))}
        </section>

        {/* ── CHARTS ROW ── */}
        <section className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Chart 1 — Weekly plastic sorted */}
          <div className="rounded-2xl border border-[#1e3a5f] bg-[#0f2540] p-6">
            <div className="mb-5 flex items-center gap-2.5">
              <BarChart2 className="h-4 w-4 text-[#7eb8f5]" />
              <h2 className="text-sm font-semibold text-white">
                {tb.charts.weeklyPlastic.title}
              </h2>
              <span className="ml-auto text-[11px] text-[var(--b2b-cool-grey)]">{tb.charts.weeklyPlastic.badge}</span>
            </div>
            <WeeklyPlasticChart labels={weeklyLabels} />
          </div>

          {/* Chart 2 — PASS/REJECT breakdown */}
          <div className="rounded-2xl border border-[#1e3a5f] bg-[#0f2540] p-6">
            <div className="mb-5 flex items-center gap-2.5">
              <BarChart2 className="h-4 w-4 text-[#5acfb0]" />
              <h2 className="text-sm font-semibold text-white">
                {tb.charts.passReject.title}
              </h2>
            </div>
            <PassRejectChart labels={passRejectLabels} />
          </div>
        </section>

        {/* ── STATION HEATMAP ── */}
        <section className="rounded-2xl border border-[#1e3a5f] bg-[#0f2540] p-6">
          <div className="mb-6 flex items-center gap-2.5">
            <Activity className="h-4 w-4 text-[#f0a94e]" />
            <h2 className="text-sm font-semibold text-white">
              {tb.heatmap.title}
            </h2>
            <span className="ml-auto text-[11px] text-[var(--b2b-cool-grey)]">{tb.heatmap.badge}</span>
          </div>
          <div className="space-y-2.5">
            {MOCK_STATION_ACTIVITY.map((station) => {
              const ratio = station.scansThisWeek / MAX_SCANS;
              const opacity = 0.15 + ratio * 0.75;
              const textDark = ratio > 0.55;
              return (
                <div key={station.stationId} className="flex items-center gap-3">
                  <span className="w-48 flex-shrink-0 truncate text-xs font-medium text-[var(--muted-foreground)]">
                    {station.stationName}
                  </span>
                  <div className="relative flex-1 overflow-hidden rounded-md" style={{ height: 28 }}>
                    <div className="absolute inset-0 rounded-md bg-[var(--border)]" />
                    <div
                      className="absolute inset-y-0 left-0 rounded-md transition-all duration-500"
                      style={{
                        width: `${ratio * 100}%`,
                        backgroundColor: `rgba(30, 58, 95, ${opacity})`,
                      }}
                    />
                    <span
                      className={`absolute inset-y-0 left-3 flex items-center text-[11px] font-semibold ${
                        textDark ? 'text-white' : 'text-[var(--foreground)]'
                      }`}
                    >
                      {station.scansThisWeek.toLocaleString('vi-VN')} {tb.heatmap.scanSuffix}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-[11px] leading-relaxed text-[var(--b2b-cool-grey)]">
            {tb.heatmap.footnote}
          </p>
        </section>

        {/* ── FOOTNOTE ── */}
        <p className="mt-10 text-center text-xs text-[var(--b2b-cool-grey)]">
          {tb.footer}
        </p>
      </main>
    </div>
  );
}
