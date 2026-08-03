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

interface CommentSheetProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  baseCommentCount: number;
}

function formatTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  return `${Math.floor(diff / 3600)} giờ trước`;
}

export function CommentSheet({
  postId,
  isOpen,
  onClose,
  baseCommentCount,
}: CommentSheetProps) {
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
                  Bình luận ({total})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border text-muted-foreground"
                aria-label="Đóng"
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
                          {['Minh Châu', 'Đức Anh', 'Thu Hà', 'Quốc Bảo', 'Lan Hương'][i % 5]}
                        </p>
                        <p className="text-xs text-foreground/80 mt-0.5">
                          {
                            [
                              'Tuyệt vời quá! Mình cũng muốn tham gia 🌿',
                              'Cảm ơn đã chia sẻ nhé! Rất hữu ích 💚',
                              'Quán này mình hay đến lắm, voucher hời thật!',
                              'Ủng hộ hành động vì môi trường! ♻️',
                              'Thử thách này hay đó, mình sẽ thử ngay!',
                            ][i % 5]
                          }
                        </p>
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-1 ml-3">
                        {['23 phút trước', '1 giờ trước', '2 giờ trước'][i % 3]}
                      </p>
                    </div>
                  </div>
                )
              )}

              {/* User-submitted comments (persisted) */}
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                    B
                  </div>
                  <div className="flex-1">
                    <div className="rounded-2xl rounded-tl-sm bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 px-3 py-2">
                      <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                        Bạn
                      </p>
                      <p className="text-xs text-foreground/80 mt-0.5">
                        {comment.text}
                      </p>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1 ml-3">
                      {formatTime(comment.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {comments.length === 0 && baseCommentCount === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageCircle className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Chưa có bình luận nào
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hãy là người đầu tiên bình luận!
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
                B
              </div>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Viết bình luận..."
                  className="w-full rounded-2xl bg-card border border-border px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 pr-10"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 disabled:opacity-40 transition-opacity"
                  aria-label="Gửi bình luận"
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
