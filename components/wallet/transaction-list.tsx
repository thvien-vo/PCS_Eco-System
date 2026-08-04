import { useState } from 'react';
import { Transaction } from '@/types';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const [visibleCount, setVisibleCount] = useState(10);

  // We assume transactions are already sorted newest first by the store logic
  const visibleTxs = transactions.slice(0, visibleCount);
  const hasMore = visibleCount < transactions.length;

  return (
    <div className="flex flex-col gap-4">
      {visibleTxs.map((tx) => {
        const isEarn = tx.type === 'earn';
        return (
          <div key={tx.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isEarn ? 'bg-emerald/10 text-emerald' : 'bg-warning/10 text-warning'}`}>
                {isEarn ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground line-clamp-1">{tx.description}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(tx.date).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end">
              <span className={`text-sm font-bold ${isEarn ? 'text-emerald' : 'text-warning'}`}>
                {isEarn ? '+' : '-'}{tx.amount}
              </span>
            </div>
          </div>
        );
      })}

      {hasMore && (
        <Button 
          variant="outline" 
          className="mt-2 w-full rounded-full border-border bg-transparent text-foreground hover:bg-muted"
          onClick={() => setVisibleCount((prev) => prev + 10)}
        >
          Xem thêm
        </Button>
      )}
    </div>
  );
}
