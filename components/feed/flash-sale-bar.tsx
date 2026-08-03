'use client';

/**
 * FlashSaleBar — Module 3 real-time countdown banner.
 *
 * ACCURACY GUARANTEE:
 *   - Uses a FIXED epoch anchor (`endsAt` ms from Date.now() at module load).
 *   - The interval callback always computes remaining = endsAt - Date.now().
 *   - This means tab-switching or system sleep never causes drift — the next
 *     tick after wakeup reads the real wall-clock time.
 *   - No accumulated state, no start+elapsed pattern.
 *
 * Acceptance criteria: switching tabs for 10 s and returning must not drift.
 */

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';
import { FLASH_SALE_ENDS_AT } from '@/lib/mock-data';
import { MOTION_TOKENS } from '@/lib/motion-tokens';

/** Recompute remaining seconds directly from the real wall clock. Never drifts. */
function computeRemaining(endsAt: number): number {
  return Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
}

function formatTime(totalSeconds: number): { h: string; m: string; s: string } {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    s: String(s).padStart(2, '0'),
  };
}

function DigitBlock({ value }: { value: string }) {
  return (
    <motion.div
      key={value}
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm font-mono font-bold text-white text-base tabular-nums shadow-inner border border-white/10"
      initial={{ y: -6, opacity: 0.6 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: MOTION_TOKENS.durations.fast, ease: MOTION_TOKENS.easing.enter }}
    >
      {value}
    </motion.div>
  );
}

export function FlashSaleBar() {
  const [remaining, setRemaining] = useState<number>(() =>
    computeRemaining(FLASH_SALE_ENDS_AT)
  );

  // Recompute directly from wall clock — no drift even after tab wakeup.
  const tick = useCallback(() => {
    setRemaining(computeRemaining(FLASH_SALE_ENDS_AT));
  }, []);

  useEffect(() => {
    if (remaining <= 0) return;

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [remaining, tick]);

  const { h, m, s } = formatTime(remaining);
  const isExpired = remaining <= 0;

  return (
    <motion.div
      className="mx-4 rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION_TOKENS.durations.base, ease: MOTION_TOKENS.easing.enter }}
    >
      <div
        className="relative flex items-center justify-between px-4 py-3"
        style={{
          background:
            'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #dc2626 100%)',
        }}
      >
        {/* Animated background shimmer */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
          }}
        />

        {/* Left: icon + label */}
        <div className="relative flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Zap className="h-5 w-5 text-yellow-200 fill-yellow-200" />
          </motion.div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">
              Flash Sale
            </p>
            <p className="text-white/80 text-[10px]">
              {isExpired ? 'Đã kết thúc' : 'Kết thúc sau'}
            </p>
          </div>
        </div>

        {/* Right: countdown digits */}
        {isExpired ? (
          <span className="relative text-white/80 text-sm font-medium">
            Hết hạn
          </span>
        ) : (
          <div className="relative flex items-center gap-1">
            <DigitBlock value={h} />
            <span className="text-white font-bold text-sm">:</span>
            <DigitBlock value={m} />
            <span className="text-white font-bold text-sm">:</span>
            <DigitBlock value={s} />
            <ChevronRight className="h-4 w-4 text-white/70 ml-1" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
