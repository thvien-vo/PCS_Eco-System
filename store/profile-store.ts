import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types/settings';
import { enqueueAction } from '@/lib/sync-queue';
import { fetchProfile } from '@/lib/supabase/db';

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
  /**
   * Pull the user's profile row down from Supabase and merge it into local
   * state — used on login so a returning user's profile (set on a different
   * device) reaches this device.
   *
   * Only non-empty remote fields overwrite local ones. This is deliberately
   * a partial merge, not a blind overwrite: a brand-new Supabase user has a
   * blank `profiles` row (auto-created by the handle_new_user trigger with
   * empty name/phone/avatar), and blindly applying that would wipe out a
   * pre-existing anonymous local profile on first login, before the local
   * data has had a chance to sync up via setProfile/MergeDataPrompt.
   */
  hydrateFromSupabase: (userId: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
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

      hydrateFromSupabase: async (userId) => {
        const remote = await fetchProfile(userId);
        if (!remote) return;

        const current = get().profile;
        set({
          profile: {
            name: remote.name || current.name,
            phone: remote.phone || current.phone,
            email: remote.email || current.email,
            avatarUrl: remote.avatarUrl || current.avatarUrl,
          },
        });
      },
    }),
    {
      name: 'pcs-profile-storage',
      skipHydration: true, // Handled by StoreHydrationProvider
    },
  ),
);
