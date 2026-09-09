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
    if (!user) {
      console.log('[useSyncManager DEBUG] user not logged in, skipping sync');
      return;
    }

    console.log('[useSyncManager DEBUG] mounted, user.id =', user.id);

    async function flush() {
      if (!user || isFlushing.current) {
        console.log('[useSyncManager.flush DEBUG] already flushing or no user, returning');
        return;
      }
      console.log('[useSyncManager.flush DEBUG] starting flush for user', user.id);
      isFlushing.current = true;
      try {
        await flushSyncQueue(user.id);
        console.log('[useSyncManager.flush DEBUG] flush completed successfully');
      } catch (err) {
        console.log('[useSyncManager.flush DEBUG] flush error:', err);
      } finally {
        isFlushing.current = false;
      }
    }

    // Attempt a flush immediately on mount (catches queued actions from a
    // previous offline session that ended with the tab still open).
    console.log('[useSyncManager DEBUG] calling flush on mount');
    flush();

    const handleOnline = () => {
      console.log('[useSyncManager DEBUG] "online" event fired, calling flush');
      flush();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user]);
}
