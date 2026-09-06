'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { useWalletStore } from '@/store/wallet-store';
import { useFeedStore } from '@/store/feed-store';
import { useAuth } from '@/components/shared/auth-provider';
import { migrateLocalDataToSupabase } from '@/lib/supabase/sync-service';
import { Loader2, CloudUpload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { MOTION_TOKENS } from '@/lib/motion-tokens';

interface MergeDataPromptProps {
  onDone: () => void;
}

/**
 * MergeDataPrompt
 *
 * Shown ONCE after a user creates a new account or logs in for the first time.
 * Offers to migrate local anonymous data (points, vouchers, likes) to Supabase.
 * Sets ``pcs-is-synced`` in localStorage after success to prevent repeat prompts.
 *
 * All strings are sourced from dictionaries.ts — no hardcoded Vietnamese.
 */
export function MergeDataPrompt({ onDone }: MergeDataPromptProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const points = useWalletStore((s) => s.points);
  const transactions = useWalletStore((s) => s.transactions);
  const savedVouchers = useFeedStore((s) => s.savedVouchers);
  const likedPosts = useFeedStore((s) => s.likedPosts);

  const [status, setStatus] = useState<'idle' | 'merging' | 'done' | 'error'>(
    'idle',
  );
  const [errorMsg, setErrorMsg] = useState('');

  async function handleMerge() {
    if (!user) return;
    setStatus('merging');
    const result = await migrateLocalDataToSupabase({
      userId: user.id,
      points,
      transactions,
      savedVouchers,
      likedPosts,
    });

    if (result.success) {
      localStorage.setItem('pcs-is-synced', 'true');
      setStatus('done');
      setTimeout(onDone, 1800);
    } else {
      setErrorMsg(result.error ?? t.auth.mergePrompt.mergeError);
      setStatus('error');
    }
  }

  function handleSkip() {
    localStorage.setItem('pcs-is-synced', 'true');
    onDone();
  }

  // Interpolate description string with actual values
  const description = t.auth.mergePrompt.description
    .replace('{points}', String(points))
    .replace('{vouchers}', String(savedVouchers.length));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{
          duration: MOTION_TOKENS.durations.slow,
          ease: MOTION_TOKENS.easing.standard,
        }}
        className="w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-card-dark sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="merge-title"
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
            <CloudUpload size={20} className="text-primary-emerald" aria-hidden="true" />
          </div>
          <button
            onClick={handleSkip}
            aria-label={t.auth.mergePrompt.skipBtn}
            className="rounded-full p-1 text-text-muted transition hover:text-text-primary-light dark:hover:text-text-primary-dark"
          >
            <X size={18} />
          </button>
        </div>

        <h2
          id="merge-title"
          className="mb-2 text-base font-semibold text-text-primary-light dark:text-text-primary-dark"
        >
          {t.auth.mergePrompt.title}
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-text-muted">{description}</p>

        {status === 'done' && (
          <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-primary-emerald dark:bg-emerald-950/30">
            {t.auth.mergePrompt.mergeSuccess}
          </p>
        )}
        {status === 'error' && (
          <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-error-rose dark:bg-rose-950/30">
            {errorMsg}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            disabled={status === 'merging'}
            className="flex-1 rounded-xl border border-border-light py-3 text-sm font-medium text-text-muted transition hover:bg-card-light disabled:opacity-50 dark:border-border-dark dark:hover:bg-bg-dark"
          >
            {t.auth.mergePrompt.skipBtn}
          </button>
          <button
            onClick={handleMerge}
            disabled={status === 'merging' || status === 'done'}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-emerald py-3 text-sm font-semibold text-white transition hover:bg-emerald-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'merging' ? (
              <>
                <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                {t.auth.mergePrompt.merging}
              </>
            ) : (
              t.auth.mergePrompt.confirmBtn
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
