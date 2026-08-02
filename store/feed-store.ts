import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FeedState {
  savedVouchers: string[];
  likedPosts: string[];
  toggleSaveVoucher: (id: string) => void;
  toggleLikePost: (id: string) => void;
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set) => ({
      savedVouchers: [],
      likedPosts: [],
      toggleSaveVoucher: (id) => set((state) => ({
        savedVouchers: state.savedVouchers.includes(id) 
          ? state.savedVouchers.filter(vId => vId !== id)
          : [...state.savedVouchers, id]
      })),
      toggleLikePost: (id) => set((state) => ({
        likedPosts: state.likedPosts.includes(id)
          ? state.likedPosts.filter(pId => pId !== id)
          : [...state.likedPosts, id]
      }))
    }),
    {
      name: 'pcs-feed-store',
      skipHydration: true,
    }
  )
);
