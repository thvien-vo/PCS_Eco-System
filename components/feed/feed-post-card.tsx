'use client';

/**
 * FeedPostCard — Module 3 individual post card.
 *
 * Features:
 *  - Author avatar + name + timestamp + hyper-local tag
 *  - Post image (picsum)
 *  - Green hashtags
 *  - Sponsor Voucher chip (NO real logos — text chip + generic icon only)
 *  - "Lưu mã" (Save Code) button → triggers particle-burst + saves to wallet
 *  - Like (Zustand-persisted, hydration-safe via useHasMounted)
 *  - Comment button → opens CommentSheet
 *  - Gift button → opens FriendPickerModal
 *
 * Per pcs-design-system §8: particle-burst allowed here.
 * Per pcs-tech-standards §10(a): like/saved state gated behind useHasMounted.
 */

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Gift,
  MapPin,
  Tag,
  Ticket,
  Check,
  BookmarkPlus,
  BookmarkCheck,
  Share2,
} from 'lucide-react';
import { useFeedStore } from '@/store/feed-store';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { MOCK_VOUCHERS } from '@/lib/mock-data';
import { ParticleBurst } from '@/components/shared/particle-burst';
import { CommentSheet } from '@/components/feed/comment-sheet';
import { FriendPickerModal } from '@/components/feed/friend-picker-modal';
import { MOTION_TOKENS } from '@/lib/motion-tokens';
import type { FeedPost } from '@/types';

interface FeedPostCardProps {
  post: FeedPost;
}

/**
 * Pure deterministic voucher code — derived solely from the voucher ID.
 * Defined outside component so ESLint react-hooks/purity cannot flag it.
 */
function makeVoucherCode(voucherId: string): string {
  // Simple deterministic hash-like code using char codes — pure, no side effects.
  const hash = voucherId
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0)
    .toString(16)
    .toUpperCase()
    .padStart(6, '0')
    .slice(0, 6);
  return `PCS-${voucherId.toUpperCase()}-${hash}`;
}

export function FeedPostCard({ post }: FeedPostCardProps) {
  const hasMounted = useHasMounted();
  const { toggleLikePost, saveVoucher, likedPosts, savedVouchers } =
    useFeedStore();

  // Particle burst state
  const [burstTrigger, setBurstTrigger] = useState(false);
  const [burstOrigin, setBurstOrigin] = useState({ x: 0, y: 0 });
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  // Pre-computed stable code (pure function, no impure calls in render)
  const voucherCodeRef = useRef<string | null>(null);

  // Sheet/modal state
  const [commentOpen, setCommentOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [showSavedBadge, setShowSavedBadge] = useState(false);

  // Hydration-safe: render default state until mounted
  const isLiked = hasMounted ? likedPosts.includes(post.id) : false;
  const isSaved = hasMounted
    ? savedVouchers.includes(post.attachedVoucherId ?? '')
    : false;

  // Like count: base + user's like
  const displayLikes = post.likes + (isLiked ? 1 : 0);
  // User-added comments
  const { getComments } = useFeedStore();
  const userCommentCount = hasMounted ? getComments(post.id).length : 0;

  const attachedVoucher = post.attachedVoucherId
    ? MOCK_VOUCHERS.find((v) => v.id === post.attachedVoucherId)
    : null;

  function handleSaveCode() {
    if (!attachedVoucher || isSaved) return;

    // Capture button position for particle origin
    if (saveButtonRef.current) {
      const rect = saveButtonRef.current.getBoundingClientRect();
      setBurstOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    // Save voucher detail to feed store (for Module 4 to read)
    const attachedVoucherId = attachedVoucher.id;
    // Generate code once and cache it — pure function, no side effects
    if (!voucherCodeRef.current) {
      voucherCodeRef.current = makeVoucherCode(attachedVoucherId);
    }
    const code = voucherCodeRef.current;
    const savedAt = new Date().toISOString();
    saveVoucher({
      id: attachedVoucher.id,
      title: attachedVoucher.title,
      sponsorName: attachedVoucher.sponsorName,
      code,
      savedAt,
      imageUrl: attachedVoucher.imageUrl,
    });

    // Fire particle burst (exactly once per click — trigger resets via onComplete)
    setBurstTrigger(true);

    // Show saved badge
    setShowSavedBadge(true);
    setTimeout(() => setShowSavedBadge(false), 2500);
  }

  return (
    <>
      {/* Particle burst — rendered outside card in fixed overlay */}
      <ParticleBurst
        trigger={burstTrigger}
        originPosition={burstOrigin}
        onComplete={() => setBurstTrigger(false)}
        color="var(--neon-mint)"
      />

      <motion.article
        className="bg-background border-b border-border"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION_TOKENS.durations.base, ease: MOTION_TOKENS.easing.enter }}
      >
        {/* ── Author row ── */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <div className="relative h-10 w-10 flex-shrink-0 rounded-full overflow-hidden ring-2 ring-emerald-500/30">
            <Image
              src={post.authorAvatar}
              alt={post.author}
              fill
              className="object-cover"
              sizes="40px"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {post.author}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-muted-foreground">
                {post.timestamp}
              </span>
              {post.hyperLocalTag && (
                <>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <div className="flex items-center gap-0.5">
                    <MapPin className="h-2.5 w-2.5 text-emerald-500 flex-shrink-0" />
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 truncate">
                      {post.hyperLocalTag}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-card transition-colors"
            aria-label="Tùy chọn bài viết"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="px-4 pb-3">
          <p className="text-sm text-foreground leading-relaxed line-clamp-3">
            {post.content}
          </p>

          {/* Hashtags */}
          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {post.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Post Image ── */}
        <div className="relative w-full aspect-[4/3] bg-card overflow-hidden">
          <Image
            src={post.imageUrl}
            alt={`Ảnh bài viết của ${post.author}`}
            fill
            className="object-cover"
            sizes="(max-width: 480px) 100vw, 390px"
            unoptimized
          />
        </div>

        {/* ── Sponsor Voucher Chip ── */}
        {attachedVoucher && (
          <div className="mx-4 mt-3">
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2.5 relative overflow-hidden">
              {/* Background pattern */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(-45deg, #059669, #059669 2px, transparent 2px, transparent 8px)',
                }}
              />

              {/* Icon (generic — no real logos per §5 and design-system §8) */}
              <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700/40">
                <Ticket className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>

              {/* Voucher info */}
              <div className="relative flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <Tag className="h-2.5 w-2.5 text-emerald-500 flex-shrink-0" />
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 truncate">
                    {attachedVoucher.sponsorName}
                  </span>
                  {attachedVoucher.isFlashSale && (
                    <span className="flex-shrink-0 rounded-full bg-orange-500 px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wide">
                      Flash
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-foreground truncate">
                  {attachedVoucher.title}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {attachedVoucher.pointsCost.toLocaleString('vi-VN')} điểm xanh
                </p>
              </div>

              {/* Save Code button */}
              <div className="relative flex-shrink-0">
                <AnimatePresence mode="wait">
                  {showSavedBadge ? (
                    <motion.div
                      key="saved"
                      className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-2 text-white"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: MOTION_TOKENS.durations.fast }}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-bold">Đã lưu!</span>
                    </motion.div>
                  ) : isSaved ? (
                    <motion.div
                      key="already-saved"
                      className="flex items-center gap-1 rounded-xl bg-card border border-border px-3 py-2 text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <BookmarkCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-[11px] font-medium">Đã có</span>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="save"
                      ref={saveButtonRef}
                      onClick={handleSaveCode}
                      className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 text-white shadow-md hover:opacity-90 active:scale-95 transition-all"
                      whileTap={{ scale: 0.93 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ minWidth: 44, minHeight: 44 }}
                      aria-label="Lưu mã voucher"
                    >
                      <BookmarkPlus className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-bold">Lưu mã</span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* ── Action Bar ── */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Like */}
          <motion.button
            onClick={() => toggleLikePost(post.id)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 transition-colors hover:bg-card active:scale-95"
            whileTap={{ scale: 0.88 }}
            style={{ minWidth: 44, minHeight: 44 }}
            aria-label={isLiked ? 'Bỏ thích' : 'Thích'}
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: MOTION_TOKENS.durations.fast }}
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  isLiked
                    ? 'fill-rose-500 text-rose-500'
                    : 'text-muted-foreground'
                }`}
              />
            </motion.div>
            <span
              className={`text-xs font-medium ${
                isLiked ? 'text-rose-500' : 'text-muted-foreground'
              }`}
            >
              {displayLikes.toLocaleString('vi-VN')}
            </span>
          </motion.button>

          {/* Comment */}
          <button
            onClick={() => setCommentOpen(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 transition-colors hover:bg-card active:scale-95"
            style={{ minWidth: 44, minHeight: 44 }}
            aria-label="Bình luận"
          >
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {(post.comments + userCommentCount).toLocaleString('vi-VN')}
            </span>
          </button>

          {/* Gift */}
          <button
            onClick={() => setGiftOpen(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 transition-colors hover:bg-card active:scale-95"
            style={{ minWidth: 44, minHeight: 44 }}
            aria-label="Tặng quà"
          >
            <Gift className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {post.gifts.toLocaleString('vi-VN')}
            </span>
          </button>
        </div>
      </motion.article>

      {/* ── Sheets & Modals ── */}
      <CommentSheet
        postId={post.id}
        isOpen={commentOpen}
        onClose={() => setCommentOpen(false)}
        baseCommentCount={post.comments}
      />

      <FriendPickerModal
        isOpen={giftOpen}
        voucherTitle={attachedVoucher?.title ?? 'Voucher xanh'}
        onClose={() => setGiftOpen(false)}
      />
    </>
  );
}
