'use client';

/**
 * CommentSheet — Module 3 comment bottom sheet.
 *
 * Reads + writes to feed-store.commentsByPost via Zustand.
 * Persisted across tab switches. Hydration-safe per §10(a).
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle } from 'lucide-react';
import { useFeedStore } from '@/store/feed-store';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { MOTION_TOKENS } from '@/lib/motion-tokens';
import { useTranslation } from '@/hooks/use-translation';
import { ModalPortal } from '@/components/shared/modal-portal';
import type { TranslationDictionary } from '@/lib/i18n/dictionaries';

type CommentLabels = TranslationDictionary['feed']['comments'];

interface CommentSheetProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  baseCommentCount: number;
}

function formatTime(iso: string, labels: CommentLabels): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return labels.justNow;
  if (diff < 3600) return labels.minutesAgo.replace('{n}', Math.floor(diff / 60).toString());
  return labels.hoursAgo.replace('{n}', Math.floor(diff / 3600).toString());
}

export function CommentSheet({ postId, isOpen, onClose, baseCommentCount }: CommentSheetProps) {
  const { t } = useTranslation();
  const tm = t.feed.comments;

  const hasMounted = useHasMounted();
  const { addComment, getComments } = useFeedStore();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Hydration-safe: don't read persisted comments until mounted
  const comments = hasMounted ? getComments(postId) : [];
  const total = baseCommentCount + comments.length;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    addComment(postId, trimmed);
    setText('');
  }

  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MOTION_TOKENS.durations.base }}
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[95] mx-auto flex w-full max-w-sm flex-col rounded-t-3xl border-t border-border bg-background shadow-2xl"
              style={{ maxHeight: '70vh' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ ...MOTION_TOKENS.spring.gentle }}
            >
              {/* Handle + header */}
              <div className="flex justify-center pt-3">
                <div className="h-1 w-10 rounded-full bg-border" />
              </div>
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-emerald-500" />
                  <h2 className="text-sm font-bold text-foreground">
                    {tm.title.replace('{n}', total.toString())}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
                  aria-label={tm.closeAria}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Comments list */}
              <div className="scrollbar-hide flex-1 space-y-4 overflow-y-auto px-5 py-4">
                {/* Mock base comments (static, representing server-side data) */}
                {Array.from({ length: Math.min(baseCommentCount, 3) }).map((_, i) => (
                  <div key={`base-${i}`} className="flex gap-3">
                    <div
                      className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500"
                      style={{
                        backgroundImage: `url(https://picsum.photos/seed/commenter-${postId}-${i}/32/32)`,
                        backgroundSize: 'cover',
                      }}
                    />
                    <div className="flex-1">
                      <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-3 py-2">
                        <p className="text-[11px] font-semibold text-foreground">
                          {tm.mockNames[i % tm.mockNames.length]}
                        </p>
                        <p className="text-foreground/80 mt-0.5 text-xs">
                          {tm.mockTexts[i % tm.mockTexts.length]}
                        </p>
                      </div>
                      <p className="ml-3 mt-1 text-[9px] text-muted-foreground">
                        {tm.mockTimes[i % tm.mockTimes.length]}
                      </p>
                    </div>
                  </div>
                ))}

                {/* User-submitted comments (persisted) */}
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-white">
                      {tm.you[0]?.toUpperCase() || 'Y'}
                    </div>
                    <div className="flex-1">
                      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800/30 dark:bg-emerald-950/30">
                        <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                          {tm.you}
                        </p>
                        <p className="text-foreground/80 mt-0.5 text-xs">{comment.text}</p>
                      </div>
                      <p className="ml-3 mt-1 text-[9px] text-muted-foreground">
                        {formatTime(comment.timestamp, tm)}
                      </p>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && baseCommentCount === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageCircle className="text-muted-foreground/40 mb-2 h-8 w-8" />
                    <p className="text-sm text-muted-foreground">{tm.emptyTitle}</p>
                    <p className="text-xs text-muted-foreground">{tm.emptySubtitle}</p>
                  </div>
                )}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-3 border-t border-border bg-background px-4 py-3"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-white">
                  {tm.you[0]?.toUpperCase() || 'Y'}
                </div>
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={tm.placeholder}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim()}
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-500 transition-opacity disabled:opacity-40"
                    aria-label={tm.sendAria}
                  >
                    <Send className="h-3 w-3 text-white" />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
