import { create } from 'zustand';

interface KioskState {
  isScanning: boolean;
  sessionToken: string | null;
  setIsScanning: (scanning: boolean) => void;
  setSessionToken: (token: string | null) => void;
}

export const useKioskStore = create<KioskState>((set) => ({
  isScanning: false,
  sessionToken: null,
  setIsScanning: (scanning) => set({ isScanning: scanning }),
  setSessionToken: (token) => set({ sessionToken: token }),
}));
