'use client';

/**
 * FriendPickerModal — Module 3 gift-a-voucher friend picker.
 *
 * Opens as a bottom-sheet style modal. Mock friends list.
 * No real data sent — purely UI demonstration.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Check, Search } from 'lucide-react';
import Image from 'next/image';
import { MOCK_FRIENDS } from '@/lib/mock-data';
import { MOTION_TOKENS } from '@/lib/motion-tokens';
import { useTranslation } from '@/hooks/use-translation';
import { ModalPortal } from '@/components/shared/modal-portal';

interface FriendPickerModalProps {
  isOpen: boolean;
  voucherTitle: string;
  onClose: () => void;
}

export function FriendPickerModal({ isOpen, voucherTitle, onClose }: FriendPickerModalProps) {
  const { t } = useTranslation();
  const tm = t.feed.friendPicker;

  const [selected, setSelected] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = MOCK_FRIENDS.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));

  function handleSend() {
    if (!selected) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setSelected(null);
      setQuery('');
      onClose();
    }, 1500);
  }

  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MOTION_TOKENS.durations.base }}
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[95] mx-auto w-full max-w-sm rounded-t-3xl border-t border-border bg-background shadow-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ ...MOTION_TOKENS.spring.gentle }}
            >
              {/* Handle */}
              <div className="flex justify-center pb-1 pt-3">
                <div className="h-1 w-10 rounded-full bg-border" />
              </div>

              <div className="px-5 pb-6">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-foreground">{tm.title}</h2>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{voucherTitle}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={tm.closeAria}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    placeholder={tm.searchPlaceholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                {/* Friends list */}
                <div className="scrollbar-hide max-h-52 space-y-2 overflow-y-auto">
                  {filtered.map((friend) => {
                    const isSelected = selected === friend.id;
                    return (
                      <motion.button
                        key={friend.id}
                        onClick={() => setSelected(isSelected ? null : friend.id)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                            : 'hover:bg-card/80 border-border bg-card'
                        }`}
                        whileTap={{ scale: 0.97 }}
                      >
                        {/* Avatar */}
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                          <Image
                            src={friend.avatarUrl}
                            alt={friend.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          {/* Online dot */}
                          {friend.isOnline && (
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
                          )}
                        </div>

                        {/* Name + status */}
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-foreground">{friend.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {friend.isOnline ? tm.online : tm.offline}
                          </p>
                        </div>

                        {/* Selected check */}
                        {isSelected && (
                          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Send button */}
                <motion.button
                  onClick={handleSend}
                  disabled={!selected || sent}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all ${
                    selected && !sent
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:opacity-90 active:scale-95'
                      : 'cursor-not-allowed bg-border text-muted-foreground'
                  }`}
                  whileTap={selected && !sent ? { scale: 0.97 } : {}}
                >
                  {sent ? (
                    <>
                      <Check className="h-4 w-4" />
                      {tm.success}
                    </>
                  ) : (
                    <>
                      <Gift className="h-4 w-4" />
                      {selected ? tm.sendNow : tm.chooseFriend}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
