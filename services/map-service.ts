import { MOCK_STATIONS } from '@/lib/mock-data';
import { Station } from '@/types';

export const MapService = {
  getStations: async (): Promise<Station[]> => {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_STATIONS), 300);
    });
  }
};
