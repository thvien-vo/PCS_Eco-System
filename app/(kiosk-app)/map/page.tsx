'use client';

/**
 * Module 2 — PCS Station Map
 *
 * The MapboxMap component is loaded via next/dynamic with { ssr: false }
 * because mapbox-gl uses window/document/WebGL APIs that are unavailable
 * during SSR. This is required — 'use client' alone is insufficient for
 * mapbox-gl (it still crashes at import time in the Node.js render pass).
 */

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { MOCK_STATIONS } from '@/lib/mock-data';
import { MOTION_TOKENS } from '@/lib/motion-tokens';
import type { Station } from '@/types';
import { useTranslation } from '@/hooks/use-translation';
import { useHasMounted } from '@/hooks/use-has-mounted';

// Load map without SSR
const MapboxMap = dynamic(
  () => import('@/components/shared/mapbox-map').then((m) => m.MapboxMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-card">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-border border-t-emerald" />
          {/* Loading text uses static VI — the map component is not yet mounted so locale is not yet available */}
          <p className="text-sm text-muted-foreground">Đang tải bản đồ...</p>
        </div>
      </div>
    ),
  }
);

type FilterValue = 'all' | Station['status'];

export default function MapPage() {
  const { t } = useTranslation();
  const hasMounted = useHasMounted();
  const tm = t.map;

  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStations = MOCK_STATIONS.filter((s) => {
    const matchesFilter = activeFilter === 'all' || s.status === activeFilter;
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stationCounts = {
    green: MOCK_STATIONS.filter((s) => s.status === 'green').length,
    yellow: MOCK_STATIONS.filter((s) => s.status === 'yellow').length,
    red: MOCK_STATIONS.filter((s) => s.status === 'red').length,
  };

  // ── Status filter pills ── (built inside render so they pick up live translations)
  const STATUS_FILTERS = [
    { label: tm.filters.all, value: 'all' as const, color: 'bg-border text-foreground' },
    { label: tm.filters.active, value: 'green' as const, color: 'bg-success/20 text-success' },
    { label: tm.filters.almostFull, value: 'yellow' as const, color: 'bg-warning/20 text-warning' },
    { label: tm.filters.suspended, value: 'red' as const, color: 'bg-error/20 text-error' },
  ] as const;

  // Translated labels to pass into MapboxMap (used in Mapbox popup HTML built in useEffect)
  const mapLabels = {
    popup: tm.popup,
    fallback: tm.fallback,
    legend: tm.legend,
    page: tm.page,
  };

  // Prevent hydration mismatch — render a skeleton until locale store has rehydrated
  if (!hasMounted) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-shrink-0 border-b border-border bg-card/95 px-4 pb-3 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-5 w-36 animate-pulse rounded bg-border" />
              <div className="h-3 w-28 animate-pulse rounded bg-border" />
            </div>
            <div className="h-9 w-9 animate-pulse rounded-full bg-border" />
          </div>
          <div className="mb-3 h-9 animate-pulse rounded-full bg-border" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-7 w-16 animate-pulse rounded-full bg-border" />
            ))}
          </div>
        </div>
        <div className="flex-1 animate-pulse bg-border/30" />
        <div className="flex-shrink-0 border-t border-border bg-card/95 px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* ── TOP HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION_TOKENS.durations.base }}
        className="flex-shrink-0 border-b border-border bg-card/95 px-4 pb-3 pt-4 backdrop-blur-sm"
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">{tm.page.title}</h1>
            <p className="text-xs text-muted-foreground">
              {MOCK_STATIONS.length} {tm.page.stationCountSubtitle}
            </p>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
            aria-label={tm.page.filterAriaLabel}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={tm.page.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--primary-emerald)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-emerald)]/30"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={[
                'flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150',
                activeFilter === f.value
                  ? `${f.color} ring-2 ring-offset-1 ring-[var(--primary-emerald)]/50`
                  : 'bg-background text-muted-foreground hover:bg-card',
              ].join(' ')}
            >
              {f.label}
              {f.value !== 'all' && (
                <span className="ml-1.5 opacity-70">
                  {stationCounts[f.value]}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── MAP ── */}
      <div className="relative min-h-0 flex-1">
        <MapboxMap stations={filteredStations} labels={mapLabels} />

        {/* Station count overlay */}
        <motion.div
          key={filteredStations.length}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: MOTION_TOKENS.durations.fast }}
          className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm shadow-sm"
        >
          <MapPin className="h-3.5 w-3.5 text-emerald" />
          {filteredStations.length} {tm.page.overlayCount}
        </motion.div>

        {/* No results state */}
        {filteredStations.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="font-medium text-foreground">{tm.page.noResultsTitle}</p>
              <p className="text-xs text-muted-foreground">{tm.page.noResultsHint}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── LEGEND ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION_TOKENS.durations.base, delay: 0.15 }}
        className="flex-shrink-0 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-sm"
      >
        <div className="flex items-center justify-around text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
            <span>{tm.legend.active}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-warning shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
            <span>{tm.legend.almostFull}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-error shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
            <span>{tm.legend.suspended}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
