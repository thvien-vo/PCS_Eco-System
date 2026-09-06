import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types/settings';
import { enqueueAction } from '@/lib/sync-queue';

// ---------------------------------------------------------------------------
// ProfileStore
//
// Persists name, phone, email, avatarUrl (Module 9 — Personal Info screen).
// When a userId is supplied to setProfile, the change is also enqueued for
// Supabase sync via the UPDATE_PROFILE action → profiles table.
//
// What stays LOCAL ONLY (never synced):
//   - locale (vi/en) lives in locale-store.ts
//   - hasSeededDemoData lives in wallet-store.ts
//   - kiosk transient state lives in kiosk-store.ts
// ---------------------------------------------------------------------------

interface ProfileState {
  profile: UserProfile;
  /**
   * Merge partial profile fields into state.
   * Pass userId to also enqueue a Supabase sync (UPDATE_PROFILE action).
   * Omitting userId keeps the change local only (anonymous / not yet signed in).
   */
  setProfile: (profile: Partial<UserProfile>, userId?: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: {
        name: 'Nguyễn Văn An',
        phone: '0901234567',
        email: 'an.nguyen@example.com',
        avatarUrl: `https://picsum.photos/seed/${encodeURIComponent('Nguyễn Văn An')}/200/200`,
      },

      setProfile: (newProfile, userId) => {
        set((state) => ({
          profile: { ...state.profile, ...newProfile },
        }));

        if (userId) {
          void enqueueAction({
            id: `profile-${userId}-${Date.now()}`,
            action: 'UPDATE_PROFILE',
            userId,
            payload: { profile: newProfile },
            createdAt: new Date().toISOString(),
          });
        }
      },
    }),
    {
      name: 'pcs-profile-storage',
      skipHydration: true, // Handled by StoreHydrationProvider
    },
  ),
);
