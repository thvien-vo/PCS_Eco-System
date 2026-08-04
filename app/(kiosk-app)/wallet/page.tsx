'use client';

import { useEffect, useMemo } from 'react';
import { useWalletStore } from '@/store/wallet-store';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { computeWalletStats } from '@/lib/wallet-calculations';
import { MOCK_TRANSACTIONS } from '@/lib/mock-data';

import { WalletSkeleton } from '@/components/wallet/wallet-skeleton';
import { PointsHeroCard } from '@/components/wallet/points-hero-card';
import { ActivityRings } from '@/components/wallet/activity-rings';
import { WeeklyChart } from '@/components/wallet/weekly-chart';
import { VoucherInventory } from '@/components/wallet/voucher-inventory';
import { TransactionList } from '@/components/wallet/transaction-list';

export default function WalletPage() {
  const hasMounted = useHasMounted();
  const { transactions, points, seedDemoTransactions } = useWalletStore();

  useEffect(() => {
    if (hasMounted) {
      // Seed demo transactions if not already seeded
      seedDemoTransactions(MOCK_TRANSACTIONS);
    }
  }, [hasMounted, seedDemoTransactions]);

  const stats = useMemo(() => computeWalletStats(transactions, points), [transactions, points]);

  if (!hasMounted) {
    return <WalletSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 p-4">
      <section>
        <PointsHeroCard stats={stats} />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Báo Cáo Carbon</h2>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <ActivityRings stats={stats} />
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Xu Hướng 7 Ngày</h2>
          <p className="text-xs text-muted-foreground">Điểm tích lũy & CO₂ giảm được</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm pt-6">
          <WeeklyChart data={stats.weeklyTrend} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Voucher Đã Lưu</h2>
        </div>
        <VoucherInventory />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Lịch Sử Giao Dịch</h2>
        </div>
        <TransactionList transactions={transactions} />
      </section>
    </div>
  );
}
