'use client';

import { useEffect } from 'react';
import { useWalletStore } from '@/store/wallet-store';
import { useFeedStore } from '@/store/feed-store';

/**
 * StoreHydrationProvider — mounted once at the root layout.
 *
 * Manually triggers rehydration for all Zustand stores that use
 * `persist(..., { skipHydration: true })`. This pattern prevents
 * Next.js "Text content does not match server-rendered HTML" errors
 * because the server always renders the store's default initial state,
 * and the client hydration happens *after* mount (inside useEffect).
 *
 * Per pcs-tech-standards §10 — App Router Safeguard (a).
 */
export function StoreHydrationProvider() {
  useEffect(() => {
    // Rehydrate all persisted stores after the client mounts.
    // Components that read persisted values must gate behind useHasMounted().
    useWalletStore.persist.rehydrate();
    useFeedStore.persist.rehydrate();
  }, []);

  // Renders nothing — purely a side-effect component.
  return null;
}
