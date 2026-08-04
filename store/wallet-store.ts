import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction } from '@/types';

interface WalletState {
  points: number;
  transactions: Transaction[];
  redeemedVouchers: string[];
  hasSeededDemoData: boolean;
  addPoints: (amount: number, description: string) => void;
  deductPoints: (amount: number, description: string) => boolean;
  addRedeemedVoucher: (id: string) => void;
  /**
   * Idempotent action to seed demo transactions.
   * Checks the `hasSeededDemoData` flag inside the setter to prevent
   * double-seeding under React Strict Mode.
   */
  seedDemoTransactions: (mockTxs: Transaction[]) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      points: 500, // Initial mock points
      transactions: [],
      redeemedVouchers: [],
      hasSeededDemoData: false,
      
      addPoints: (amount, description) => set((state) => ({
        points: state.points + amount,
        transactions: [
          { id: Date.now().toString(), type: 'earn', amount, date: new Date().toISOString(), description },
          ...state.transactions
        ]
      })),
      
      deductPoints: (amount, description) => {
        const state = get();
        if (state.points >= amount) {
          set((s) => ({
            points: s.points - amount,
            transactions: [
              { id: Date.now().toString(), type: 'redeem', amount, date: new Date().toISOString(), description },
              ...s.transactions
            ]
          }));
          return true;
        }
        return false;
      },
      
      addRedeemedVoucher: (id) => set((state) => ({
        redeemedVouchers: [...state.redeemedVouchers, id]
      })),
      
      seedDemoTransactions: (mockTxs) => set((state) => {
        if (state.hasSeededDemoData) return state; // Strictly idempotent
        
        // Calculate points delta from mock transactions to ensure points stay consistent
        // with the newly added history. We assume mockTxs are already sorted newest first.
        let addedPoints = 0;
        mockTxs.forEach(tx => {
          if (tx.type === 'earn') addedPoints += tx.amount;
          if (tx.type === 'redeem') addedPoints -= tx.amount;
        });

        return {
          hasSeededDemoData: true,
          // Append mock transactions AFTER any existing real transactions
          transactions: [...state.transactions, ...mockTxs],
          points: state.points + addedPoints,
        };
      })
    }),
    {
      name: 'pcs-wallet-store',
      skipHydration: true, // We will manually handle hydration in a provider or component
    }
  )
);
