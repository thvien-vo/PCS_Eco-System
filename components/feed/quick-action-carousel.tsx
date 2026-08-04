'use client';

/**
 * QuickActionCarousel — Module 3 horizontal quick-action strip + tier progress bar.
 *
 * Actions: Scan, Giới thiệu, Thử thách, Bảng xếp hạng, Ví xanh.
 * Membership progress: Green Member → Green Hero.
 */

import { motion } from 'framer-motion';
import {
  ScanLine,
  Users,
  Swords,
  Trophy,
  Wallet,
  Star,
  Gift,
} from 'lucide-react';
import Link from 'next/link';
import { MEMBER_TIER_INFO } from '@/lib/mock-data';
import { MOTION_TOKENS } from '@/lib/motion-tokens';
import { useDragScroll } from '@/hooks/use-drag-scroll';

const QUICK_ACTIONS = [
  {
    id: 'scan',
    label: 'Quét nhựa',
    icon: ScanLine,
    href: '/kiosk',
    bg: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-200 dark:shadow-emerald-900',
  },
  {
    id: 'refer',
    label: 'Giới thiệu',
    icon: Users,
    href: '#',
    bg: 'from-cyan-500 to-blue-500',
    shadow: 'shadow-cyan-200 dark:shadow-cyan-900',
  },
  {
    id: 'challenge',
    label: 'Thử thách',
    icon: Swords,
    href: '/challenge',
    bg: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-200 dark:shadow-violet-900',
  },
  {
    id: 'leaderboard',
    label: 'Bảng xếp hạng',
    icon: Trophy,
    href: '/challenge',
    bg: 'from-amber-400 to-orange-500',
    shadow: 'shadow-amber-200 dark:shadow-amber-900',
  },
  {
    id: 'wallet',
    label: 'Ví xanh',
    icon: Wallet,
    href: '/wallet',
    bg: 'from-green-500 to-emerald-600',
    shadow: 'shadow-green-200 dark:shadow-green-900',
  },
  {
    id: 'gift',
    label: 'Tặng quà',
    icon: Gift,
    href: '#',
    bg: 'from-rose-400 to-pink-500',
    shadow: 'shadow-rose-200 dark:shadow-rose-900',
  },
];

const TIER_LABELS: Record<string, { label: string; icon: typeof Star }> = {
  'Green Member': { label: 'Thành Viên Xanh', icon: Star },
  'Green Hero': { label: 'Anh Hùng Xanh', icon: Trophy },
};

export function QuickActionCarousel() {
  const tier = MEMBER_TIER_INFO;
  const progress = Math.min(
    (tier.currentPoints / tier.pointsForNext) * 100,
    100
  );

  const currentTierMeta = TIER_LABELS[tier.current];
  const nextTierMeta = tier.next ? TIER_LABELS[tier.next] : null;
  const CurrentIcon = currentTierMeta.icon;

  /**
   * Bug fix: mouse click-drag horizontal scrolling.
   * Per pcs-tech-standards §12 — mandatory for all horizontal carousel strips.
   * useDragScroll handles the 5px threshold and click-suppression so Link
   * navigation continues to work on plain clicks.
   */
  const {
    ref: dragRef,
    onMouseDown: onDragMouseDown,
    onMouseMove: onDragMouseMove,
    onMouseUp: onDragMouseUp,
    onMouseLeave: onDragMouseLeave,
    onClickCapture: onDragClickCapture,
  } = useDragScroll();

  return (
    <div className="px-4 py-3 space-y-4">
      {/* ── Membership Tier Progress Bar ── */}
      <motion.div
        className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-100 dark:border-emerald-800/30 p-4"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION_TOKENS.durations.base, ease: MOTION_TOKENS.easing.enter }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md">
              <CurrentIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {currentTierMeta.label}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {tier.currentPoints.toLocaleString('vi-VN')} điểm
              </p>
            </div>
          </div>
          {nextTierMeta && (
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Kế tiếp</p>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {nextTierMeta.label}
              </p>
            </div>
          )}
        </div>

        {/* Progress track */}
        <div className="relative h-2.5 w-full rounded-full bg-emerald-100 dark:bg-emerald-900/40 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
            style={{ boxShadow: '0 0 8px rgba(16,185,129,0.5)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: MOTION_TOKENS.durations.slow, ease: MOTION_TOKENS.easing.enter, delay: 0.2 }}
          />
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              animation: 'shimmer 2s infinite',
            }}
          />
        </div>

        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">
            {tier.currentPoints.toLocaleString('vi-VN')} / {tier.pointsForNext.toLocaleString('vi-VN')} điểm
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            {Math.round(progress)}%
          </span>
        </div>
      </motion.div>

      {/* ── Quick Action Carousel ── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-0.5">
          Thao tác nhanh
        </p>
        <div
          ref={dragRef as React.RefObject<HTMLDivElement>}
          onMouseDown={onDragMouseDown}
          onMouseMove={onDragMouseMove}
          onMouseUp={onDragMouseUp}
          onMouseLeave={onDragMouseLeave}
          onClickCapture={onDragClickCapture}
          className="flex gap-3 overflow-x-auto scrollbar-hide cursor-grab pb-1"
        >
          {QUICK_ACTIONS.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: MOTION_TOKENS.durations.base,
                  delay: index * 0.06,
                  ease: MOTION_TOKENS.easing.enter,
                }}
                className="flex-shrink-0"
              >
                <Link href={action.href} className="flex flex-col items-center gap-1.5 group">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${action.bg} shadow-md ${action.shadow} transition-all duration-150 group-hover:scale-110 group-active:scale-95`}
                    style={{ minWidth: 48, minHeight: 48 }}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-foreground/70 text-center leading-tight max-w-[52px]">
                    {action.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
