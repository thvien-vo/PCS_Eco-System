'use client';

/**
 * RemoteKioskWaiting — the multi-bottle "between scans" screens for the
 * pcs-kiosk-app remote handshake (WS_CONNECTING / WS_AWAITING_BOTTLE /
 * WS_PROCESSING). Styled to match the existing QR_DISPLAY / SIMULATED_SCAN
 * cards — same phone-frame mockup, same MOTION_TOKENS transitions.
 *
 * WS_AWAITING_BOTTLE is the phase the loop always returns to (after
 * user_identified is sent AND after every subsequent bottle_result) — it's
 * intentionally one screen doing double duty for "first bottle" and "next
 * bottle", not two.
 *
 * Per pcs-tech-standards §4: all animation values from MOTION_TOKENS.
 */

import { motion } from 'framer-motion';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { useKioskStore } from '@/store/kiosk-store';
import { useTranslation } from '@/hooks/use-translation';

interface RemoteKioskWaitingProps {
  connectionError: boolean;
  onRetryConnection: () => void;
  onFallbackToSimulate: () => void;
  onComplete: () => void;
}

export function RemoteKioskWaiting({
  connectionError,
  onRetryConnection,
  onFallbackToSimulate,
  onComplete,
}: RemoteKioskWaitingProps) {
  const phase = useKioskStore((s) => s.phase);
  const bottlesProcessed = useKioskStore((s) => s.bottlesProcessed);
  const pointsThisSession = useKioskStore((s) => s.pointsThisSession);
  const { t } = useTranslation();
  const tm = t.kiosk.remote;

  if (phase === 'WS_CONNECTING') {
    if (connectionError) {
      return (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-[var(--error-rose)]/15 flex h-16 w-16 items-center justify-center rounded-full">
            <WifiOff className="h-8 w-8" style={{ color: 'var(--error-rose)' }} />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-foreground">{tm.connectionErrorTitle}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{tm.connectionErrorMessage}</p>
          </div>
          <button
            id="kiosk-remote-retry-btn"
            type="button"
            onClick={onRetryConnection}
            className="w-full rounded-xl bg-[var(--primary-emerald)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--emerald-hover)] active:scale-[0.98]"
          >
            {tm.retryButton}
          </button>
          <button
            id="kiosk-remote-fallback-btn"
            type="button"
            onClick={onFallbackToSimulate}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-card"
          >
            {tm.fallbackButton}
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-5 py-4">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--primary-emerald)]" />
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">{tm.connectingTitle}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{tm.connectingSubtitle}</p>
        </div>
      </div>
    );
  }

  if (phase === 'WS_PROCESSING') {
    return (
      <div className="flex flex-col items-center gap-5 py-4">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--primary-emerald)]"
          />
          <span className="text-4xl">🔬</span>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">{tm.processingTitle}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{tm.processingSubtitle}</p>
        </div>
      </div>
    );
  }

  if (phase === 'WS_AWAITING_BOTTLE') {
    return (
      <div className="flex flex-col items-center gap-5 py-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary-emerald)]/15">
          <Wifi className="h-10 w-10" style={{ color: 'var(--primary-emerald)' }} />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">{tm.awaitingTitle}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{tm.awaitingSubtitle}</p>
        </div>

        <div className="flex w-full gap-3">
          <div className="flex-1 rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{bottlesProcessed}</p>
            <p className="text-[10px] text-muted-foreground">{tm.tallyBottlesLabel}</p>
          </div>
          <div className="flex-1 rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--kiosk-pass)' }}>
              {pointsThisSession}
            </p>
            <p className="text-[10px] text-muted-foreground">{tm.tallyPointsLabel}</p>
          </div>
        </div>

        <button
          id="kiosk-remote-complete-btn"
          type="button"
          onClick={onComplete}
          className="w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-card"
        >
          {tm.completeButton}
        </button>
      </div>
    );
  }

  return null;
}
