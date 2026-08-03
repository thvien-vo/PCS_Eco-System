import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedVoucherDetail } from '@/types';

// ---------------------------------------------------------------------------
// Feed Store — persisted via localStorage with skipHydration: true.
//
// Hydration pattern: pcs-tech-standards §10(a)
//   - skipHydration: true prevents SSR mismatch
//   - StoreHydrationProvider (root layout) calls rehydrate() after mount
//   - Every consumer component must gate behind useHasMounted() hook
// ---------------------------------------------------------------------------

interface CommentEntry {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

interface FeedState {
  // Like state: Set of post IDs that the current user has liked
  likedPosts: string[];
  // Comment state: map of postId → CommentEntry[]
  commentsByPost: Record<string, CommentEntry[]>;
  // Saved vouchers (ID list for quick lookup)
  savedVouchers: string[];
  // Full voucher details so Module 4 can display them
  savedVoucherDetails: SavedVoucherDetail[];
  // Viewed stories
  viewedStories: string[];

  // --- Actions ---
  toggleLikePost: (postId: string) => void;
  addComment: (postId: string, text: string, author?: string) => void;
  saveVoucher: (voucher: SavedVoucherDetail) => void;
  markStoryViewed: (storyId: string) => void;
  isPostLiked: (postId: string) => boolean;
  isVoucherSaved: (voucherId: string) => boolean;
  getComments: (postId: string) => CommentEntry[];
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set, get) => ({
      likedPosts: [],
      commentsByPost: {},
      savedVouchers: [],
      savedVoucherDetails: [],
      viewedStories: [],

      toggleLikePost: (postId) =>
        set((state) => ({
          likedPosts: state.likedPosts.includes(postId)
            ? state.likedPosts.filter((id) => id !== postId)
            : [...state.likedPosts, postId],
        })),

      addComment: (postId, text, author = 'Bạn') =>
        set((state) => {
          const existing = state.commentsByPost[postId] ?? [];
          const newComment: CommentEntry = {
            id: `${postId}-${Date.now()}`,
            author,
            text,
            timestamp: new Date().toISOString(),
          };
          return {
            commentsByPost: {
              ...state.commentsByPost,
              [postId]: [...existing, newComment],
            },
          };
        }),

      saveVoucher: (voucher) =>
        set((state) => {
          // Idempotent: don't save duplicates
          if (state.savedVouchers.includes(voucher.id)) return state;
          return {
            savedVouchers: [...state.savedVouchers, voucher.id],
            savedVoucherDetails: [...state.savedVoucherDetails, voucher],
          };
        }),

      markStoryViewed: (storyId) =>
        set((state) => ({
          viewedStories: state.viewedStories.includes(storyId)
            ? state.viewedStories
            : [...state.viewedStories, storyId],
        })),

      isPostLiked: (postId) => get().likedPosts.includes(postId),

      isVoucherSaved: (voucherId) => get().savedVouchers.includes(voucherId),

      getComments: (postId) => get().commentsByPost[postId] ?? [],
    }),
    {
      name: 'pcs-feed-store',
      skipHydration: true, // Rehydrated manually via StoreHydrationProvider
    }
  )
);
