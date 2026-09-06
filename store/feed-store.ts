import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedVoucherDetail } from '@/types';
import { enqueueAction } from '@/lib/sync-queue';

// ---------------------------------------------------------------------------
// FeedStore
//
// Persisted to localStorage (skipHydration: true — pcs-tech-standards §10a).
//
// Sync pattern: actions accept an optional `userId`. When provided the mutation
// is also enqueued in IndexedDB. Anonymous users get identical behaviour with
// no sync side-effect — zero breaking changes to existing call-sites.
// ---------------------------------------------------------------------------

interface CommentEntry {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

interface FeedState {
  /** IDs of posts the current user has liked */
  likedPosts: string[];
  /** postId → comments */
  commentsByPost: Record<string, CommentEntry[]>;
  /** Saved voucher IDs for quick lookup */
  savedVouchers: string[];
  /** Full voucher details for Module 4 wallet display (client-only; not synced) */
  savedVoucherDetails: SavedVoucherDetail[];
  /** Story IDs the user has already viewed */
  viewedStories: string[];

  // --- Actions ---
  toggleLikePost: (postId: string, userId?: string) => void;
  addComment: (postId: string, text: string, author?: string) => void;
  saveVoucher: (voucher: SavedVoucherDetail, userId?: string) => void;
  unsaveVoucher: (voucherId: string, userId?: string) => void;
  markStoryViewed: (storyId: string, userId?: string) => void;

  // --- Derived selectors ---
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

      toggleLikePost: (postId, userId) => {
        const isLiked = get().likedPosts.includes(postId);

        set((state) => ({
          likedPosts: isLiked
            ? state.likedPosts.filter((id) => id !== postId)
            : [...state.likedPosts, postId],
        }));

        if (userId) {
          void enqueueAction({
            id: `${isLiked ? 'unlike' : 'like'}-${postId}-${Date.now()}`,
            action: isLiked ? 'UNLIKE_POST' : 'LIKE_POST',
            userId,
            payload: { postId },
            createdAt: new Date().toISOString(),
          });
        }
      },

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

      saveVoucher: (voucher, userId) => {
        if (get().savedVouchers.includes(voucher.id)) return; // idempotent

        set((state) => ({
          savedVouchers: [...state.savedVouchers, voucher.id],
          savedVoucherDetails: [...state.savedVoucherDetails, voucher],
        }));

        if (userId) {
          // Sync only the ID — schema is normalized (user_saved_vouchers stores voucher_id only).
          void enqueueAction({
            id: `save-${voucher.id}-${Date.now()}`,
            action: 'SAVE_VOUCHER',
            userId,
            payload: { voucherId: voucher.id },
            createdAt: new Date().toISOString(),
          });
        }
      },

      unsaveVoucher: (voucherId, userId) => {
        set((state) => ({
          savedVouchers: state.savedVouchers.filter((id) => id !== voucherId),
          savedVoucherDetails: state.savedVoucherDetails.filter(
            (v) => v.id !== voucherId,
          ),
        }));

        if (userId) {
          void enqueueAction({
            id: `unsave-${voucherId}-${Date.now()}`,
            action: 'UNSAVE_VOUCHER',
            userId,
            payload: { voucherId },
            createdAt: new Date().toISOString(),
          });
        }
      },

      markStoryViewed: (storyId, userId) => {
        if (get().viewedStories.includes(storyId)) return; // idempotent

        set((state) => ({
          viewedStories: [...state.viewedStories, storyId],
        }));

        if (userId) {
          void enqueueAction({
            id: `story-${storyId}-${Date.now()}`,
            action: 'MARK_STORY_VIEWED',
            userId,
            payload: { storyId },
            createdAt: new Date().toISOString(),
          });
        }
      },

      isPostLiked: (postId) => get().likedPosts.includes(postId),
      isVoucherSaved: (voucherId) => get().savedVouchers.includes(voucherId),
      getComments: (postId) => get().commentsByPost[postId] ?? [],
    }),
    {
      name: 'pcs-feed-store',
      skipHydration: true,
    },
  ),
);
