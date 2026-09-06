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

export function CommentSheet({
  postId,
  isOpen,
  onClose,
  baseCommentCount,
}: CommentSheetProps) {
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
            className="fixed bottom-0 left-1/2 z-[95] w-full max-w-sm -translate-x-1/2 rounded-t-3xl bg-background shadow-2xl border-t border-border flex flex-col"
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
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-foreground">
                  {tm.title.replace('{n}', total.toString())}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border text-muted-foreground"
                aria-label={tm.closeAria}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 space-y-4">
              {/* Mock base comments (static, representing server-side data) */}
              {Array.from({ length: Math.min(baseCommentCount, 3) }).map(
                (_, i) => (
                  <div key={`base-${i}`} className="flex gap-3">
                    <div
                      className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500"
                      style={{
                        backgroundImage: `url(https://picsum.photos/seed/commenter-${postId}-${i}/32/32)`,
                        backgroundSize: 'cover',
                      }}
                    />
                    <div className="flex-1">
                      <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-3 py-2">
                        <p className="text-[11px] font-semibold text-foreground">
                          {tm.mockNames[i % tm.mockNames.length]}
                        </p>
                        <p className="text-xs text-foreground/80 mt-0.5">
                          {tm.mockTexts[i % tm.mockTexts.length]}
                        </p>
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-1 ml-3">
                        {tm.mockTimes[i % tm.mockTimes.length]}
                      </p>
                    </div>
                  </div>
                )
              )}

              {/* User-submitted comments (persisted) */}
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                    {tm.you[0]?.toUpperCase() || 'Y'}
                  </div>
                  <div className="flex-1">
                    <div className="rounded-2xl rounded-tl-sm bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 px-3 py-2">
                      <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                        {tm.you}
                      </p>
                      <p className="text-xs text-foreground/80 mt-0.5">
                        {comment.text}
                      </p>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1 ml-3">
                      {formatTime(comment.timestamp, tm)}
                    </p>
                  </div>
                </div>
              ))}

              {comments.length === 0 && baseCommentCount === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageCircle className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {tm.emptyTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tm.emptySubtitle}
                  </p>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 px-4 py-3 border-t border-border bg-background"
            >
              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                {tm.you[0]?.toUpperCase() || 'Y'}
              </div>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={tm.placeholder}
                  className="w-full rounded-2xl bg-card border border-border px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 pr-10"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 disabled:opacity-40 transition-opacity"
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
  );
}
