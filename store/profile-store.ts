import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types/settings';

interface ProfileState {
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;
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
      setProfile: (newProfile) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...newProfile,
          },
        })),
    }),
    {
      name: 'pcs-profile-storage',
      skipHydration: true, // Handled by StoreHydrationProvider
    }
  )
);
