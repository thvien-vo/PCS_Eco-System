'use client';

import { useEffect, useMemo } from 'react';
import { useWalletStore } from '@/store/wallet-store';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { computeWalletStats } from '@/lib/wallet-calculations';
import { MOCK_TRANSACTIONS } from '@/lib/mock-data';
import { useTranslation } from '@/hooks/use-translation';

import { WalletSkeleton } from '@/components/wallet/wallet-skeleton';
import { PointsHeroCard } from '@/components/wallet/points-hero-card';
import { ActivityRings } from '@/components/wallet/activity-rings';
import { WeeklyChart } from '@/components/wallet/weekly-chart';
import { VoucherInventory } from '@/components/wallet/voucher-inventory';
import { TransactionList } from '@/components/wallet/transaction-list';

export default function WalletPage() {
  const hasMounted = useHasMounted();
  const { transactions, points, seedDemoTransactions } = useWalletStore();
  const { t } = useTranslation();
  const tm = t.wallet;

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
        <PointsHeroCard stats={stats} labels={tm.heroCard} tierLabels={tm.tiers} />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{tm.page.carbonReportTitle}</h2>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <ActivityRings stats={stats} labels={tm.rings} />
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">{tm.page.weeklyTrendTitle}</h2>
          <p className="text-xs text-muted-foreground">{tm.page.weeklyTrendSubtitle}</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm pt-6">
          <WeeklyChart data={stats.weeklyTrend} labels={tm.chart} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{tm.page.savedVouchersTitle}</h2>
        </div>
        <VoucherInventory labels={tm.vouchers} />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">{tm.page.transactionHistoryTitle}</h2>
        </div>
        <TransactionList transactions={transactions} labels={tm.transactions} voucherTitles={tm.vouchers.titles} />
      </section>
    </div>
  );
}
