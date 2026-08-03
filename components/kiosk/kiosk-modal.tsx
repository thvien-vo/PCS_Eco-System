'use client';

/**
 * KioskModal — Module 7 Kiosk Simulation Orchestrator
 *
 * Implements the approved State Diagram exactly:
 *   IDLE → QR_DISPLAY → SIMULATED_SCAN → RESULT_PASS | RESULT_REJECT → IDLE
 *
 * Key architectural decisions (per approved QA confirmations):
 *
 *   1. RESET is NOT a UI state.
 *      resetKiosk() is called synchronously. The React render immediately
 *      reflects IDLE state. There is no intermediate render frame between
 *      a RESULT state and IDLE — no flicker, no blank screen.
 *
 *   2. Token clearing is atomic.
 *      resetKiosk() sets sessionToken: null in a single Zustand update.
 *      The next openKiosk() call generates a brand-new token.
 *
 *   3. hasResultedRef — event-level double-click guard (RESULT states).
 *      Separate from isScanningRef in QrDisplayModule (which guards QR timer).
 *      Set to true the moment a result button is clicked; any subsequent click
 *      in the same render cycle is STRICTLY IGNORED (no cancel, no switch).
 *      This is the "strict determinism" confirmed in the QA turn.
 *
 *   4. 5s auto-reset timeout (Edge Case 7).
 *      autoResetTimeoutRef stores the setTimeout ID in a useRef (never stale).
 *      Started the moment phase becomes RESULT_PASS or RESULT_REJECT.
 *      Fires the SAME resetKiosk() used by the manual Close button — no
 *      duplicate reset logic paths.
 *      clearTimeout(autoResetTimeoutRef.current) is called inside handleClose()
 *      so manual close always wins without leaving a pending timeout.
 *
 * Per pcs-design-system §8: ParticleBurst reused (not rewritten) for PASS.
 * Per pcs-design-system §4: --kiosk-pass (#22C55E) strictly for PASS.
 *                           --warning-amber / --error-rose for REJECT.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, Zap, AlertTriangle } from 'lucide-react';
import { MOTION_TOKENS } from '@/lib/motion-tokens';
import { useKioskStore } from '@/store/kiosk-store';
import { useWalletStore } from '@/store/wallet-store';
import { QrDisplayModule } from '@/components/kiosk/qr-display-module';
import { ParticleBurst } from '@/components/shared/particle-burst';
import type { ScanResult } from '@/types';

// ── REJECT scenario data (from pcs-domain-knowledge §6) ─────────────────────
// 4 distinct reasons with their own friendly Vietnamese guidance messages.
// Severity: 'medium' → warning-amber (#F59E0B); 'high' → error-rose (#EF4444)

const REJECT_SCENARIOS: Array<{
  reason: ScanResult['rejectReason'];
  label: string;
  guidance: string;
  severity: 'medium' | 'high';
  icon: string;
}> = [
  {
    reason: 'Low Confidence',
    label: 'Độ tin cậy thấp',
    guidance:
      'Phổ hồng ngoại không khớp rõ ràng với loại nhựa nào (độ chính xác < 85%). Hãy thử đặt vật phẩm ngay ngắn hơn hoặc xoay mặt nhựa sạch về phía cảm biến.',
    severity: 'medium',
    icon: '⚠️',
  },
  {
    reason: 'OOD Material',
    label: 'Vật liệu ngoài danh mục',
    guidance:
      'Vật phẩm có thể là nhựa composite, polycarbonate, ABS hoặc vật liệu không phải nhựa — trạm PCS hiện chỉ nhận PET, PE, PP, PS và PVC. Vui lòng không bỏ vào kiosk.',
    severity: 'high',
    icon: '🚫',
  },
  {
    reason: 'Dirty/Wet',
    label: 'Bề mặt bẩn hoặc ướt',
    guidance:
      'Cảm biến FTIR không thể đọc qua lớp bẩn, dầu mỡ hoặc nước đọng. Hãy rửa sạch vật phẩm, lau khô bề mặt và thử lại. Trạm có sẵn vòi khí nén hỗ trợ làm sạch nhanh.',
    severity: 'medium',
    icon: '💧',
  },
  {
    reason: 'Mixed/Composite',
    label: 'Nhựa hỗn hợp / composite',
    guidance:
      'Phổ đo cho thấy nhiều lớp polymer chồng nhau không thể phân tách cơ học (ví dụ: màng nhiều lớp, vỉ nhựa-nhôm). Loại này không thể tái chế cơ học — vui lòng bỏ vào thùng rác thông thường.',
    severity: 'high',
    icon: '🔀',
  },
];

// ── PASS scenario data ────────────────────────────────────────────────────────
const PASS_RESULT: ScanResult = {
  status: 'PASS',
  confidenceScore: 98.7,
  materialDetected: 'PET',
  pointsAwarded: 25,
};

const AUTO_RESET_MS = 5000; // 5 seconds (confirmed in QA turn)
const POINTS_AWARDED_PASS = 25;

export function KioskModal() {
  const { phase, scanResult, setResult, resetKiosk, openKiosk } = useKioskStore();
  const addPoints = useWalletStore((s) => s.addPoints);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [burstTrigger, setBurstTrigger] = useState<boolean>(false);
  const [burstOrigin, setBurstOrigin] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  /** Tracks seconds remaining in the 5s auto-reset for the visual progress bar */
  const [autoResetSecondsLeft, setAutoResetSecondsLeft] = useState<number>(5);

  // ── Refs ──────────────────────────────────────────────────────────────────
  /**
   * hasResultedRef — event-level double-click guard for RESULT buttons.
   * Separate from the QR timer lock in QrDisplayModule.
   * Once true, PASS and REJECT buttons are STRICTLY IGNORED — no cancel,
   * no switch (per approved strict-determinism QA confirmation).
   */
  const hasResultedRef = useRef<boolean>(false);
  /**
   * autoResetTimeoutRef — stores the 5s auto-reset setTimeout ID.
   * useRef so the ID is never stale inside the cleanup call.
   * clearTimeout(autoResetTimeoutRef.current) is called in handleClose() so a
   * pending auto-reset NEVER fires after a manual close.
   */
  const autoResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoResetIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Open/Close handlers ───────────────────────────────────────────────────
  const handleOpen = useCallback(() => {
    openKiosk('HCM-01');
    setIsOpen(true);
  }, [openKiosk]);

  /**
   * handleClose — unified cleanup for Close button AND auto-reset timeout.
   *
   * ORDER:
   *   1. clearTimeout / clearInterval for auto-reset (prevent ghost fire)
   *   2. resetKiosk()  — RESET side-effect: clears token, returns to IDLE atomically
   *   3. setIsOpen(false) — hide the modal
   *
   * RESET is NOT a UI state: steps 2 & 3 happen synchronously in the same
   * call, so React renders IDLE state (no modal) in a single commit — zero flicker.
   */
  const handleClose = useCallback(() => {
    // 1. Cancel any pending auto-reset (belt-and-suspenders)
    if (autoResetTimeoutRef.current !== null) {
      clearTimeout(autoResetTimeoutRef.current);
      autoResetTimeoutRef.current = null;
    }
    if (autoResetIntervalRef.current !== null) {
      clearInterval(autoResetIntervalRef.current);
      autoResetIntervalRef.current = null;
    }
    // 2. Atomic RESET: clear token, scanResult, return to IDLE
    resetKiosk();
    // 3. Reset local component state
    hasResultedRef.current = false;
    setBurstTrigger(false);
    setAutoResetSecondsLeft(5);
    // 4. Close the modal — React commits IDLE state, no intermediate render
    setIsOpen(false);
  }, [resetKiosk]);

  // ── RESULT button handlers ────────────────────────────────────────────────
  const handlePass = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // hasResultedRef guard — STRICTLY IGNORED if already resulted (QA confirmation #3)
      if (hasResultedRef.current) return;
      hasResultedRef.current = true; // lock immediately — before any async

      setResult(PASS_RESULT);
      addPoints(POINTS_AWARDED_PASS, 'Thu gom nhựa tại trạm PCS HCM-01 (PET, 98.7%)');

      // Fire particle burst from the button position
      const rect = e.currentTarget.getBoundingClientRect();
      setBurstOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      setBurstTrigger(true);
    },
    [setResult, addPoints]
  );

  const handleReject = useCallback(
    (scenario: (typeof REJECT_SCENARIOS)[number]) => {
      // hasResultedRef guard — STRICTLY IGNORED if already resulted
      if (hasResultedRef.current) return;
      hasResultedRef.current = true;

      setResult({
        status: 'REJECT',
        confidenceScore: scenario.reason === 'Low Confidence' ? 62.4 : 0,
        rejectReason: scenario.reason,
        pointsAwarded: 0,
      });
    },
    [setResult]
  );

  // ── 5s auto-reset (Edge Case 7) ───────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'RESULT_PASS' && phase !== 'RESULT_REJECT') return;

    // Reset the visual countdown
    setAutoResetSecondsLeft(5);

    // Visual countdown tick
    const intervalId = setInterval(() => {
      setAutoResetSecondsLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    autoResetIntervalRef.current = intervalId;

    // Auto-reset timeout — fires handleClose() (same function as manual Close)
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      autoResetIntervalRef.current = null;
      handleClose();
    }, AUTO_RESET_MS);
    autoResetTimeoutRef.current = timeoutId;

    // Cleanup: if user manually closes before 5s, both are cleared in handleClose()
    // This cleanup fires if the effect re-runs (phase changes) for safety
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [phase, handleClose]);

  // Reset hasResultedRef when phase returns to SIMULATED_SCAN (shouldn't happen
  // per state machine, but defensive reset in case store is modified externally)
  useEffect(() => {
    if (phase === 'SIMULATED_SCAN') {
      hasResultedRef.current = false;
    }
  }, [phase]);

  // ── Particle burst cleanup ────────────────────────────────────────────────
  const handleBurstComplete = useCallback(() => {
    setBurstTrigger(false);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Particle burst — Module 7 PASS trigger (pcs-design-system §8, slot 1) */}
      <ParticleBurst
        trigger={burstTrigger}
        originPosition={burstOrigin}
        onComplete={handleBurstComplete}
        color="var(--kiosk-pass)"
      />

      {/* ── Trigger button (visible on the Kiosk page) ── */}
      <motion.button
        id="kiosk-open-modal-btn"
        type="button"
        onClick={handleOpen}
        className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--primary-emerald)] via-[var(--neon-mint)] to-cyan-400 px-6 py-5 text-white shadow-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={MOTION_TOKENS.spring.standard}
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-xs font-medium opacity-80">Trạm PCS · HCM-01</p>
            <h3 className="text-lg font-bold">Bắt đầu tái chế</h3>
            <p className="text-xs opacity-70">Quét QR để xác thực vật phẩm</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
            ♻️
          </div>
        </div>
      </motion.button>

      {/* ── Modal overlay ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION_TOKENS.durations.base }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
            onClick={(e) => {
              // Close on backdrop click
              if (e.target === e.currentTarget) handleClose();
            }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0, scale: 0.97 }}
              transition={{
                duration: MOTION_TOKENS.durations.slow,
                ease: MOTION_TOKENS.easing.enter,
              }}
              className="relative w-full max-w-[390px] overflow-hidden rounded-t-3xl bg-background pb-8 sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── SIMULATION MODE badge — ALWAYS visible, per spec ── */}
              <div className="absolute left-4 top-4 z-10">
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--warning-amber)] bg-[var(--warning-amber)]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--warning-amber)]">
                  <Zap className="h-2.5 w-2.5" />
                  Chế độ Mô phỏng
                </span>
              </div>

              {/* ── Close button — ALWAYS visible, per spec ── */}
              <button
                id="kiosk-close-btn"
                type="button"
                onClick={handleClose}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-border/60 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
                aria-label="Đóng kiosk"
              >
                <X className="h-4 w-4" />
              </button>

              {/* ── Modal content (phase-driven) ── */}
              <div className="mt-0 px-5 pt-14">
                <AnimatePresence mode="wait">
                  {/* ── QR_DISPLAY phase ── */}
                  {phase === 'QR_DISPLAY' && (
                    <motion.div
                      key="qr-display"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{
                        duration: MOTION_TOKENS.durations.base,
                        ease: MOTION_TOKENS.easing.standard,
                      }}
                    >
                      <div className="mb-4 text-center">
                        <h2 className="text-lg font-bold text-foreground">
                          Quét QR để xác nhận
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Đây là mã phiên mô phỏng — trong thực tế, thiết bị của bạn
                          sẽ kết nối với máy chủ PCS để xác thực.
                        </p>
                      </div>
                      <QrDisplayModule renderTarget="screen" />
                    </motion.div>
                  )}

                  {/* ── SIMULATED_SCAN phase ── */}
                  {phase === 'SIMULATED_SCAN' && (
                    <motion.div
                      key="simulated-scan"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{
                        duration: MOTION_TOKENS.durations.base,
                        ease: MOTION_TOKENS.easing.standard,
                      }}
                      className="flex flex-col items-center gap-5 py-4"
                    >
                      {/* Scanning animation */}
                      <div className="relative flex h-24 w-24 items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--primary-emerald)]"
                        />
                        <span className="text-4xl">🔬</span>
                      </div>

                      <div className="text-center">
                        <h2 className="text-lg font-bold text-foreground">
                          Đang phân tích mẫu…
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Cảm biến FTIR đang đọc phổ hồng ngoại của vật phẩm.
                          Người trình bày chọn kết quả bên dưới để tiếp tục demo.
                        </p>
                      </div>

                      {/* Debug controls */}
                      <div className="w-full rounded-2xl border border-border bg-card p-4">
                        <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          🛠 Debug Controls
                        </p>

                        {/* PASS button */}
                        <motion.button
                          id="kiosk-pass-btn"
                          type="button"
                          onClick={handlePass}
                          className="mb-2 w-full rounded-xl bg-[var(--kiosk-pass)] px-4 py-3 text-sm font-bold text-white hover:opacity-90 active:scale-[0.98]"
                          whileTap={{ scale: 0.97 }}
                          transition={{ duration: MOTION_TOKENS.durations.fast }}
                        >
                          ✅ PASS — PET · 98.7%
                        </motion.button>

                        {/* REJECT buttons (4 distinct reasons) */}
                        <div className="flex flex-col gap-2">
                          {REJECT_SCENARIOS.map((scenario) => (
                            <motion.button
                              key={scenario.reason}
                              id={`kiosk-reject-btn-${scenario.reason?.toLowerCase().replace(/[\s/]/g, '-')}`}
                              type="button"
                              onClick={() => handleReject(scenario)}
                              className={`w-full rounded-xl px-4 py-2.5 text-left text-xs font-medium text-white hover:opacity-90 active:scale-[0.98] ${
                                scenario.severity === 'high'
                                  ? 'bg-[var(--error-rose)]'
                                  : 'bg-[var(--warning-amber)]'
                              }`}
                              whileTap={{ scale: 0.97 }}
                              transition={{ duration: MOTION_TOKENS.durations.fast }}
                            >
                              {scenario.icon} REJECT · {scenario.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── RESULT_PASS phase ── */}
                  {phase === 'RESULT_PASS' && scanResult && (
                    <motion.div
                      key="result-pass"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        duration: MOTION_TOKENS.durations.slow,
                        ease: MOTION_TOKENS.easing.enter,
                      }}
                      className="flex flex-col items-center gap-4 py-4"
                    >
                      {/* Success icon */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          ...MOTION_TOKENS.spring.bouncy,
                          delay: 0.1,
                        }}
                        className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--kiosk-pass)]/15"
                      >
                        <CheckCircle2
                          className="h-12 w-12"
                          style={{ color: 'var(--kiosk-pass)' }}
                        />
                      </motion.div>

                      <div className="text-center">
                        <h2
                          className="text-2xl font-bold"
                          style={{ color: 'var(--kiosk-pass)' }}
                        >
                          Chấp nhận! ✨
                        </h2>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {scanResult.materialDetected} · {scanResult.confidenceScore}% tin cậy
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Vật phẩm phù hợp tiêu chuẩn tái chế cơ học. Cảm ơn bạn!
                        </p>
                      </div>

                      {/* Points awarded */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: MOTION_TOKENS.durations.base,
                          delay: 0.3,
                        }}
                        className="flex items-center gap-2 rounded-2xl bg-[var(--kiosk-pass)]/10 px-6 py-3"
                      >
                        <span className="text-2xl">🌿</span>
                        <div>
                          <p className="text-xs text-muted-foreground">Điểm thưởng nhận được</p>
                          <p
                            className="text-2xl font-bold"
                            style={{ color: 'var(--kiosk-pass)' }}
                          >
                            +{scanResult.pointsAwarded} điểm
                          </p>
                        </div>
                      </motion.div>

                      <AutoResetIndicator secondsLeft={autoResetSecondsLeft} variant="pass" />

                      <button
                        id="kiosk-close-pass-btn"
                        type="button"
                        onClick={handleClose}
                        className="w-full rounded-xl bg-[var(--kiosk-pass)] px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
                      >
                        Hoàn tất · Đóng
                      </button>
                    </motion.div>
                  )}

                  {/* ── RESULT_REJECT phase ── */}
                  {phase === 'RESULT_REJECT' && scanResult && (
                    <motion.div
                      key="result-reject"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        duration: MOTION_TOKENS.durations.slow,
                        ease: MOTION_TOKENS.easing.enter,
                      }}
                      className="flex flex-col items-center gap-4 py-4"
                    >
                      {/* Find the matching scenario for the reject reason */}
                      {(() => {
                        const scenario = REJECT_SCENARIOS.find(
                          (s) => s.reason === scanResult.rejectReason
                        );
                        const isHigh = scenario?.severity === 'high';
                        const color = isHigh
                          ? 'var(--error-rose)'
                          : 'var(--warning-amber)';

                        return (
                          <>
                            {/* Reject icon */}
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                ...MOTION_TOKENS.spring.bouncy,
                                delay: 0.1,
                              }}
                              className="flex h-20 w-20 items-center justify-center rounded-full"
                              style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
                            >
                              {isHigh ? (
                                <XCircle
                                  className="h-12 w-12"
                                  style={{ color }}
                                />
                              ) : (
                                <AlertTriangle
                                  className="h-12 w-12"
                                  style={{ color }}
                                />
                              )}
                            </motion.div>

                            <div className="text-center">
                              <h2
                                className="text-xl font-bold"
                                style={{ color }}
                              >
                                {scenario?.icon} {scenario?.label ?? 'Từ chối'}
                              </h2>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Vật phẩm không đạt tiêu chuẩn nhận vào hệ thống tái chế PCS.
                              </p>
                            </div>

                            {/* Unique guidance message per reject reason */}
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: MOTION_TOKENS.durations.base,
                                delay: 0.2,
                              }}
                              className="w-full rounded-2xl border p-4 text-sm leading-relaxed text-foreground"
                              style={{
                                borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
                                backgroundColor: `color-mix(in srgb, ${color} 6%, transparent)`,
                              }}
                            >
                              {scenario?.guidance}
                            </motion.div>

                            <AutoResetIndicator
                              secondsLeft={autoResetSecondsLeft}
                              variant="reject"
                            />

                            <button
                              id="kiosk-close-reject-btn"
                              type="button"
                              onClick={handleClose}
                              className="w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-card"
                            >
                              Đóng · Thử vật phẩm khác
                            </button>
                          </>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── AutoResetIndicator — visual 5s countdown for unattended kiosk ─────────────
function AutoResetIndicator({
  secondsLeft,
  variant,
}: {
  secondsLeft: number;
  variant: 'pass' | 'reject';
}) {
  const color = variant === 'pass' ? 'var(--kiosk-pass)' : 'var(--warning-amber)';
  const progress = (secondsLeft / 5) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground">
          Tự động đóng sau {secondsLeft}s
        </p>
        <span className="text-[10px] font-medium" style={{ color }}>
          {secondsLeft}
        </span>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color, width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.9, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
