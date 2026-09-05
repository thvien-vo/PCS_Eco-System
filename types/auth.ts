import type { User, Session } from '@supabase/supabase-js';

/** Re-exported for use across the app — avoids importing from supabase-js directly in UI code. */
export type AuthUser = User;
export type AuthSession = Session;

/** All possible sync actions that can be queued offline. */
export type SyncAction =
  | 'ADD_POINTS'
  | 'DEDUCT_POINTS'
  | 'ADD_TRANSACTION'
  | 'LIKE_POST'
  | 'UNLIKE_POST'
  | 'SAVE_VOUCHER'
  | 'MARK_STORY_VIEWED';

/** A single entry in the offline IndexedDB sync queue. */
export interface SyncQueueEntry {
  /** Unique ID for idempotency checks. */
  id: string;
  /** The action type to replay on Supabase. */
  action: SyncAction;
  /** The userId this action belongs to. */
  userId: string;
  /** Action-specific payload. */
  payload: Record<string, unknown>;
  /** ISO timestamp of when the action was originally performed locally. */
  createdAt: string;
  /** How many times this entry has been retried. */
  retryCount: number;
}

/** Status of the background sync layer. */
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

/** Shape of the auth context value exposed by AuthProvider. */
export interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}
