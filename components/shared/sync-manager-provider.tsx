'use client';

import { useSyncManager } from '@/hooks/use-sync-manager';
import type { ReactNode } from 'react';

/**
 * SyncManagerProvider
 *
 * A thin Client Component that mounts the useSyncManager hook.
 * It must be inside AuthProvider so useAuth() works.
 * Renders its children unchanged — it has no visible output.
 */
export function SyncManagerProvider({ children }: { children: ReactNode }) {
  useSyncManager();
  return <>{children}</>;
}
