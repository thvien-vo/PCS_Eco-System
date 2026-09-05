'use client';

import { useEffect, useRef } from 'react';
import { flushSyncQueue } from '@/lib/supabase/sync-service';
import { useAuth } from '@/components/shared/auth-provider';

/**
 * useSyncManager
 *
 * A hook that listens to the browser `online` event and automatically
 * flushes the IndexedDB offline action queue whenever connectivity is
 * restored — but only when the user is logged in.
 *
 * Usage: mount once in a root Client Component (e.g. SyncManagerProvider).
 * Anonymous users are completely unaffected — the flush is skipped silently.
 */
export function useSyncManager() {
  const { user } = useAuth();
  const isFlushing = useRef(false);

  useEffect(() => {
    if (!user) return;

    async function flush() {
      if (!user || isFlushing.current) return;
      isFlushing.current = true;
      try {
        await flushSyncQueue(user.id);
      } finally {
        isFlushing.current = false;
      }
    }

    // Attempt a flush immediately on mount (catches queued actions from a
    // previous offline session that ended with the tab still open).
    flush();

    window.addEventListener('online', flush);
    return () => window.removeEventListener('online', flush);
  }, [user]);
}
