'use client';

/**
 * MapboxMap — Mapbox GL JS map component for Module 2.
 *
 * CRITICAL SAFEGUARDS:
 * - Must be loaded via next/dynamic({ ssr: false }) — Mapbox uses window/DOM APIs.
 * - ResizeObserver on the container calls map.resize() when phone-frame layout shifts.
 * - Popup content uses NO sensor-related technical terminology (per pcs-design-system §9).
 *
 * I18N NOTE: Translated labels are passed in via the `labels` prop from map/page.tsx
 * (which uses useTranslation). The popup HTML is built inside a useEffect callback
 * which cannot use React hooks directly, so labels must be passed as plain strings.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useTheme } from 'next-themes';
import type { Station } from '@/types';
import type { TranslationDictionary } from '@/lib/i18n/dictionaries';

// ── Status color config (locale-agnostic — colours only) ──
const STATUS_COLORS = {
  green: {
    color: '#22C55E',
    glowColor: 'rgba(34,197,94,0.5)',
  },
  yellow: {
    color: '#F59E0B',
    glowColor: 'rgba(245,158,11,0.5)',
  },
  red: {
    color: '#EF4444',
    glowColor: 'rgba(239,68,68,0.5)',
  },
} as const;

type MapLabels = Pick<TranslationDictionary['map'], 'popup' | 'fallback' | 'legend' | 'page'>;

interface MapboxMapProps {
  stations: Station[];
  center?: [number, number];
  zoom?: number;
  /** Translated labels passed from the parent page — used in popup HTML and fallback UI */
  labels: MapLabels;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export function MapboxMap({ stations, labels, center = [106.7009, 10.7769], zoom = 12 }: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupsRef = useRef<mapboxgl.Popup[]>([]);
  const { resolvedTheme } = useTheme();

  /**
   * Bug fix: runtime detection of auth failure.
   * The demo/placeholder token is non-empty so `Boolean(token)` passes, but
   * Mapbox GL JS returns 401 Unauthorized on every tile/style fetch, leaving
   * a solid gray canvas. We detect this at runtime and fall back to the
   * station-list UI — same component already rendered for the no-token case.
   */
  const [tokenFailed, setTokenFailed] = useState(false);

  const getMapStyle = useCallback((currentTheme: string | undefined) => {
    const isDark = currentTheme === 'dark';
    return isDark
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/streets-v12';
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!token) {
      // No token — render a placeholder instead of crashing
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: getMapStyle(resolvedTheme),
      center,
      zoom,
      attributionControl: false,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      'bottom-left'
    );

    // Detect auth failures (401 Unauthorized / invalid/expired token)
    map.on('error', (e) => {
      const msg = (e?.error?.message ?? '').toLowerCase();
      const status = (e?.error as { status?: number } | undefined)?.status;
      const isAuthError =
        status === 401 ||
        msg.includes('unauthorized') ||
        msg.includes('invalid token') ||
        msg.includes('401');

      if (isAuthError) {
        // Token is invalid — tear down the map and show the station-list fallback
        map.remove();
        mapRef.current = null;
        setTokenFailed(true);
      }
    });

    map.on('load', () => {
      stations.forEach((station) => {
        const cfg = STATUS_COLORS[station.status];

        // Resolve translated status label for this station
        const statusLabel =
          station.status === 'green'
            ? labels.popup.status.active
            : station.status === 'yellow'
            ? labels.popup.status.almostFull
            : labels.popup.status.suspended;

        // Create glowing pin element
        const el = document.createElement('div');
        el.className = 'pcs-station-pin';
        el.setAttribute('aria-label', `Trạm PCS: ${station.name}`);
        el.style.cssText = `
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: ${cfg.color};
          border: 3px solid white;
          box-shadow: 0 0 0 2px ${cfg.color}, 0 0 12px ${cfg.glowColor};
          cursor: pointer;
          position: relative;
        `;

        // Pulse ring
        const ring = document.createElement('div');
        ring.style.cssText = `
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          background-color: ${cfg.glowColor};
          animation: pin-pulse 2s ease-in-out infinite;
        `;
        el.appendChild(ring);

        // Build popup HTML (no sensor jargon per design system §9)
        const rewardText =
          station.rewardsRemaining > 0
            ? `<span style="color: #22C55E; font-weight: 600;">${station.rewardsRemaining} ${labels.popup.rewardsRemaining}</span>`
            : `<span style="color: #EF4444; font-weight: 600;">${labels.popup.noRewards}</span>`;

        const popupHTML = `
          <div style="
            font-family: Inter, sans-serif;
            min-width: 220px;
            padding: 4px;
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 10px;
            ">
              <div style="
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: ${cfg.color};
                box-shadow: 0 0 6px ${cfg.glowColor};
                flex-shrink: 0;
              "></div>
              <span style="
                font-size: 11px;
                font-weight: 600;
                color: ${cfg.color};
                text-transform: uppercase;
                letter-spacing: 0.05em;
              ">${statusLabel}</span>
            </div>

            <h3 style="
              font-size: 14px;
              font-weight: 700;
              margin: 0 0 4px;
              color: inherit;
              line-height: 1.3;
            ">${station.name}</h3>

            <p style="
              font-size: 12px;
              color: #64748B;
              margin: 0 0 12px;
            ">${station.address}</p>

            <div style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 8px 10px;
              background: rgba(16,185,129,0.08);
              border-radius: 8px;
              margin-bottom: 10px;
              font-size: 12px;
            ">
              <span style="color: #64748B;">📍 ${formatDistance(station.distanceKm)} ${labels.popup.distanceSuffix}</span>
              <span>${rewardText}</span>
            </div>

            <a
              href="https://maps.google.com/?q=${station.coordinates[1]},${station.coordinates[0]}"
              target="_blank"
              rel="noopener noreferrer"
              style="
                display: block;
                text-align: center;
                background: #059669;
                color: white;
                text-decoration: none;
                padding: 9px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                transition: background 0.15s;
              "
              onmouseover="this.style.background='#047857'"
              onmouseout="this.style.background='#059669'"
            >
              ${labels.popup.directionsCta}
            </a>
          </div>
        `;

        const popup = new mapboxgl.Popup({
          offset: 20,
          maxWidth: '280px',
          className: 'pcs-mapbox-popup',
        }).setHTML(popupHTML);

        popupsRef.current.push(popup);

        new mapboxgl.Marker({ element: el })
          .setLngLat(station.coordinates)
          .setPopup(popup)
          .addTo(map);
      });
    });

    // ResizeObserver to handle phone-frame layout shifts
    const observer = new ResizeObserver(() => {
      map.resize();
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      popupsRef.current.forEach((p) => p.remove());
      popupsRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap map style when theme changes (without full remount)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const newStyle = getMapStyle(resolvedTheme);
    try {
      map.setStyle(newStyle);
    } catch {
      // Ignore if map is not yet loaded
    }
  }, [resolvedTheme, getMapStyle]);

  const hasToken = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);

  // Show station-list fallback when: no token at all, OR token present but rejected by Mapbox (401)
  if (!hasToken || tokenFailed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-card to-background p-6 text-center">
        <div className="text-4xl">🗺️</div>
        <h3 className="font-semibold text-foreground">{labels.fallback.title}</h3>
        <p className="max-w-xs text-xs text-muted-foreground leading-relaxed">
          {labels.fallback.body.split('NEXT_PUBLIC_MAPBOX_TOKEN').map((part, i, arr) =>
            i < arr.length - 1 ? (
              <span key={i}>
                {part}
                <code className="rounded bg-border px-1 py-0.5 font-mono">NEXT_PUBLIC_MAPBOX_TOKEN</code>
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </p>
        <div className="mt-2 w-full max-w-xs space-y-2 rounded-xl border border-border bg-card p-3">
          <p className="text-xs font-semibold text-foreground">{labels.fallback.stationListHeading}</p>
          {stations.map((s) => {
            const cfg = STATUS_COLORS[s.status];
            const statusLabel =
              s.status === 'green'
                ? labels.legend.active
                : s.status === 'yellow'
                ? labels.legend.almostFull
                : labels.legend.suspended;
            return (
              <div key={s.id} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cfg.color }}
                />
                <span className="truncate text-muted-foreground">{s.name}</span>
                <span className="ml-auto text-[10px]" style={{ color: cfg.color }}>
                  {statusLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}
