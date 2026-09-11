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
 * ├───────────────────────────────────────────────────────────────────────────┤
 * │ CAMERA CLEANUP                                                            │
 * │ QrCameraScanner (live camera input, alternative to Simulate Scan) is     │
 * │ only ever mounted while `cameraMode === 'active'`. A dedicated effect    │
 * │ (separate from the countdown effect, same pattern) sets cameraMode back  │
 * │ to 'closed' the INSTANT `phase` leaves QR_DISPLAY — scan success, modal  │
 * │ close, or the 5s auto-reset all go through this. That state flip         │
 * │ unmounts QrCameraScanner immediately, running its own Html5Qrcode        │
 * │ .stop()/.clear() cleanup right away, rather than waiting for the slower  │
 * │ AnimatePresence exit-animation unmount of this whole module — so a       │
 * │ modal close mid-scan can never leave a video track open ("camera in     │
 * │ use" browser-tab indicator).                                             │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * Per pcs-tech-standards §4: all animation values from MOTION_TOKENS.
 * Per pcs-design-system §3: qrcode.react for QR generation.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Camera } from 'lucide-react';
import { MOTION_TOKENS } from '@/lib/motion-tokens';
import { useKioskStore } from '@/store/kiosk-store';
import { useTranslation } from '@/hooks/use-translation';
import { QrCameraScanner } from '@/components/kiosk/qr-camera-scanner';

const QR_COUNTDOWN_SECONDS = 90;
const STATION_ID = 'HCM-01'; // Mock station identifier for demo

// A camera scan matching this shape is a DIFFERENT physical kiosk's
// (pcs-kiosk-app's) on-screen QR — this app's own QR_DISPLAY token happens to
// use the identical string shape, but that token is only ever shown on
// screen for something else to scan, never read back by this app's own
// camera. Any other decoded text keeps today's behavior (generic successful
// scan → local mock).
const REMOTE_STATION_QR_PATTERN = /^pcs-station-([A-Za-z0-9]+)-session-([A-Za-z0-9]+)$/;

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
  const { phase, sessionToken, triggerScan, openKiosk, connectToRemoteKiosk } = useKioskStore();
  const { t } = useTranslation();
  const tm = t.kiosk.qrPhase;

  const [displaySeconds, setDisplaySeconds] = useState<number>(QR_COUNTDOWN_SECONDS);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  /**
   * cameraMode drives the alternative live-camera input method:
   *   'closed' — default; shows the Simulate + Camera-scan buttons.
   *   'active' — camera viewfinder is mounted (permission requested/granted).
   *   'error'  — start() rejected (permission denied, no device, or the page
   *              isn't served over a secure/HTTPS context) — falls back to
   *              a friendly message plus the Simulate button.
   */
  const [cameraMode, setCameraMode] = useState<'closed' | 'active' | 'error'>('closed');

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
   * handleScanTransition — the ONE state-machine transition path shared by
   * BOTH scan input methods (Simulate button AND live camera decode).
   * Requirement: a real camera scan must feed the EXACT SAME transition the
   * simulate button already triggers, not a parallel one.
   *
   * ORDER IS CRITICAL:
   *   1. Set isScanningRef.current = true  ← FIRST — wins any in-flight tick
   *   2. clearInterval                     ← belt-and-suspenders cleanup
   *   3. triggerScan()                     ← state machine transition
   */
  const handleScanTransition = useCallback(() => {
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

  /** Presenter presses "Simulate QR scan" debug button. */
  const handleSimulateScan = useCallback(() => {
    handleScanTransition();
  }, [handleScanTransition]);

  /** Presenter presses "Scan QR with Camera" — requests permission, opens the viewfinder. */
  const handleOpenCamera = useCallback(() => {
    setCameraMode('active');
  }, []);

  /** Presenter cancels the live camera view and returns to the button choices. */
  const handleCancelCamera = useCallback(() => {
    setCameraMode('closed');
  }, []);

  /**
   * A real QR code was decoded by the camera. If it matches a pcs-kiosk-app
   * station QR, branch into the remote WebSocket-handshake flow (bypassing
   * the local mock's SIMULATED_SCAN entirely). Any other decoded text keeps
   * the original behavior: the content is unused, only the transition
   * matters, and it must be the SAME one triggerScan() drives.
   */
  const handleCameraScanSuccess = useCallback(
    (decodedText: string) => {
      setCameraMode('closed');

      const match = decodedText.match(REMOTE_STATION_QR_PATTERN);
      if (match) {
        const [, stationId, sessionSuffix] = match;
        connectToRemoteKiosk(stationId, `pcs-station-${stationId}-session-${sessionSuffix}`);
        return;
      }

      handleScanTransition();
    },
    [handleScanTransition, connectToRemoteKiosk],
  );

  /** start() rejected — permission denied, no camera device, or insecure context. */
  const handleCameraFailure = useCallback(() => {
    setCameraMode('error');
  }, []);

  // ── Camera teardown on any exit from QR_DISPLAY ───────────────────────────
  // Deliberately a SEPARATE effect from the countdown one below: this fires the
  // instant `phase` changes away from QR_DISPLAY (scan success, modal close,
  // auto-reset), unmounting QrCameraScanner — and therefore running its
  // stop()/clear() cleanup — immediately, rather than waiting for the slower
  // AnimatePresence exit-animation unmount of this whole module.
  useEffect(() => {
    if (phase !== 'QR_DISPLAY') {
      setCameraMode('closed');
    }
  }, [phase]);

  // ── Main countdown useEffect ──────────────────────────────────────────────
  useEffect(() => {
    // Only run while in QR_DISPLAY
    if (phase !== 'QR_DISPLAY') return;

    // Reset the scanning lock, countdown, and camera view when entering QR_DISPLAY
    isScanningRef.current = false;
    countdownValueRef.current = QR_COUNTDOWN_SECONDS;
    setDisplaySeconds(QR_COUNTDOWN_SECONDS);
    setCameraMode('closed');

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
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute left-0 right-0 h-0.5 bg-[var(--kiosk-pass)]"
                style={{ boxShadow: '0 0 8px 2px rgba(34, 197, 94, 0.7)' }}
                animate={{
                  top: ['0%', '100%', '100%', '0%', '0%'],
                  opacity: [1, 1, 0, 0, 1],
                }}
                transition={{
                  duration: MOTION_TOKENS.durations.ambient,
                  ease: MOTION_TOKENS.easing.standard,
                  repeat: Infinity,
                }}
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
          <span className="text-sm text-muted-foreground">{tm.secondsUnit}</span>
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
          {tm.refreshLabel.replace('{n}', displaySeconds.toString())}
        </p>
      </div>

      {/* ── Scan input methods ── */}
      {cameraMode === 'closed' && (
        <>
          {/* "Simulate Scan" debug button — stays for demo narration flexibility
              when a live camera isn't practical mid-pitch. */}
          <motion.button
            id="kiosk-simulate-scan-btn"
            type="button"
            onClick={handleSimulateScan}
            className="w-full rounded-xl bg-[var(--primary-emerald)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--emerald-hover)] active:scale-[0.98]"
            whileTap={{ scale: 0.97 }}
            transition={{ duration: MOTION_TOKENS.durations.fast }}
          >
            {tm.simulateScanButton}
          </motion.button>

          {/* Real camera QR scan — alternative input, same triggerScan() transition */}
          <motion.button
            id="kiosk-camera-scan-btn"
            type="button"
            onClick={handleOpenCamera}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--primary-emerald)] px-4 py-3 text-sm font-semibold text-[var(--primary-emerald)] hover:bg-[var(--primary-emerald)]/5 active:scale-[0.98]"
            whileTap={{ scale: 0.97 }}
            transition={{ duration: MOTION_TOKENS.durations.fast }}
          >
            <Camera className="h-4 w-4" />
            {tm.cameraScanButton}
          </motion.button>

          <p className="text-center text-[11px] text-muted-foreground">
            {tm.simulateScanHint}
          </p>
        </>
      )}

      {cameraMode === 'active' && (
        <div className="flex w-full flex-col items-center gap-3">
          <QrCameraScanner
            onScanSuccess={handleCameraScanSuccess}
            onFailure={handleCameraFailure}
          />
          <p className="text-center text-[11px] text-muted-foreground">
            {tm.cameraViewfinderHint}
          </p>
          <button
            id="kiosk-camera-cancel-btn"
            type="button"
            onClick={handleCancelCamera}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-card"
          >
            {tm.cameraCancelButton}
          </button>
        </div>
      )}

      {cameraMode === 'error' && (
        <div className="flex w-full flex-col items-center gap-3">
          <div className="w-full rounded-2xl border border-[var(--error-rose)]/40 bg-[var(--error-rose)]/5 p-4 text-center">
            <p className="text-sm font-semibold text-[var(--error-rose)]">
              {tm.cameraPermissionDeniedTitle}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {tm.cameraPermissionDeniedMessage}
            </p>
          </div>

          <motion.button
            id="kiosk-simulate-scan-btn"
            type="button"
            onClick={handleSimulateScan}
            className="w-full rounded-xl bg-[var(--primary-emerald)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--emerald-hover)] active:scale-[0.98]"
            whileTap={{ scale: 0.97 }}
            transition={{ duration: MOTION_TOKENS.durations.fast }}
          >
            {tm.simulateScanButton}
          </motion.button>

          <p className="text-center text-[11px] text-muted-foreground">
            {tm.cameraFallbackHint}
          </p>
        </div>
      )}
    </div>
  );
}
