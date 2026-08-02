import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction } from '@/types';

interface WalletState {
  points: number;
  transactions: Transaction[];
  redeemedVouchers: string[];
  addPoints: (amount: number, description: string) => void;
  deductPoints: (amount: number, description: string) => boolean;
  addRedeemedVoucher: (id: string) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      points: 500, // Initial mock points
      transactions: [],
      redeemedVouchers: [],
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
      }))
    }),
    {
      name: 'pcs-wallet-store',
      skipHydration: true, // We will manually handle hydration in a provider or component
    }
  )
);
