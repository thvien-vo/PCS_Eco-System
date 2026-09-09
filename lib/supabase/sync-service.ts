import { createClient } from '@/lib/supabase/client';
import type { SyncQueueEntry } from '@/types/auth';
import type { UserProfile } from '@/types/settings';
import {
  peekQueue,
  removeEntry,
  incrementRetry,
  MAX_RETRY_COUNT,
} from '@/lib/sync-queue';
import {
  insertTransaction,
  insertSavedVoucher,
  deleteSavedVoucher,
  upsertProfile,
} from '@/lib/supabase/db';

/**
 * Process a single SyncQueueEntry against Supabase.
 * Returns true on success, false on failure.
 */
async function processEntry(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  entry: SyncQueueEntry,
): Promise<boolean> {
  try {
    switch (entry.action) {
      // ── Wallet ────────────────────────────────────────────────────────────
      case 'ADD_TRANSACTION':
      case 'ADD_POINTS':
      case 'DEDUCT_POINTS': {
        console.log('[SyncService.processEntry DEBUG]', entry.action, 'entry:', entry);
        // Insert the transaction row via DAL (idempotent).
        const { error } = await insertTransaction(userId, {
          id: entry.payload['id'] as string ?? entry.id,
          type: entry.payload['type'] as 'earn' | 'redeem',
          amount: entry.payload['amount'] as number,
          date: entry.payload['date'] as string ?? entry.createdAt,
          description: entry.payload['description'] as string ?? '',
        });
        console.log('[SyncService.processEntry DEBUG] insertTransaction result — error:', error);
        if (error) throw new Error(error);

        // Also keep wallets.points in sync via atomic RPC.
        if (entry.action === 'ADD_POINTS') {
          console.log('[SyncService.processEntry DEBUG] Calling increment_points RPC');
          const rpcResult = await supabase.rpc('increment_points', {
            user_uuid: userId,
            delta: entry.payload['amount'] as number,
          });
          console.log('[SyncService.processEntry DEBUG] increment_points RPC result:', rpcResult);
        } else if (entry.action === 'DEDUCT_POINTS') {
          const rpcResult = await supabase.rpc('decrement_points', {
            user_uuid: userId,
            delta: entry.payload['amount'] as number,
          });
          console.log('[SyncService.processEntry DEBUG] decrement_points RPC result:', rpcResult);
        }
        break;
      }

      // ── Feed — Likes ──────────────────────────────────────────────────────
      case 'LIKE_POST': {
        const { error } = await supabase
          .from('user_likes')
          .insert({ user_id: userId, post_id: entry.payload['postId'] as string });
        if (error && error.code !== '23505') throw error;
        break;
      }

      case 'UNLIKE_POST': {
        const { error } = await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', entry.payload['postId'] as string);
        if (error) throw error;
        break;
      }

      // ── Feed — Saved Vouchers (NORMALIZED — ID only) ──────────────────────
      case 'SAVE_VOUCHER': {
        const { error } = await insertSavedVoucher(
          userId,
          entry.payload['voucherId'] as string,
        );
        if (error) throw new Error(error);
        break;
      }

      case 'UNSAVE_VOUCHER': {
        const { error } = await deleteSavedVoucher(
          userId,
          entry.payload['voucherId'] as string,
        );
        if (error) throw new Error(error);
        break;
      }

      // ── Profile ───────────────────────────────────────────────────────────
      case 'UPDATE_PROFILE': {
        const { error } = await upsertProfile(
          userId,
          entry.payload['profile'] as Partial<UserProfile>,
        );
        if (error) throw new Error(error);
        break;
      }

      // ── Stories ───────────────────────────────────────────────────────────
      case 'MARK_STORY_VIEWED': {
        // Best-effort — ignore errors, no retry.
        await supabase.from('user_viewed_stories').insert({
          user_id: userId,
          story_id: entry.payload['storyId'] as string,
        });
        break;
      }

      default:
        // Unknown action — drop silently.
        break;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Flush all pending entries in the IndexedDB queue to Supabase.
 * Entries are processed sequentially to avoid out-of-order conflicts.
 * Entries that fail are retried up to MAX_RETRY_COUNT times before being
 * treated as dead-letters and dropped (logged to console in dev).
 */
export async function flushSyncQueue(userId: string): Promise<void> {
  console.log('[flushSyncQueue DEBUG] starting flush for user', userId);
  const supabase = createClient();

  // Verify session exists before processing queue
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  console.log('[flushSyncQueue DEBUG] auth session check:', {
    hasSession: !!sessionData?.session,
    sessionUserId: sessionData?.session?.user?.id,
    sessionError,
  });

  const queue = await peekQueue();
  console.log('[flushSyncQueue DEBUG] queue entries count:', queue.length);

  for (const entry of queue) {
    // Only process entries that belong to the current user.
    if (entry.userId !== userId) {
      console.log('[flushSyncQueue DEBUG] skipping entry for different user:', entry.userId);
      continue;
    }
    console.log('[flushSyncQueue DEBUG] processing entry:', entry);

    const success = await processEntry(supabase, userId, entry);

    if (success) {
      await removeEntry(entry.id);
    } else {
      await incrementRetry(entry.id);
      if (entry.retryCount + 1 >= MAX_RETRY_COUNT) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[SyncService] Dead-letter entry dropped:', entry);
        }
        await removeEntry(entry.id);
      }
    }
  }
}

/**
 * Bulk upsert local anonymous data to Supabase on first-time login.
 * Called once after the `isSynced` flag is checked and confirmed false.
 */
export async function migrateLocalDataToSupabase(params: {
  userId: string;
  points: number;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    date: string;
    description: string;
  }>;
  savedVouchers: string[];
  likedPosts: string[];
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    // 1. Upsert wallet points.
    const { error: walletError } = await supabase
      .from('wallets')
      .upsert({ id: params.userId, points: params.points });
    if (walletError) throw walletError;

    // 2. Insert all transactions (ON CONFLICT DO NOTHING via ignoreDuplicates).
    if (params.transactions.length > 0) {
      const rows = params.transactions.map((tx) => ({
        id: tx.id,
        user_id: params.userId,
        type: tx.type,
        amount: tx.amount,
        date: tx.date,
        description: tx.description,
      }));
      const { error: txError } = await supabase
        .from('transactions')
        .upsert(rows, { ignoreDuplicates: true });
      if (txError) throw txError;
    }

    // 3. Insert saved vouchers (normalized, idempotent).
    if (params.savedVouchers.length > 0) {
      const voucherRows = params.savedVouchers.map((voucherId) => ({
        user_id: params.userId,
        voucher_id: voucherId,
      }));
      const { error: vError } = await supabase
        .from('user_saved_vouchers')
        .upsert(voucherRows, { ignoreDuplicates: true });
      if (vError) throw vError;
    }

    // 4. Insert liked posts (normalized, idempotent).
    if (params.likedPosts.length > 0) {
      const likeRows = params.likedPosts.map((postId) => ({
        user_id: params.userId,
        post_id: postId,
      }));
      const { error: lError } = await supabase
        .from('user_likes')
        .upsert(likeRows, { ignoreDuplicates: true });
      if (lError) throw lError;
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}
