/**
 * lib/supabase/db.ts
 *
 * Typed data-access helpers for every Supabase-backed table.
 *
 * BOUNDARY MAPPING CONVENTION
 * ----------------------------
 * Database columns use snake_case; the app uses camelCase TypeScript
 * interfaces. This file is the ONLY place that translation happens.
 * All callers (stores, sync-service, server components) import from here
 * and work exclusively in camelCase types.
 *
 * SCHEMA IN USE (approved, normalized)
 * ─────────────────────────────────────
 *  profiles           ← UserProfile     (types/settings.ts)
 *  wallets            ← points: number
 *  transactions       ← Transaction     (types/index.ts)
 *  user_saved_vouchers ← voucher_id: string  (NORMALIZED — IDs only)
 *  user_likes         ← post_id: string (IDs only)
 */

import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/types/settings';
import type { Transaction } from '@/types';

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

/**
 * Upsert the user's display profile (name, phone, email, avatarUrl).
 * camelCase → snake_case mapping applied here.
 */
export async function upsertProfile(
  userId: string,
  profile: Partial<UserProfile>,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      ...(profile.name !== undefined && { name: profile.name }),
      ...(profile.phone !== undefined && { phone: profile.phone }),
      ...(profile.email !== undefined && { email: profile.email }),
      ...(profile.avatarUrl !== undefined && { avatar_url: profile.avatarUrl }),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );
  return { error: error?.message ?? null };
}

/**
 * Fetch the user's profile. Returns null if the row doesn't exist yet.
 * snake_case → camelCase mapping applied here.
 */
export async function fetchProfile(
  userId: string,
): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('name, phone, email, avatar_url')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  const row = data as {
    name: string | null;
    phone: string | null;
    email: string | null;
    avatar_url: string | null;
  };

  return {
    name: row.name ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    avatarUrl: row.avatar_url ?? '',
  };
}

// ---------------------------------------------------------------------------
// Wallet points
// ---------------------------------------------------------------------------

/** Fetch the current wallet points balance. Returns null on any error. */
export async function fetchWalletPoints(
  userId: string,
): Promise<number | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('wallets')
    .select('points')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return (data as { points: number }).points;
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

/** Fetch all of the user's transactions, newest-first. */
export async function fetchTransactions(
  userId: string,
): Promise<Transaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('id, type, amount, date, description')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error || !data) return [];

  type TxRow = {
    id: string;
    type: 'earn' | 'redeem';
    amount: number;
    date: string;
    description: string | null;
  };

  return (data as TxRow[]).map((row) => ({
    id: row.id,
    type: row.type,
    amount: row.amount,
    date: row.date,
    description: row.description ?? '',
  }));
}

/**
 * Insert a single transaction row.
 * Idempotent: duplicate `id` (23505) is silently ignored.
 */
export async function insertTransaction(
  userId: string,
  tx: Transaction,
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.from('transactions').insert({
    id: tx.id,
    user_id: userId,
    type: tx.type,
    amount: tx.amount,
    date: tx.date,
    description: tx.description,
  });
  // 23505 = unique_violation — already synced, not an error.
  if (error && error.code !== '23505') return { error: error.message };
  return { error: null };
}

// ---------------------------------------------------------------------------
// Saved Vouchers  (NORMALIZED — stores only voucher_id, not full detail)
// ---------------------------------------------------------------------------

/** Fetch all saved voucher IDs for a user. */
export async function fetchSavedVoucherIds(
  userId: string,
): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_saved_vouchers')
    .select('voucher_id')
    .eq('user_id', userId);

  if (error || !data) return [];
  return (data as { voucher_id: string }[]).map((row) => row.voucher_id);
}

/**
 * Insert a saved voucher row.
 * Idempotent: the composite PK (user_id, voucher_id) prevents duplicates.
 */
export async function insertSavedVoucher(
  userId: string,
  voucherId: string,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('user_saved_vouchers')
    .insert({ user_id: userId, voucher_id: voucherId });
  if (error && error.code !== '23505') return { error: error.message };
  return { error: null };
}

/** Delete a saved voucher row. */
export async function deleteSavedVoucher(
  userId: string,
  voucherId: string,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('user_saved_vouchers')
    .delete()
    .eq('user_id', userId)
    .eq('voucher_id', voucherId);
  return { error: error?.message ?? null };
}

// ---------------------------------------------------------------------------
// Liked Posts  (NORMALIZED — stores only post_id)
// ---------------------------------------------------------------------------

/** Fetch all liked post IDs for a user. */
export async function fetchLikedPostIds(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_likes')
    .select('post_id')
    .eq('user_id', userId);

  if (error || !data) return [];
  return (data as { post_id: string }[]).map((row) => row.post_id);
}
