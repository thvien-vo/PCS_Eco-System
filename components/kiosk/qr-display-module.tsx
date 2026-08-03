'use client';

/**
 * QrDisplayModule — STEP 1: QR Code + 90s Countdown + Laser Scan Animation
 *
 * Architecture note:
 *   This is a FULLY SEPARATE component/service module so QR-generation and countdown
 *   logic are fully decoupled from the result/debug panel (KioskModal).
 *
 *   This component accepts a `renderTarget` prop (default "screen"), architected so
 *   it can later be switched to "external-display" without rewriting the QR-generation
 *   or countdown logic. This is future-proofing, NOT a finished feature.
 *
 * STATE MACHINE CONTRACT (enforced via refs, not component state):
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │ STALE CLOSURE FIX                                                         │
 * │ isScanningRef + countdownValueRef are useRef values. They are read inside │
 * │ the setInterval callback without ever being stale — a useRef value is     │
 * │ always the latest regardless of when the effect closure was created.      │
 * │ DO NOT replace with useState reads inside the interval.                   │
 * ├───────────────────────────────────────────────────────────────────────────┤
 * │ RACE CONDITION FIX                                                         │
 * │ handleSimulateScan() sets isScanningRef.current = true FIRST,             │
 * │ THEN calls clearInterval, THEN calls triggerScan(). This order guarantees │
 * │ any in-flight interval callback that fires in the same JS event loop tick │
 * │ will see the ref = true and bail before calling generateNewQR().          │
 * │ State-transition side is AUTHORITATIVE (per approved spec, QA turn).      │
 * ├───────────────────────────────────────────────────────────────────────────┤
 * │ CLEANUP GUARANTEE                                                          │
 * │ clearInterval is the FIRST call in the useEffect return function.         │
 * │ This fires on unmount AND whenever the `phase` dependency changes,        │
 * │ which includes the user closing the modal from QR_DISPLAY (Edge Case 1). │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * Per pcs-tech-standards §4: all animation values from MOTION_TOKENS.
 * Per pcs-design-system §3: qrcode.react for QR generation.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { MOTION_TOKENS } from '@/lib/motion-tokens';
import { useKioskStore } from '@/store/kiosk-store';

const QR_COUNTDOWN_SECONDS = 90;
const STATION_ID = 'HCM-01'; // Mock station identifier for demo

interface QrDisplayModuleProps {
  /**
   * Where to render the QR output.
   * - "screen":           default — renders inside the modal (demo/presentation mode).
   * - "external-display": FUTURE-PROOF hook — in production, push the QR to an
   *                       external kiosk screen device here. Switching this prop will
   *                       NOT require rewriting the QR-generation or countdown logic.
   */
  renderTarget?: 'screen' | 'external-display';
}

export function QrDisplayModule({ renderTarget = 'screen' }: QrDisplayModuleProps) {
  const { phase, sessionToken, triggerScan, openKiosk } = useKioskStore();

  const [displaySeconds, setDisplaySeconds] = useState<number>(QR_COUNTDOWN_SECONDS);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // ── Refs — NEVER stale inside interval/timeout closures ──────────────────
  /**
   * isScanningRef — Race-condition guard (the authoritative lock).
   * Set to true BEFORE clearInterval and BEFORE triggerScan() is called.
   * The interval callback reads this ref and aborts generateNewQR if true.
   * Using useRef (not useState) so the closure always sees the latest value.
   */
  const isScanningRef = useRef<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /**
   * countdownValueRef — countdown value read inside the interval.
   * Never stale because it is a ref, not a state variable captured at closure time.
   */
  const countdownValueRef = useRef<number>(QR_COUNTDOWN_SECONDS);

  /** Regenerate QR: start a fresh session, reset countdown display. */
  const generateNewQR = useCallback(() => {
    setIsRefreshing(true);
    openKiosk(STATION_ID);
    countdownValueRef.current = QR_COUNTDOWN_SECONDS;
    setDisplaySeconds(QR_COUNTDOWN_SECONDS);
    // Use a short timeout to animate the refresh; not returned as cleanup because
    // this function is called from inside setInterval (the return value is ignored).
    // The 300ms is safe: if the component unmounts, React batches the setIsRefreshing
    // call and drops it silently (no leak in React 18+/19 strict mode).
    window.setTimeout(() => setIsRefreshing(false), 300);
  }, [openKiosk]);

  /**
   * handleSimulateScan — presenter presses "Simulate Scan" debug button.
   *
   * ORDER IS CRITICAL:
   *   1. Set isScanningRef.current = true  ← FIRST — wins any in-flight tick
   *   2. clearInterval                     ← belt-and-suspenders cleanup
   *   3. triggerScan()                     ← state machine transition
   */
  const handleSimulateScan = useCallback(() => {
    // 1. Authoritative lock — any interval tick in the same JS event loop sees this
    isScanningRef.current = true;

    // 2. Stop the countdown timer immediately
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 3. Transition the state machine
    triggerScan();
  }, [triggerScan]);

  // ── Main countdown useEffect ──────────────────────────────────────────────
  useEffect(() => {
    // Only run while in QR_DISPLAY
    if (phase !== 'QR_DISPLAY') return;

    // Reset the scanning lock and countdown when entering QR_DISPLAY
    isScanningRef.current = false;
    countdownValueRef.current = QR_COUNTDOWN_SECONDS;
    setDisplaySeconds(QR_COUNTDOWN_SECONDS);

    const id = setInterval(() => {
      // ── RACE CONDITION CHECK (per approved spec) ──────────────────────────
      // isScanningRef.current is a ref — always the real current value, never stale.
      // If this is true, the scan was triggered in the same JS tick. Abort.
      if (isScanningRef.current) {
        clearInterval(id);
        return;
      }

      countdownValueRef.current -= 1;
      setDisplaySeconds(countdownValueRef.current);

      if (countdownValueRef.current <= 0) {
        // Final check before regenerating
        if (!isScanningRef.current) {
          generateNewQR();
        }
      }
    }, 1000);

    intervalRef.current = id;

    // ── CLEANUP — clearInterval is ALWAYS the first call ─────────────────────
    // This fires when: (a) component unmounts, (b) phase leaves QR_DISPLAY.
    // Covers Edge Case 1 (close mid-countdown) and Edge Cases 3 & 4 (race/scan).
    return () => {
      clearInterval(id); // ← FIRST, synchronous
      intervalRef.current = null;
    };
  }, [phase, generateNewQR]);

  // ── External display hook (future-proofing) ───────────────────────────────
  // When renderTarget === "external-display": send the QR token to a real
  // hardware screen API here. The QR-generation and countdown logic above
  // remain 100% unchanged. Currently a no-op placeholder.
  if (renderTarget === 'external-display') {
    return null;
  }

  // ── Computed UI helpers ───────────────────────────────────────────────────
  const progressPercent = (displaySeconds / QR_COUNTDOWN_SECONDS) * 100;
  const isLow = displaySeconds <= 15;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* ── QR Code + laser scan animation ── */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={sessionToken ?? 'loading'}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{
              duration: MOTION_TOKENS.durations.base,
              ease: MOTION_TOKENS.easing.standard,
            }}
            className="relative overflow-hidden rounded-2xl border-2 border-[var(--primary-emerald)] bg-white p-3 shadow-lg"
          >
            {sessionToken ? (
              <QRCodeSVG
                value={sessionToken}
                size={180}
                fgColor="#0f172a"
                bgColor="#ffffff"
                level="M"
              />
            ) : (
              <div className="flex h-[180px] w-[180px] items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-[var(--primary-emerald)]" />
              </div>
            )}

            {/* Laser scan line — runs continuously, symbolises optical sensor */}
            {!isRefreshing && (
              <div
                aria-hidden="true"
                className="kiosk-laser-scan pointer-events-none absolute left-0 right-0 h-0.5 bg-[var(--kiosk-pass)]"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Refresh overlay during QR regeneration */}
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm"
          >
            <RefreshCw className="h-8 w-8 animate-spin text-[var(--primary-emerald)]" />
          </motion.div>
        )}
      </div>

      {/* Session token — truncated, for presenter visibility */}
      <p className="max-w-[220px] truncate text-center font-mono text-[10px] text-muted-foreground">
        {sessionToken ?? '—'}
      </p>

      {/* ── Countdown display ── */}
      <div className="flex w-full flex-col items-center gap-2">
        <div className="flex items-baseline gap-1.5">
          <motion.span
            key={displaySeconds}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: MOTION_TOKENS.durations.fast,
              ease: MOTION_TOKENS.easing.enter,
            }}
            className={`text-4xl font-bold tabular-nums ${
              isLow ? 'text-[var(--error-rose)]' : 'text-[var(--primary-emerald)]'
            }`}
          >
            {displaySeconds}
          </motion.span>
          <span className="text-sm text-muted-foreground">giây</span>
        </div>

        {/* Countdown progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <motion.div
            className={`h-full rounded-full ${
              isLow ? 'bg-[var(--error-rose)]' : 'bg-[var(--primary-emerald)]'
            }`}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: MOTION_TOKENS.durations.fast }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Mã QR tự làm mới sau {displaySeconds}s
        </p>
      </div>

      {/* ── "Simulate Scan" debug button ── */}
      <motion.button
        id="kiosk-simulate-scan-btn"
        type="button"
        onClick={handleSimulateScan}
        className="w-full rounded-xl bg-[var(--primary-emerald)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--emerald-hover)] active:scale-[0.98]"
        whileTap={{ scale: 0.97 }}
        transition={{ duration: MOTION_TOKENS.durations.fast }}
      >
        📱 Giả lập quét QR
      </motion.button>

      <p className="text-center text-[11px] text-muted-foreground">
        Nhấn để mô phỏng bước khách hàng quét QR tại trạm PCS
      </p>
    </div>
  );
}
