import { MOCK_LEADERBOARD, MOCK_CHALLENGES } from '@/lib/mock-data';
import { LeaderboardEntry, ChallengeCard } from '@/types';

export const ChallengeService = {
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_LEADERBOARD), 300);
    });
  },
  getChallenges: async (): Promise<ChallengeCard[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_CHALLENGES), 300);
    });
  }
};
