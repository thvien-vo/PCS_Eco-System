'use client';

/**
 * CatalogCard — Module 6 Green Marketplace
 *
 * Renders a single redemption catalog item.
 *
 * Affordances:
 *  - If currentPoints >= item.pointsCost → full card with "Đổi ngay" CTA
 *  - If currentPoints < item.pointsCost  → blurred product image + locked overlay
 *    with "Xem cách kiếm thêm điểm" navigation to Module 5 (Swipe Challenge)
 *
 * Race-condition guard:
 *  isRedeemingRef (useRef<boolean>) is set to `true` the moment the button is
 *  clicked, before any state update.  A second click within the same React render
 *  cycle checks this ref and returns immediately — same pattern as hasResultedRef
 *  in Module 7 kiosk-modal.tsx.
 *
 * Per pcs-design-system §8: particle-burst SPOT 3 (Module 6 redemption).
 */

import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, Zap, ArrowRight, Tag, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MOTION_TOKENS } from '@/lib/motion-tokens';
import type { MarketplaceCatalogItem } from '@/types';

interface CatalogCardProps {
  item: MarketplaceCatalogItem;
  currentPoints: number;
  isAlreadyRedeemed: boolean;
  onRedeem: (item: MarketplaceCatalogItem, originPosition: { x: number; y: number }) => void;
}

const CATEGORY_STYLES: Record<MarketplaceCatalogItem['category'], { bg: string; text: string; label: string }> = {
  voucher: { bg: 'bg-emerald/10', text: 'text-emerald', label: 'Mã giảm giá' },
  gift: { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Quà tặng' },
  cashback: { bg: 'bg-warning/10', text: 'text-warning', label: 'Hoàn tiền' },
};

function FlashBadge({ expiresAt }: { expiresAt: string }) {
  const expiry = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffHrs = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const diffMins = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));

  const label =
    diffMs <= 0
      ? 'Đã hết hạn'
      : diffHrs > 0
        ? `Còn ${diffHrs}g ${diffMins}p`
        : `Còn ${diffMins} phút`;

  return (
    <div className="flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 text-[10px] font-semibold text-error">
      <Clock className="h-2.5 w-2.5" />
      <span>{label}</span>
    </div>
  );
}

export function CatalogCard({ item, currentPoints, isAlreadyRedeemed, onRedeem }: CatalogCardProps) {
  const router = useRouter();
  const isRedeemingRef = useRef<boolean>(false);
  const [isPressed, setIsPressed] = useState(false);

  const canAfford = currentPoints >= item.pointsCost;
  const catStyle = CATEGORY_STYLES[item.category];

  const handleRedeemClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // ── DOUBLE-REDEEM GUARD (ref-based, same pattern as kiosk-modal hasResultedRef) ──
      // Check the ref FIRST before any state read — avoids stale-closure risk.
      if (isRedeemingRef.current) return;
      isRedeemingRef.current = true; // lock immediately, synchronously

      const rect = e.currentTarget.getBoundingClientRect();
      const origin = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      onRedeem(item, origin);

      // Release lock after a short window so the card can animate to "redeemed"
      // state; new redemptions on OTHER cards are not blocked by this lock
      // because each card has its own ref instance.
      setTimeout(() => {
        isRedeemingRef.current = false;
      }, 1500);
    },
    [item, onRedeem],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: MOTION_TOKENS.durations.base,
        ease: MOTION_TOKENS.easing.enter,
      }}
      className={cn(
        'relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card',
        'transition-shadow duration-150',
        canAfford && !isAlreadyRedeemed && 'hover:shadow-lg hover:glow-border',
      )}
    >
      {/* ── Flash sale badge ── */}
      {item.isFlashSale && !isAlreadyRedeemed && (
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-error px-2 py-0.5 text-[10px] font-bold text-white shadow">
          <Zap className="h-2.5 w-2.5 fill-white" />
          FLASH SALE
        </div>
      )}

      {/* ── Already redeemed badge ── */}
      {isAlreadyRedeemed && (
        <div className="absolute left-2 top-2 z-10 rounded-full bg-emerald px-2 py-0.5 text-[10px] font-bold text-white shadow">
          ✓ Đã đổi
        </div>
      )}

      {/* ── Product image with optional blur overlay ── */}
      <div className="relative aspect-[16/9] overflow-hidden bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.title}
          className={cn(
            'h-full w-full object-cover transition-all duration-300',
            !canAfford && 'blur-[3px] brightness-75',
          )}
        />

        {/* Blurred overlay for "not enough points" — per acceptance criteria */}
        {!canAfford && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 p-3 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <Lock className="h-4 w-4 text-white" />
            </div>
            <p className="text-[11px] font-semibold leading-tight text-white drop-shadow">
              Chưa đủ điểm
            </p>
            <button
              id={`earn-more-${item.id}`}
              onClick={() => router.push('/challenge')}
              className={cn(
                'flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[10px] font-medium text-white',
                'backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95',
                'min-h-[36px]', // ≥ 44px touch target via padding
              )}
            >
              Xem cách kiếm thêm điểm
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Category + flash timer row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
              catStyle.bg,
              catStyle.text,
            )}
          >
            <Tag className="h-2.5 w-2.5" />
            {item.tag}
          </span>
          {item.isFlashSale && item.expiresAt && <FlashBadge expiresAt={item.expiresAt} />}
        </div>

        {/* Partner + title */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground">{item.partnerName}</p>
          <h3 className="text-sm font-bold leading-snug text-foreground line-clamp-2">{item.title}</h3>
        </div>

        {/* Description */}
        <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
          {item.description}
        </p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Points cost + CTA */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
          <div className="flex items-center gap-1">
            <span className="text-base font-extrabold text-emerald">
              {item.pointsCost.toLocaleString('vi-VN')}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">điểm</span>
          </div>

          {isAlreadyRedeemed ? (
            <div className="rounded-full bg-emerald/10 px-3 py-1.5 text-[11px] font-semibold text-emerald">
              Đã đổi thành công
            </div>
          ) : canAfford ? (
            <motion.button
              id={`redeem-${item.id}`}
              whileTap={{ scale: 0.93 }}
              transition={MOTION_TOKENS.spring.standard}
              onPointerDown={() => setIsPressed(true)}
              onPointerUp={() => setIsPressed(false)}
              onPointerLeave={() => setIsPressed(false)}
              onClick={handleRedeemClick}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5',
                'bg-gradient-to-r from-emerald to-mint text-white',
                'text-[11px] font-bold shadow-sm',
                'transition-opacity min-h-[36px]',
                isPressed ? 'opacity-80' : 'opacity-100',
              )}
            >
              Đổi ngay
              <Zap className="h-3 w-3 fill-white" />
            </motion.button>
          ) : (
            <div className="rounded-full bg-muted-foreground/10 px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
              Chưa đủ điểm
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
