import { CarbonReport } from '@/types';

export const WalletService = {
  getCarbonReport: async (): Promise<CarbonReport> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        co2ReducedKg: 12.5,
        treesPlanted: 3,
        weeklyTrend: [
          { day: 'T2', points: 20 },
          { day: 'T3', points: 40 },
          { day: 'T4', points: 10 },
          { day: 'T5', points: 60 },
          { day: 'T6', points: 30 },
          { day: 'T7', points: 90 },
          { day: 'CN', points: 50 },
        ]
      }), 500);
    });
  }
};
