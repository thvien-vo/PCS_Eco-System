'use client';

/**
 * Module 6 — Green Rewards Marketplace
 *
 * Architecture:
 *  • Reads REAL wallet-store points (no mock values) — persisted Zustand store.
 *  • Hydration guard: hasMounted state flips in useEffect; renders skeleton until true.
 *  • Category filter tabs (Tất cả / Mã giảm giá / Quà tặng / Hoàn tiền).
 *  • 2-column catalog grid, each card handled by <CatalogCard />.
 *  • Successful redemption flow:
 *      1. Ref-based double-click lock in CatalogCard (event-level, stale-closure safe).
 *      2. deductPoints() in wallet-store (atomic, persisted — reflects in Module 4 immediately).
 *      3. addRedeemedVoucher() records item id so card shows "Đã đổi" state.
 *      4. ParticleBurst fires (SPOT 3/3 — final allowed usage per §8).
 *      5. RedemptionSuccessModal opens with fake code.
 *  • "Not enough points" items show blur + "Xem cách kiếm thêm điểm" → /challenge.
 *
 * Per pcs-design-system §8: ParticleBurst is STRICTLY used here as SPOT 3.
 * Per pcs-tech-standards §10a: skipHydration → hasMounted guard.
 */

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, ShoppingBag, Tag, Wallet, RefreshCw } from 'lucide-react';
import { useWalletStore } from '@/store/wallet-store';
import { MarketplaceService } from '@/services/marketplace-service';
import { ParticleBurst } from '@/components/shared/particle-burst';
import { CatalogCard } from '@/components/marketplace/catalog-card';
import { MarketplaceSkeleton } from '@/components/marketplace/marketplace-skeleton';
import { RedemptionSuccessModal } from '@/components/marketplace/redemption-success-modal';
import { MOTION_TOKENS } from '@/lib/motion-tokens';
import { cn } from '@/lib/utils';
import type { MarketplaceCatalogItem, CatalogCategory } from '@/types';

// ── Filter tab config ─────────────────────────────────────────────────────────
type FilterTab = 'all' | CatalogCategory;

const FILTER_TABS: { id: FilterTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'all', label: 'Tất cả', icon: ShoppingBag },
  { id: 'voucher', label: 'Mã giảm', icon: Tag },
  { id: 'gift', label: 'Quà tặng', icon: Gift },
  { id: 'cashback', label: 'Hoàn tiền', icon: Wallet },
];

// ── Stagger animation for grid items ─────────────────────────────────────────
const GRID_STAGGER = 0.06; // seconds between card reveals

export default function MarketplacePage() {
  // ── Hydration guard (pcs-tech-standards §10a) ────────────────────────────
  const [hasMounted, setHasMounted] = useState(false);

  // ── Wallet store — real points from persisted Zustand store ──────────────
  const points = useWalletStore((s) => s.points);
  const deductPoints = useWalletStore((s) => s.deductPoints);
  const redeemedVouchers = useWalletStore((s) => s.redeemedVouchers);
  const addRedeemedVoucher = useWalletStore((s) => s.addRedeemedVoucher);

  // ── Catalog data ──────────────────────────────────────────────────────────
  const [catalogItems, setCatalogItems] = useState<MarketplaceCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [successItem, setSuccessItem] = useState<MarketplaceCatalogItem | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // ── Particle burst state ──────────────────────────────────────────────────
  const [burstTrigger, setBurstTrigger] = useState(false);
  const [burstOrigin, setBurstOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // ── Hydration: manually rehydrate wallet store after mount ────────────────
  useEffect(() => {
    useWalletStore.persist.rehydrate();
    setHasMounted(true);
  }, []);

  // ── Fetch catalog on mount ────────────────────────────────────────────────
  const fetchCatalog = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const items = await MarketplaceService.getCatalogItems();
      setCatalogItems(items);
    } catch {
      setFetchError('Không thể tải danh sách phần thưởng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // ── Derived: filtered items ───────────────────────────────────────────────
  const filteredItems =
    activeFilter === 'all'
      ? catalogItems
      : catalogItems.filter((item) => item.category === activeFilter);

  // ── Redemption handler ────────────────────────────────────────────────────
  /**
   * Called by CatalogCard after its own ref-based guard has already fired.
   * This handler performs:
   *  1. deductPoints()     — atomic wallet update (persisted, seen by Module 4)
   *  2. addRedeemedVoucher() — marks item as redeemed in store
   *  3. ParticleBurst     — SPOT 3 (final usage, per §8)
   *  4. Success modal     — show redemption code
   */
  const handleRedeem = useCallback(
    (item: MarketplaceCatalogItem, originPosition: { x: number; y: number }) => {
      // Double-safety: verify sufficient balance at handler time
      // (card's ref guard already checked, but wallet could have changed)
      const success = deductPoints(
        item.pointsCost,
        `Đổi thưởng: ${item.title} (${item.partnerName})`,
      );
      if (!success) return; // Shouldn't happen if card guard is correct, but belt-and-suspenders

      // Mark as redeemed in store
      addRedeemedVoucher(item.id);

      // Fire particle burst — SPOT 3 (Module 6 successful redemption)
      setBurstOrigin(originPosition);
      setBurstTrigger(true);

      // Open success modal
      setSuccessItem(item);
      setIsSuccessModalOpen(true);
    },
    [deductPoints, addRedeemedVoucher],
  );

  const handleBurstComplete = useCallback(() => {
    setBurstTrigger(false);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsSuccessModalOpen(false);
    setSuccessItem(null);
  }, []);

  // ── Render: skeleton until hydrated ──────────────────────────────────────
  if (!hasMounted || isLoading) {
    return (
      <div className="flex min-h-full flex-col">
        <MarketplaceHeader points={0} isLoading />
        <MarketplaceSkeleton />
      </div>
    );
  }

  // ── Render: error state ───────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="flex min-h-full flex-col">
        <MarketplaceHeader points={points} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-error/10">
            <Gift className="h-8 w-8 text-error" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Đã xảy ra lỗi</h3>
            <p className="mt-1 text-sm text-muted-foreground">{fetchError}</p>
          </div>
          <button
            id="marketplace-retry"
            onClick={fetchCatalog}
            className="flex items-center gap-2 rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-white min-h-[44px]"
          >
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Particle burst — SPOT 3/3 per §8 — Module 6 redemption ── */}
      <ParticleBurst
        trigger={burstTrigger}
        originPosition={burstOrigin}
        onComplete={handleBurstComplete}
        color="var(--neon-mint)"
      />

      {/* ── Redemption success modal ── */}
      <RedemptionSuccessModal
        item={successItem}
        isOpen={isSuccessModalOpen}
        onClose={handleModalClose}
      />

      <div className="flex min-h-full flex-col">
        {/* ── Hero header with live points balance ── */}
        <MarketplaceHeader points={points} />

        {/* ── Filter tabs ── */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1 scrollbar-hide">
          {FILTER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <motion.button
                key={tab.id}
                id={`filter-tab-${tab.id}`}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(tab.id)}
                className={cn(
                  'flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold',
                  'transition-all duration-150 min-h-[36px]',
                  isActive
                    ? 'border-emerald bg-emerald text-white shadow-sm'
                    : 'border-border bg-card text-muted-foreground hover:border-emerald/50 hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* ── Count indicator ── */}
        <div className="px-4 pb-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeFilter}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: MOTION_TOKENS.durations.fast }}
              className="text-xs text-muted-foreground"
            >
              {filteredItems.length} phần thưởng
            </motion.p>
          </AnimatePresence>
        </div>

        {/* ── Catalog grid ── */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <Gift className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              Không có phần thưởng trong danh mục này
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-4 pb-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: MOTION_TOKENS.durations.base,
                  delay: index * GRID_STAGGER,
                  ease: MOTION_TOKENS.easing.enter,
                }}
              >
                <CatalogCard
                  item={item}
                  currentPoints={points}
                  isAlreadyRedeemed={redeemedVouchers.includes(item.id)}
                  onRedeem={handleRedeem}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ── Sub-component: Marketplace Header ────────────────────────────────────────
function MarketplaceHeader({
  points,
  isLoading = false,
}: {
  points: number;
  isLoading?: boolean;
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald to-mint px-4 pb-5 pt-6">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-6 -left-4 h-24 w-24 rounded-full bg-white/10" />

      <div className="relative">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-white/80" />
          <h1 className="text-base font-bold text-white">Chợ Đổi Thưởng</h1>
        </div>
        <p className="mt-0.5 text-[11px] text-white/70">Dùng Điểm Xanh để đổi ưu đãi hấp dẫn</p>

        {/* Points balance — real value from wallet-store */}
        <div className="mt-3 flex items-baseline gap-1.5">
          {isLoading ? (
            <div className="h-9 w-24 rounded-lg shimmer opacity-50" />
          ) : (
            <>
              <span className="text-3xl font-extrabold tabular-nums text-white">
                {points.toLocaleString('vi-VN')}
              </span>
              <span className="text-sm font-medium text-white/80">điểm hiện có</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
