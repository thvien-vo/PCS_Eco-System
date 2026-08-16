import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'vi' | 'en';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      // CRITICAL: Default locale must be Vietnamese. No auto-detection.
      locale: 'vi',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'pcs-locale-storage',
      skipHydration: true, // Handled by StoreHydrationProvider
    }
  )
);
