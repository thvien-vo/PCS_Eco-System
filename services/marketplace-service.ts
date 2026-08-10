import { MOCK_CATALOG_ITEMS } from '@/lib/mock-data';
import type { MarketplaceCatalogItem, CatalogCategory } from '@/types';

export const MarketplaceService = {
  /**
   * Returns the full redemption catalog.
   * Simulates a 400ms network round-trip.
   */
  getCatalogItems: async (): Promise<MarketplaceCatalogItem[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_CATALOG_ITEMS), 400);
    });
  },

  /**
   * Returns items filtered by category.
   */
  getCatalogByCategory: async (
    category: CatalogCategory,
  ): Promise<MarketplaceCatalogItem[]> => {
    return new Promise((resolve) => {
      setTimeout(
        () => resolve(MOCK_CATALOG_ITEMS.filter((item) => item.category === category)),
        300,
      );
    });
  },
};
