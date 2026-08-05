'use client';

/**
 * SwipeCardStack — Module 5 Swipe Challenge component.
 *
 * Renders the top 2 cards of the queue in a stacked visual.
 * - Drag RIGHT  → `onSwipeRight(card)` — caller shows confirmation modal.
 * - Drag LEFT   → `onSwipeLeft(card)`  — caller re-inserts card at position N=5.
 *
 * AnimatePresence + exit prop ensures the card FLIES off screen rather than
 * disappearing abruptly (per Senior Engineer requirement #1).
 *
 * Motion constants imported from lib/motion-tokens.ts (per pcs-tech-standards §4).
 */

import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Star, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ChallengeCard } from '@/types';
import { MOTION_TOKENS } from '@/lib/motion-tokens';

// ── Constants ─────────────────────────────────────────────────────────────────
/** Horizontal drag distance (px) required to trigger a swipe action. */
const SWIPE_THRESHOLD = 100;
/** Card dimensions — matches the aspect ratio used in the queue. */
const CARD_WIDTH = 280;
const CARD_HEIGHT = 380;

// ── Queue Position Badge ─────────────────────────────────────────────────────
/**
 * Renders a frosted-glass pill at the top-left of a card showing:
 *   "#1 · Chiến Binh Rác Thải"
 *
 * Purpose: lets the tester verify queue order at a glance during Test 2
 * (skip wrap-around) without having to guess card positions.
 * The name is truncated to 14 chars to fit on the pill width.
 */
function QueuePositionBadge({ position, name }: { position: number; name: string }) {
  const short = name.length > 14 ? name.slice(0, 13) + '…' : name;
  return (
    <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
      <span className="text-[10px] font-black text-[var(--neon-mint)]">#{position}</span>
      <span className="text-[10px] font-medium text-white/90">{short}</span>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface SwipeCardStackProps {
  /** Ordered queue of cards; index 0 = top of stack (front). */
  cards: ChallengeCard[];
  onSwipeRight: (card: ChallengeCard) => void;
  onSwipeLeft: (card: ChallengeCard) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function SwipeHint({ direction }: { direction: 'left' | 'right' }) {
  return (
    <div
      className={`absolute inset-y-0 ${direction === 'right' ? 'right-3' : 'left-3'} flex items-center`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md ${
          direction === 'right'
            ? 'bg-[var(--primary-emerald)] text-white'
            : 'bg-[var(--error-rose)] text-white'
        }`}
      >
        {direction === 'right' ? (
          <ChevronRight className="h-5 w-5" />
        ) : (
          <ChevronLeft className="h-5 w-5" />
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function SwipeCardStack({ cards, onSwipeRight, onSwipeLeft }: SwipeCardStackProps) {
  /**
   * swipeDirection tracks the direction of the CURRENT drag so the
   * exit animation can fly the card off in the correct direction.
   */
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Framer Motion values for rotation and overlay opacity
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const acceptOpacity = useTransform(x, [50, 150], [0, 1]);
  const skipOpacity = useTransform(x, [-150, -50], [1, 0]);

  if (cards.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 text-center"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald/10">
          <Star className="h-8 w-8 text-emerald" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-semibold text-foreground">Hết thử thách rồi!</p>
        <p className="max-w-[200px] text-xs text-muted-foreground">
          Bạn đã xem qua tất cả thử thách. Hãy quay lại sau nhé.
        </p>
      </div>
    );
  }

  const topCard = cards[0];
  const secondCard = cards[1] ?? null;

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      setSwipeDirection('right');
      // Small timeout so AnimatePresence picks up the key change after state update
      setTimeout(() => {
        onSwipeRight(topCard);
        setSwipeDirection(null);
      }, 0);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      setSwipeDirection('left');
      setTimeout(() => {
        onSwipeLeft(topCard);
        setSwipeDirection(null);
      }, 0);
    }
    // If threshold not met, Framer Motion spring snaps card back automatically.
  }

  return (
    <div className="relative" style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
      {/* ── Background card (Rank 2 in queue) ─────────────────────────── */}
      {secondCard && (
        <motion.div
          key={`bg-${secondCard.id}`}
          className="absolute inset-0 overflow-hidden rounded-3xl border border-border shadow-md"
          style={{
            backgroundImage: `url(${secondCard.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          initial={{ scale: 0.94, y: 12, opacity: 0.65 }}
          animate={{ scale: 0.94, y: 12, opacity: 0.65 }}
          transition={MOTION_TOKENS.spring.gentle}
        >
          {/* Queue position badge on background card — shows its queue position (#2) */}
          <QueuePositionBadge position={2} name={secondCard.name} />
        </motion.div>
      )}

      {/* ── Top card (draggable) ────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={topCard.id}
          className="absolute inset-0 cursor-grab overflow-hidden rounded-3xl shadow-xl active:cursor-grabbing"
          style={{ x, rotate }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          /**
           * EXIT ANIMATION — card flies off screen in the correct direction.
           * This prevents the abrupt disappear-on-swipe bug.
           * Per Senior Engineer requirement #1.
           */
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{
            x: swipeDirection === 'right' ? 500 : -500,
            opacity: 0,
            transition: {
              duration: MOTION_TOKENS.durations.base,
              ease: MOTION_TOKENS.easing.exit,
            },
          }}
          transition={MOTION_TOKENS.spring.bouncy}
          whileTap={{ cursor: 'grabbing' }}
        >
          {/* Queue position badge — top card is always position #1 */}
          <QueuePositionBadge position={1} name={topCard.name} />

          {/* Card image */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${topCard.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* ACCEPT overlay (green) — visible on right-drag */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center rounded-3xl border-4 border-[var(--kiosk-pass)] bg-[var(--kiosk-pass)]/20"
            style={{ opacity: acceptOpacity }}
          >
            <span className="rotate-[-20deg] rounded-xl border-4 border-[var(--kiosk-pass)] px-4 py-2 text-2xl font-black text-[var(--kiosk-pass)]">
              THAM GIA
            </span>
          </motion.div>

          {/* SKIP overlay (red) — visible on left-drag */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center rounded-3xl border-4 border-[var(--error-rose)] bg-[var(--error-rose)]/20"
            style={{ opacity: skipOpacity }}
          >
            <span className="rotate-[20deg] rounded-xl border-4 border-[var(--error-rose)] px-4 py-2 text-2xl font-black text-[var(--error-rose)]">
              BỎ QUA
            </span>
          </motion.div>

          {/* Card content */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="mb-2 text-xl font-bold text-white">{topCard.name}</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs text-white backdrop-blur-sm">
                <Clock className="h-3.5 w-3.5" />
                <span>Còn {topCard.deadline}</span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-[var(--neon-mint)]/30 px-3 py-1 text-xs font-bold text-[var(--neon-mint)] backdrop-blur-sm">
                <Star className="h-3.5 w-3.5" fill="currentColor" />
                <span>+{topCard.rewardPoints.toLocaleString()} điểm</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Swipe hint arrows (subtle) ──────────────────────────────────── */}
      <SwipeHint direction="left" />
      <SwipeHint direction="right" />
    </div>
  );
}
