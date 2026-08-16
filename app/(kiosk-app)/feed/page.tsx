'use client';

/**
 * GreenFeedPage — Module 3: Mạng xã hội voucher & Green Feed.
 *
 * Layout (top → bottom):
 *   1. Sticky header
 *   2. Quick Action Carousel + Membership Tier Progress
 *   3. Green Stories
 *   4. Flash Sale Bar
 *   5. Newsfeed (8 mock posts with full interactivity)
 *
 * Hydration guards:
 *   - All Zustand persisted reads are gated behind useHasMounted() inside
 *     child components (FeedPostCard, GreenStories).
 *   - This page component itself doesn't read persisted store directly.
 *
 * Per pcs-tech-standards §10(a) and §11 (no SSR blocking).
 */

import { motion } from 'framer-motion';
import { Bell, Search, Settings } from 'lucide-react';
import Link from 'next/link';
import { QuickActionCarousel } from '@/components/feed/quick-action-carousel';
import { GreenStories } from '@/components/feed/green-stories';
import { FlashSaleBar } from '@/components/feed/flash-sale-bar';
import { FeedPostCard } from '@/components/feed/feed-post-card';
import { MOCK_POSTS } from '@/lib/mock-data';
import { MOTION_TOKENS } from '@/lib/motion-tokens';

export default function GreenFeedPage() {
  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight">
              Cộng đồng Xanh
            </h1>
            <p className="text-[10px] text-muted-foreground">
              Mạng xã hội tái chế
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Tìm kiếm"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Thông báo"
            >
              <Bell className="h-4 w-4" />
              {/* Notification badge */}
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 border border-background" />
            </button>
            <Link
              href="/settings"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cài đặt"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Quick Action Carousel + Tier Progress ── */}
      <QuickActionCarousel />

      {/* ── Divider ── */}
      <div className="h-2 bg-card border-y border-border" />

      {/* ── Green Stories ── */}
      <motion.section
        className="py-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: MOTION_TOKENS.durations.base, delay: 0.1 }}
      >
        <p className="px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Tin check-in hôm nay
        </p>
        <GreenStories />
      </motion.section>

      {/* ── Divider ── */}
      <div className="h-2 bg-card border-y border-border" />

      {/* ── Flash Sale Bar ── */}
      <motion.section
        className="py-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: MOTION_TOKENS.durations.base, delay: 0.15 }}
      >
        <p className="px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Ưu đãi đặc biệt
        </p>
        <FlashSaleBar />
      </motion.section>

      {/* ── Divider ── */}
      <div className="h-2 bg-card border-y border-border" />

      {/* ── Newsfeed ── */}
      <section className="flex-1">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Bảng tin cộng đồng
          </p>
          <button className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            Mới nhất ▾
          </button>
        </div>

        <div className="divide-y divide-border">
          {MOCK_POSTS.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: MOTION_TOKENS.durations.base,
                delay: 0.05 * index,
                ease: MOTION_TOKENS.easing.enter,
              }}
            >
              <FeedPostCard post={post} />
            </motion.div>
          ))}
        </div>

        {/* End of feed indicator */}
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-3">
            <span className="text-xl">🌿</span>
          </div>
          <p className="text-sm font-medium text-foreground">
            Bạn đã xem hết bảng tin!
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Hãy tái chế thêm để nhận ưu đãi mới nhé 💚
          </p>
        </div>
      </section>
    </div>
  );
}
