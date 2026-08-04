'use client';

/**
 * Module 5 — Swipe Challenge & Gamification page.
 *
 * HYDRATION SAFETY:
 * This component reads from two Zustand stores:
 *   1. useWalletStore  — uses `persist` middleware → MUST guard with hasMounted
 *   2. useChallengeStore — no persist → safe to read immediately, but we still
 *      gate the full UI behind hasMounted for consistency and to avoid any
 *      server/client mismatch on the wallet points display.
 *
 * QUEUE ALGORITHM:
 *   - Initial queue = MOCK_CHALLENGES filtered to exclude already-confirmed IDs.
 *   - Swipe LEFT  → remove from front, re-insert at Math.min(N=5, rest.length).
 *     Edge case: fewer than 5 remaining → appended to END of queue naturally.
 *   - Swipe RIGHT → show confirmation modal. Queue NOT mutated.
 *   - Cancel modal → `pendingCard` set to null. Queue NOT mutated (card stays at front).
 *   - Confirm      → id added to inProgressIds, card permanently filtered from queue.
 *   - DUPLICATE GUARD: useChallengeStore.addToInProgress is idempotent; additionally
 *     the queue itself is filtered on init and on every confirm, so a confirmed
 *     card ID can NEVER re-appear in the swipeable queue.
 *
 * Per pcs-design-system §2 (Vietnamese UI text) and pcs-tech-standards §10 (hydration).
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Layers } from 'lucide-react';

import { useHasMounted } from '@/hooks/use-has-mounted';
import { useWalletStore } from '@/store/wallet-store';
import { useChallengeStore } from '@/store/challenge-store';
import { MOCK_CHALLENGES, MOCK_TRANSACTIONS } from '@/lib/mock-data';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { SwipeCardStack } from '@/components/challenge/swipe-card-stack';
import { ConfirmModal } from '@/components/challenge/confirm-modal';
import { InProgressList } from '@/components/challenge/in-progress-list';
import { Leaderboard } from '@/components/challenge/leaderboard';
import type { ChallengeCard } from '@/types';
import { MOTION_TOKENS } from '@/lib/motion-tokens';
import { cn } from '@/lib/utils';

// ── Constants ─────────────────────────────────────────────────────────────────
/** Number of positions to skip before re-inserting a swiped-left card. */
const SKIP_OFFSET = 5;

type MainTab = 'swipe' | 'leaderboard';
type LeaderboardTab = 'weekly' | 'monthly';

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ChallengeSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <LoadingSkeleton type="card" />
      <div className="flex gap-2">
        <div className="h-10 flex-1 animate-pulse rounded-2xl bg-border/60" />
        <div className="h-10 flex-1 animate-pulse rounded-2xl bg-border/60" />
      </div>
      <div className="mx-auto h-[380px] w-[280px] animate-pulse rounded-3xl bg-border/60" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ChallengePage() {
  // ── Hydration guard (per pcs-tech-standards §10a) ──────────────────────────
  const hasMounted = useHasMounted();

  // ── Store reads ────────────────────────────────────────────────────────────
  // NOTE: Do NOT read wallet `points` before hasMounted — it would cause
  //       a React hydration mismatch because SSR renders the default 500 pts
  //       while the client may have a different persisted value.
  const { points: walletPoints, seedDemoTransactions } = useWalletStore();
  const { inProgressIds, addToInProgress } = useChallengeStore();

  // Seed demo wallet data (same pattern as wallet page)
  useEffect(() => {
    if (hasMounted) {
      seedDemoTransactions(MOCK_TRANSACTIONS);
    }
  }, [hasMounted, seedDemoTransactions]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [mainTab, setMainTab] = useState<MainTab>('swipe');
  const [leaderboardTab, setLeaderboardTab] = useState<LeaderboardTab>('weekly');

  /**
   * pendingCard — set when user swipes right.
   * null = modal hidden; non-null = modal showing for this card.
   * The queue is NOT mutated until the user confirms (or cancels).
   */
  const [pendingCard, setPendingCard] = useState<ChallengeCard | null>(null);

  /**
   * queue — ordered array; index 0 = top (front) of the stack.
   *
   * Initialized by filtering MOCK_CHALLENGES to exclude already-confirmed IDs.
   * This prevents previously-confirmed challenges from re-entering the queue
   * even if the component remounts (e.g., navigating away and back).
   */
  const [queue, setQueue] = useState<ChallengeCard[]>(() =>
    MOCK_CHALLENGES.filter((c) => !inProgressIds.includes(c.id))
  );

  // Ensure queue stays clean whenever inProgressIds changes
  // (e.g., if addToInProgress was called from elsewhere)
  useEffect(() => {
    setQueue((prev) => prev.filter((c) => !inProgressIds.includes(c.id)));
  }, [inProgressIds]);

  // ── Derived: full card objects for in-progress IDs ─────────────────────────
  const inProgressCards = useMemo(
    () => MOCK_CHALLENGES.filter((c) => inProgressIds.includes(c.id)),
    [inProgressIds]
  );

  // ── Queue handlers ─────────────────────────────────────────────────────────

  /**
   * handleSwipeLeft — "Skip" action.
   *
   * Removes the top card and re-inserts it at position Math.min(SKIP_OFFSET, rest.length).
   * When rest.length < SKIP_OFFSET, Math.min naturally yields rest.length,
   * which is the END of the array — the edge case is handled without a special branch.
   */
  function handleSwipeLeft(card: ChallengeCard) {
    setQueue((prev) => {
      const rest = prev.slice(1); // remove top card
      const insertAt = Math.min(SKIP_OFFSET, rest.length); // edge case handled
      return [...rest.slice(0, insertAt), card, ...rest.slice(insertAt)];
    });
  }

  /**
   * handleSwipeRight — "Join" action.
   * Shows confirmation modal WITHOUT mutating the queue yet.
   * If the user cancels, the card is still at the front.
   */
  function handleSwipeRight(card: ChallengeCard) {
    setPendingCard(card);
  }

  /**
   * handleConfirm — user accepted the challenge.
   *
   * DUPLICATE-ADD GUARD: checked both here and inside addToInProgress.
   * After adding, permanently filter the card out of the swipe queue.
   */
  function handleConfirm() {
    if (!pendingCard) return;
    // Guard: do not add if already confirmed (shouldn't happen, but be defensive)
    if (!inProgressIds.includes(pendingCard.id)) {
      addToInProgress(pendingCard.id);
    }
    // Permanently remove from queue — card can never be swiped again
    setQueue((prev) => prev.filter((c) => c.id !== pendingCard.id));
    setPendingCard(null);
  }

  /**
   * handleCancel — user dismissed the modal.
   * Queue is NOT touched; pendingCard is still at the front.
   */
  function handleCancel() {
    setPendingCard(null);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!hasMounted) {
    return <ChallengeSkeleton />;
  }

  const mainTabs: { key: MainTab; label: string; icon: React.ReactNode }[] = [
    { key: 'swipe', label: 'Thử thách', icon: <Layers className="h-4 w-4" /> },
    { key: 'leaderboard', label: 'Bảng xếp hạng', icon: <Trophy className="h-4 w-4" /> },
  ];

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint-pop">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Thử thách & Gamification</h1>
            <p className="text-xs text-muted-foreground">
              Tích điểm · Vô địch · Nhận phần thưởng
            </p>
          </div>
        </div>

        {/* ── Main Tab Switcher ─────────────────────────────────────────── */}
        <div className="relative flex rounded-2xl border border-border bg-card/60 p-1">
          {mainTabs.map((tab) => (
            <button
              key={tab.key}
              id={`challenge-main-tab-${tab.key}`}
              onClick={() => setMainTab(tab.key)}
              className={cn(
                'relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-colors duration-150',
                mainTab === tab.key ? 'text-white' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {mainTab === tab.key && (
                <motion.div
                  layoutId="challenge-main-tab-indicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--primary-emerald)] to-[var(--neon-mint)]"
                  transition={MOTION_TOKENS.spring.standard}
                />
              )}
              <span className="relative">{tab.icon}</span>
              <span className="relative">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ───────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {mainTab === 'swipe' ? (
            <motion.div
              key="swipe-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: MOTION_TOKENS.durations.base, ease: MOTION_TOKENS.easing.standard }}
              className="flex flex-col gap-5"
            >
              {/* In-progress section */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground">Đang thực hiện</h2>
                  {inProgressCards.length > 0 && (
                    <span className="rounded-full bg-[var(--neon-mint)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--neon-mint)]">
                      {inProgressCards.length} thử thách
                    </span>
                  )}
                </div>
                <InProgressList inProgressCards={inProgressCards} />
              </div>

              {/* Swipe card section */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground">Khám phá thử thách</h2>
                  {queue.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {queue.length} thẻ còn lại
                    </span>
                  )}
                </div>

                {/* Swipe hints */}
                <div className="mb-3 flex items-center justify-center gap-6 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-[var(--error-rose)]" />
                    Vuốt trái = Bỏ qua
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-[var(--kiosk-pass)]" />
                    Vuốt phải = Tham gia
                  </div>
                </div>

                {/* Card stack — centered */}
                <div className="flex justify-center">
                  <SwipeCardStack
                    cards={queue}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="leaderboard-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: MOTION_TOKENS.durations.base, ease: MOTION_TOKENS.easing.standard }}
            >
              {/*
               * LIVE WALLET INTEGRATION:
               * walletPoints is read from useWalletStore (persisted, real data from
               * Module 4/7 interactions). Passed to Leaderboard which replaces the
               * mock isCurrentUser placeholder — ensuring consistency with Green Wallet.
               */}
              <Leaderboard
                liveUserPoints={walletPoints}
                activeTab={leaderboardTab}
                onTabChange={setLeaderboardTab}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Confirmation Modal (portal-like, outside scroll container) ─── */}
      <ConfirmModal
        card={pendingCard}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
