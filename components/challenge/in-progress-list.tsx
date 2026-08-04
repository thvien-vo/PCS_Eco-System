'use client';

/**
 * InProgressList — Module 5 confirmed challenges panel.
 *
 * Shows a horizontal scroll strip of challenges the user has confirmed.
 * Uses useDragScroll for desktop mouse-drag navigation (per pcs-tech-standards §12).
 * Empty state shown when no challenges have been confirmed yet.
 */

import Image from 'next/image';
import { CheckCircle2, Star } from 'lucide-react';
import { useDragScroll } from '@/hooks/use-drag-scroll';
import type { ChallengeCard } from '@/types';

interface InProgressListProps {
  /** Full ChallengeCard objects for confirmed challenges. */
  inProgressCards: ChallengeCard[];
}

export function InProgressList({ inProgressCards }: InProgressListProps) {
  // Destructure directly — avoids react-hooks/refs false-positive on `drag.onMouseDown` etc.
  const { ref, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onClickCapture } = useDragScroll();

  if (inProgressCards.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 px-4 py-5 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground/50" />
        <span>Chưa có thử thách nào đang thực hiện</span>
      </div>
    );
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onClickCapture={onClickCapture}
      className="flex gap-3 overflow-x-auto scrollbar-hide cursor-grab pb-1"
    >
      {inProgressCards.map((card) => (
        <div
          key={card.id}
          className="relative flex-shrink-0 w-28 overflow-hidden rounded-2xl border border-[var(--neon-mint)]/30 shadow-sm"
        >
          {/* Thumbnail */}
          <div className="relative h-20 w-full">
            <Image
              src={card.imageUrl}
              alt={card.name}
              fill
              sizes="112px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            {/* Confirmed badge */}
            <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--kiosk-pass)]">
              <CheckCircle2 className="h-3 w-3 text-white" />
            </div>
          </div>

          {/* Info */}
          <div className="bg-card p-2">
            <p className="line-clamp-1 text-[10px] font-semibold text-foreground">{card.name}</p>
            <div className="mt-0.5 flex items-center gap-0.5 text-[9px] text-[var(--neon-mint)]">
              <Star className="h-2.5 w-2.5" fill="currentColor" />
              <span>{card.rewardPoints.toLocaleString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
