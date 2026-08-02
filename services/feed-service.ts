import { MOCK_POSTS } from '@/lib/mock-data';
import { FeedPost } from '@/types';

export const FeedService = {
  getPosts: async (): Promise<FeedPost[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_POSTS), 400);
    });
  }
};
