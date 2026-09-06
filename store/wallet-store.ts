import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction } from '@/types';
import { enqueueAction } from '@/lib/sync-queue';

// ---------------------------------------------------------------------------
// WalletStore
//
// Source of truth for rendering. All mutations apply synchronously (optimistic).
// When an authenticated userId is supplied, the mutation is also queued to
// IndexedDB so it can be flushed to Supabase once the device is online.
//
// Architecture note: userId is passed INTO actions rather than read from the
// auth context inside the store. Stores must remain framework-agnostic (no
// React hooks). The calling component gets userId from useAuth() and passes it.
// ---------------------------------------------------------------------------

interface WalletState {
  points: number;
  transactions: Transaction[];
  redeemedVouchers: string[];
  hasSeededDemoData: boolean;

  /** Earn points. Pass userId to also queue a Supabase sync action. */
  addPoints: (amount: number, description: string, userId?: string) => void;

  /**
   * Spend points. Returns false if the balance is insufficient.
   * Pass userId to also queue a Supabase sync action.
   */
  deductPoints: (amount: number, description: string, userId?: string) => boolean;

  /** Mark a catalog item as redeemed (client-only, no Supabase sync). */
  addRedeemedVoucher: (id: string) => void;

  /**
   * Idempotent demo-data seed guarded by hasSeededDemoData.
   * Safe under React Strict Mode double-invocation.
   */
  seedDemoTransactions: (mockTxs: Transaction[]) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      points: 500, // initial mock balance
      transactions: [],
      redeemedVouchers: [],
      hasSeededDemoData: false,

      addPoints: (amount, description, userId) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const date = new Date().toISOString();

        set((state) => ({
          points: state.points + amount,
          transactions: [
            { id, type: 'earn', amount, date, description },
            ...state.transactions,
          ],
        }));

        if (userId) {
          // Fire-and-forget — render is synchronous, queue is async.
          void enqueueAction({
            id,
            action: 'ADD_POINTS',
            userId,
            payload: { id, type: 'earn', amount, date, description },
            createdAt: date,
          });
        }
      },

      deductPoints: (amount, description, userId) => {
        const state = get();
        if (state.points < amount) return false;

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const date = new Date().toISOString();

        set((s) => ({
          points: s.points - amount,
          transactions: [
            { id, type: 'redeem', amount, date, description },
            ...s.transactions,
          ],
        }));

        if (userId) {
          void enqueueAction({
            id,
            action: 'DEDUCT_POINTS',
            userId,
            payload: { id, type: 'redeem', amount, date, description },
            createdAt: date,
          });
        }

        return true;
      },

      addRedeemedVoucher: (id) =>
        set((state) => ({
          redeemedVouchers: [...state.redeemedVouchers, id],
        })),

      seedDemoTransactions: (mockTxs) =>
        set((state) => {
          if (state.hasSeededDemoData) return state;

          let addedPoints = 0;
          mockTxs.forEach((tx) => {
            if (tx.type === 'earn') addedPoints += tx.amount;
            if (tx.type === 'redeem') addedPoints -= tx.amount;
          });

          return {
            hasSeededDemoData: true,
            transactions: [...state.transactions, ...mockTxs],
            points: state.points + addedPoints,
          };
        }),
    }),
    {
      name: 'pcs-wallet-store',
      skipHydration: true, // Manually rehydrated via StoreHydrationProvider
    },
  ),
);
