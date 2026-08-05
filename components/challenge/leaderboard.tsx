'use client';

/**
 * Leaderboard — Module 5 gamification leaderboard component.
 *
 * Features:
 * - Weekly / Monthly tab switcher with smooth Framer Motion layout indicator.
 * - Top-3 Podium: Rank 2 (Left) | Rank 1 (Center, elevated) | Rank 3 (Right)
 *   laid out with Flexbox — NOT a vertical list.
 * - Fake-3D Badges using PURE CSS only:
 *   perspective, rotateX, conic-gradient, box-shadow layering.
 *   DO NOT use WebGL or Three.js — this is intentional. CSS-only 3D is sufficient
 *   for a mobile gamification UI and avoids a heavy dependency.
 * - Locked badges (rank 4+): dimmed (opacity 0.3) + grayscale filter.
 *   They remain VISIBLE as silhouettes — never hidden.
 * - Rank-change animations: each row carries a stable `layoutId` equal to the
 *   user's username. When `liveUserPoints` shifts the sort order, Framer Motion
 *   FLIP-animates every row to its new position using MOTION_TOKENS.spring.gentle
 *   — no instant jump, no custom numbers defined inline.
 *
 * Current user's points: injected from live wallet-store, NOT a mock.
 * The caller passes `liveUserPoints` which replaces the MOCK_LEADERBOARD placeholder.
 *
 * Per pcs-design-system §2 (100% Vietnamese UI text).
 * Per pcs-tech-standards §4 (all motion values from motion-tokens.ts).
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Medal, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_LEADERBOARD } from '@/lib/mock-data';
import type { LeaderboardEntry } from '@/types';
import { MOTION_TOKENS } from '@/lib/motion-tokens';

// ── Types ─────────────────────────────────────────────────────────────────────
type LeaderboardTab = 'weekly' | 'monthly';

interface LeaderboardProps {
  /** Live Green Points from wallet-store. Replaces the mock isCurrentUser entry. */
  liveUserPoints: number;
  activeTab: LeaderboardTab;
  onTabChange: (tab: LeaderboardTab) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Builds the final sorted leaderboard, replacing the mock current-user entry
 * with the live wallet-store points and re-ranking accordingly.
 *
 * This ensures the user's leaderboard score is ALWAYS in sync with the
 * Green Wallet total — never a disconnected mock value.
 */
function buildLiveLeaderboard(liveUserPoints: number): LeaderboardEntry[] {
  // Replace the isCurrentUser placeholder points with the live value
  const withLivePoints = MOCK_LEADERBOARD.map((entry) =>
    entry.isCurrentUser ? { ...entry, points: liveUserPoints } : entry
  );

  // Re-sort descending by points, then assign sequential ranks
  const sorted = [...withLivePoints].sort((a, b) => b.points - a.points);
  return sorted.map((entry, i) => ({ ...entry, rank: i + 1 }));
}

// ── Badge rendering ────────────────────────────────────────────────────────────

/**
 * CSS-only fake-3D badge.
 *
 * Implementation note: DO NOT use WebGL or Three.js here. This entire 3D
 * effect is achieved with:
 *   - CSS `perspective` on the parent
 *   - `transform: rotateX(12deg)` on the medal face
 *   - Layered `box-shadow` for depth/thickness illusion
 *   - `conic-gradient` for the metallic sheen
 *
 * This approach is intentional: zero runtime cost, no canvas, works on all devices.
 */
function Badge({ rank, locked = false }: { rank: 1 | 2 | 3; locked?: boolean }) {
  const configs = {
    1: {
      label: '🥇',
      gradient: 'conic-gradient(from 0deg, #ffd700, #fffacd, #ffd700, #b8860b, #ffd700)',
      shadow: '0 4px 0 #b8860b, 0 6px 12px rgba(255,215,0,0.5)',
      size: 64,
    },
    2: {
      label: '🥈',
      gradient: 'conic-gradient(from 0deg, #c0c0c0, #f8f8ff, #c0c0c0, #808080, #c0c0c0)',
      shadow: '0 4px 0 #808080, 0 6px 10px rgba(192,192,192,0.5)',
      size: 52,
    },
    3: {
      label: '🥉',
      gradient: 'conic-gradient(from 0deg, #cd7f32, #f4a460, #cd7f32, #8b4513, #cd7f32)',
      shadow: '0 4px 0 #8b4513, 0 6px 10px rgba(205,127,50,0.5)',
      size: 52,
    },
  } as const;

  const cfg = configs[rank];

  return (
    /**
     * Outer div establishes the CSS perspective context.
     * DO NOT use WebGL/Three.js — pure CSS perspective transform only.
     */
    <div
      style={{
        perspective: '400px',
        width: cfg.size,
        height: cfg.size,
        filter: locked ? 'grayscale(1)' : 'none',
        opacity: locked ? 0.3 : 1,
      }}
      aria-label={locked ? `Huy hiệu hạng ${rank} — chưa mở khóa` : `Huy hiệu hạng ${rank}`}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: cfg.gradient,
          boxShadow: locked
            ? '0 4px 0 #555, 0 6px 10px rgba(0,0,0,0.3)'
            : cfg.shadow,
          // rotateX creates the "tilted coin" fake-3D effect — pure CSS transform
          transform: 'rotateX(12deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: rank === 1 ? '28px' : '22px',
          userSelect: 'none',
          border: `2px solid ${locked ? '#555' : 'rgba(255,255,255,0.4)'}`,
        }}
      >
        {cfg.label}
      </div>
    </div>
  );
}

// ── Podium Card ───────────────────────────────────────────────────────────────
/**
 * Uses `motion.div` with `layout` + stable `layoutId` (username) so that
 * if the top-3 composition changes (e.g. user earns enough points to jump
 * from rank 3 to rank 1), Framer Motion FLIP-animates the podium card to
 * its new position rather than blinking instantly.
 * Transition uses MOTION_TOKENS.spring.gentle — no one-off numbers.
 */
function PodiumCard({
  entry,
  elevated,
}: {
  entry: LeaderboardEntry;
  elevated: boolean;
}) {
  const rank = entry.rank as 1 | 2 | 3;

  return (
    <motion.div
      layout
      layoutId={`leaderboard-row-${entry.username}`}
      transition={MOTION_TOKENS.spring.gentle}
      className={cn(
        'flex flex-col items-center gap-2 rounded-2xl border px-3 transition-[border-color,background-color]',
        elevated ? 'py-5' : 'py-4',
        entry.isCurrentUser
          ? 'border-[var(--neon-mint)]/50 bg-[var(--neon-mint)]/8 shadow-md'
          : 'border-border bg-card/60 shadow-sm',
        elevated ? 'scale-105' : 'scale-100'
      )}
      style={{ flex: elevated ? '1 1 36%' : '1 1 30%' }}
    >
      <Badge rank={rank} locked={false} />
      <div className="text-center">
        <p
          className={cn(
            'text-[11px] font-bold leading-tight',
            entry.isCurrentUser ? 'text-[var(--neon-mint)]' : 'text-foreground'
          )}
        >
          {entry.username}
          {entry.isCurrentUser && (
            <span className="ml-0.5 text-[9px] font-normal text-[var(--neon-mint)]/80"> (Bạn)</span>
          )}
        </p>
        <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground">
          {entry.points.toLocaleString('vi-VN')} điểm
        </p>
      </div>
    </motion.div>
  );
}

// ── Row for rank 4+ ───────────────────────────────────────────────────────────
/**
 * Each row carries `layout` + a stable `layoutId` tied to the user's username.
 * When `buildLiveLeaderboard` re-sorts (because wallet points changed), all rows
 * animate to their new vertical positions via Framer Motion's FLIP algorithm.
 * Transition uses MOTION_TOKENS.spring.gentle (no inline numbers) per §4.
 */
function RankRow({ entry }: { entry: LeaderboardEntry }) {
  const isLocked = entry.rank > 3;

  return (
    <motion.div
      layout
      layoutId={`leaderboard-row-${entry.username}`}
      transition={MOTION_TOKENS.spring.gentle}
      className={cn(
        'flex items-center gap-3 rounded-2xl border px-4 py-3',
        entry.isCurrentUser
          ? 'border-[var(--neon-mint)]/40 bg-[var(--neon-mint)]/8'
          : 'border-border bg-card/40'
      )}
    >
      {/* Rank number */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
          entry.isCurrentUser
            ? 'bg-[var(--neon-mint)]/20 text-[var(--neon-mint)]'
            : 'bg-border/60 text-muted-foreground'
        )}
      >
        #{entry.rank}
      </div>

      {/* Name */}
      <div className="flex-1">
        <p
          className={cn(
            'text-sm font-semibold',
            entry.isCurrentUser ? 'text-[var(--neon-mint)]' : 'text-foreground'
          )}
        >
          {entry.username}
          {entry.isCurrentUser && (
            <span className="ml-1.5 rounded-full bg-[var(--neon-mint)]/15 px-1.5 py-0.5 text-[10px] font-normal text-[var(--neon-mint)]">
              Bạn
            </span>
          )}
        </p>
      </div>

      {/* Points */}
      <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
        <Star className="h-3 w-3 text-[var(--warning-amber)]" fill="currentColor" />
        <span>{entry.points.toLocaleString('vi-VN')}</span>
      </div>

      {/* Locked badge silhouette — ALWAYS visible, never hidden (per spec) */}
      {isLocked && (
        <div
          style={{
            perspective: '300px',
            width: 28,
            height: 28,
            filter: 'grayscale(1)',
            opacity: 0.3,
          }}
          aria-label="Huy hiệu chưa mở khóa"
          title="Đạt hạng Top 3 để mở khóa huy hiệu"
        >
          <Medal
            className="h-7 w-7 text-foreground"
            style={{ transform: 'rotateX(10deg)' }}
          />
        </div>
      )}
    </motion.div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export function Leaderboard({ liveUserPoints, activeTab, onTabChange }: LeaderboardProps) {
  const entries = buildLiveLeaderboard(liveUserPoints);
  const top3 = entries.slice(0, 3) as [LeaderboardEntry, LeaderboardEntry, LeaderboardEntry];
  const rest = entries.slice(3);

  // Podium order: 2nd (left) | 1st (center, elevated) | 3rd (right)
  const podiumOrder: [LeaderboardEntry, LeaderboardEntry, LeaderboardEntry] = [
    top3[1], // rank 2 — left
    top3[0], // rank 1 — center, elevated
    top3[2], // rank 3 — right
  ];

  const tabs: { key: LeaderboardTab; label: string }[] = [
    { key: 'weekly', label: 'Tuần này' },
    { key: 'monthly', label: 'Tháng này' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* ── Tab Switcher ─────────────────────────────────────────────── */}
      <div className="relative flex rounded-2xl border border-border bg-card/60 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            id={`leaderboard-tab-${tab.key}`}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'relative z-10 flex-1 rounded-xl py-2 text-sm font-semibold transition-colors duration-150',
              activeTab === tab.key ? 'text-white' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {/* Smooth sliding pill indicator */}
            {activeTab === tab.key && (
              <motion.div
                layoutId="leaderboard-tab-indicator"
                className="absolute inset-0 rounded-xl bg-[var(--primary-emerald)]"
                transition={MOTION_TOKENS.spring.standard}
              />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Top-3 Podium (Flexbox: 2nd Left | 1st Center | 3rd Right) ── */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Crown className="h-4 w-4 text-[var(--warning-amber)]" fill="currentColor" />
          <h3 className="text-sm font-bold text-foreground">Top 3 Huyền Thoại</h3>
        </div>
        {/*
         * Flexbox podium — NOT a vertical list (per Senior Engineer requirement #2).
         * motion.div with `layout` on each PodiumCard handles FLIP animation
         * if the composition of top-3 changes.
         */}
        <motion.div layout className="flex items-end gap-2">
          <PodiumCard entry={podiumOrder[0]} elevated={false} />
          <PodiumCard entry={podiumOrder[1]} elevated={true} />
          <PodiumCard entry={podiumOrder[2]} elevated={false} />
        </motion.div>
      </div>

      {/* ── Rankings 4+ ──────────────────────────────────────────────── */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">Bảng xếp hạng đầy đủ</h3>
        </div>
        {/*
         * AnimatePresence wraps the list so entries can animate in/out if they
         * cross the top-3 boundary (e.g., user jumps from rank 4 to rank 3).
         * Each RankRow has layout + layoutId for position-change FLIP animation.
         */}
        <AnimatePresence>
          <motion.div layout className="flex flex-col gap-2">
            {rest.map((entry) => (
              <RankRow key={entry.username} entry={entry} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
