'use client';

/**
 * ConfirmModal — Module 5 challenge confirmation dialog.
 *
 * Shown when user swipes RIGHT on a challenge card.
 * - Confirm → challenge is added to in-progress list.
 * - Cancel  → modal closes; card stays at front of queue (no queue mutation).
 *
 * Uses Framer Motion AnimatePresence for smooth enter/exit.
 * Vietnamese UI text throughout (per pcs-design-system §2).
 */

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, Flame } from 'lucide-react';
import type { ChallengeCard } from '@/types';
import { MOTION_TOKENS } from '@/lib/motion-tokens';

interface ConfirmModalProps {
  /** Null = modal is hidden. Non-null = show modal for this card. */
  card: ChallengeCard | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ card, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {card && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION_TOKENS.durations.base, ease: MOTION_TOKENS.easing.standard }}
            onClick={onCancel}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            key="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            className="fixed inset-x-4 bottom-8 z-[90] mx-auto max-w-sm overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={MOTION_TOKENS.spring.standard}
          >
            {/* Card preview banner */}
            <div className="relative h-36 w-full overflow-hidden">
            <Image
              src={card.imageUrl}
              alt={card.name}
              fill
              sizes="(max-width: 448px) 100vw, 448px"
              className="object-cover"
            />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <h2
                id="confirm-modal-title"
                className="absolute bottom-3 left-4 right-4 text-lg font-bold text-white"
              >
                {card.name}
              </h2>
            </div>

            {/* Body */}
            <div className="p-5">
              <p className="mb-4 text-sm text-muted-foreground">
                Bạn có chắc muốn tham gia thử thách này không?
              </p>

              {/* Meta chips */}
              <div className="mb-5 flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs">
                  <Clock className="h-3.5 w-3.5 text-[var(--warning-amber)]" />
                  <span className="font-medium text-foreground">Còn {card.deadline}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-[var(--neon-mint)]/30 bg-[var(--neon-mint)]/10 px-3 py-1.5 text-xs">
                  <Star className="h-3.5 w-3.5 text-[var(--neon-mint)]" fill="currentColor" />
                  <span className="font-bold text-[var(--neon-mint)]">
                    +{card.rewardPoints.toLocaleString()} điểm thưởng
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs dark:border-orange-800 dark:bg-orange-900/20">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    Thử thách nóng
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                {/* Cancel — card returns to front of queue */}
                <button
                  id="confirm-modal-cancel"
                  onClick={onCancel}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-background text-sm font-semibold text-foreground transition-colors hover:bg-border/50"
                >
                  <X className="h-4 w-4" />
                  Hủy bỏ
                </button>

                {/* Confirm — card removed from queue permanently */}
                <button
                  id="confirm-modal-confirm"
                  onClick={onConfirm}
                  className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-2xl bg-[var(--primary-emerald)] text-sm font-bold text-white shadow-md transition-all hover:bg-[var(--emerald-hover)] active:scale-95"
                >
                  <Star className="h-4 w-4" fill="currentColor" />
                  Tham gia ngay!
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
