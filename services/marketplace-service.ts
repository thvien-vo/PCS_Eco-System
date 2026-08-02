import { MOCK_VOUCHERS } from '@/lib/mock-data';
import { Voucher } from '@/types';

export const MarketplaceService = {
  getVouchers: async (): Promise<Voucher[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_VOUCHERS), 400);
    });
  }
};
