'use client';

/**
 * RedemptionSuccessModal — Module 6 Green Marketplace
 *
 * Shown AFTER a successful point deduction to display the redeemed item's
 * details and a simulated redemption code.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Copy } from 'lucide-react';
import { useState } from 'react';
import { MOTION_TOKENS } from '@/lib/motion-tokens';
import { cn } from '@/lib/utils';
import type { MarketplaceCatalogItem } from '@/types';

interface RedemptionSuccessModalProps {
  item: MarketplaceCatalogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

/** Generate a deterministic-looking but fake redemption code from the item ID */
function generateFakeCode(itemId: string): string {
  const hash = itemId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'PCS-';
  for (let i = 0; i < 8; i++) {
    code += chars[(hash * (i + 7) * 13) % chars.length];
  }
  return code;
}

export function RedemptionSuccessModal({ item, isOpen, onClose }: RedemptionSuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const code = item ? generateFakeCode(item.id) : '';

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).catch(() => {
      /* clipboard not available in some test envs — silently ignore */
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && item && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION_TOKENS.durations.base }}
            className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={MOTION_TOKENS.spring.gentle}
            className={cn(
              'fixed bottom-0 left-1/2 z-[160] w-full max-w-[374px] -translate-x-1/2',
              'rounded-t-3xl border border-border bg-card shadow-2xl',
              'pb-safe',
            )}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>

            {/* Close button */}
            <button
              id="redemption-modal-close"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-border/50 text-muted-foreground transition-colors hover:bg-border"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center gap-4 p-6 pt-3">
              {/* Success icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...MOTION_TOKENS.spring.bouncy, delay: 0.1 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald/10"
              >
                <CheckCircle2 className="h-9 w-9 text-emerald" />
              </motion.div>

              {/* Headline */}
              <div className="text-center">
                <h2 className="text-lg font-bold text-foreground">Đổi điểm thành công! 🎉</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bạn đã đổi thành công <span className="font-semibold text-emerald">{item.title}</span>
                </p>
              </div>

              {/* Item summary */}
              <div className="w-full overflow-hidden rounded-2xl border border-border bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-28 w-full object-cover"
                />
                <div className="p-3">
                  <p className="text-[10px] text-muted-foreground">{item.partnerName}</p>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Đã trừ{' '}
                    <span className="font-bold text-emerald">
                      {item.pointsCost.toLocaleString('vi-VN')} điểm
                    </span>{' '}
                    từ Ví Xanh của bạn
                  </p>
                </div>
              </div>

              {/* Redemption code */}
              <div className="w-full rounded-2xl border-2 border-dashed border-emerald/30 bg-emerald/5 p-4">
                <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Mã đổi thưởng của bạn
                </p>
                <div className="flex items-center justify-between gap-2 rounded-xl bg-card p-3">
                  <span
                    id="redemption-code-display"
                    className="font-mono text-base font-bold tracking-widest text-foreground"
                  >
                    {code}
                  </span>
                  <button
                    id="copy-redemption-code"
                    onClick={handleCopy}
                    className={cn(
                      'flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all',
                      copied
                        ? 'bg-emerald/10 text-emerald'
                        : 'bg-border/50 text-muted-foreground hover:bg-border',
                      'min-h-[36px]',
                    )}
                  >
                    <Copy className="h-3 w-3" />
                    {copied ? 'Đã sao chép' : 'Sao chép'}
                  </button>
                </div>
                <p className="mt-2 text-center text-[10px] text-muted-foreground">
                  Xuất trình mã này cho đối tác để nhận ưu đãi
                </p>
              </div>

              {/* Done button */}
              <button
                id="redemption-modal-done"
                onClick={onClose}
                className="w-full rounded-full bg-gradient-to-r from-emerald to-mint py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 active:scale-[0.98] min-h-[44px]"
              >
                Tuyệt vời!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
