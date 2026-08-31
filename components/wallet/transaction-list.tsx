import { useState } from 'react';
import { Transaction } from '@/types';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TranslationDictionary } from '@/lib/i18n/dictionaries';

type TransactionLabels = TranslationDictionary['wallet']['transactions'];

function getTranslatedDescription(
  desc: string,
  type: 'earn' | 'redeem',
  labels: TransactionLabels,
  voucherTitles: Record<string, string>
): string {
  // Example: "Tái chế 5 chai PET tại Trạm Quận 1"
  const recycleMatch = desc.match(/Tái chế (\d+) chai PET tại (.*)/i);
  if (recycleMatch) {
    const n = recycleMatch[1];
    const station = recycleMatch[2];
    const translatedStation = labels.stations[station] || station;
    
    if (labels.recycleDesc.includes('{n}')) {
      return labels.recycleDesc.replace('{n}', n).replace('{station}', translatedStation);
    }
    return desc;
  }
  
  // Example: "Đổi voucher Giảm 20% Thức Uống"
  const voucherMatch = desc.match(/Đổi voucher (.*)/i);
  if (voucherMatch) {
    const name = voucherMatch[1];
    const translatedName = voucherTitles[name] || name;
    if (labels.redeemVoucherDesc.includes('{name}')) {
      return labels.redeemVoucherDesc.replace('{name}', translatedName);
    }
    return desc;
  }

  // Example: "Đổi thưởng: Túi Tote Sinh Thái (Cửa hàng Xanh)"
  // The string in the store is `Đổi thưởng: ${item.title} (${item.partnerName})`
  const rewardMatch = desc.match(/Đổi thưởng: (.*?) \((.*)\)/i);
  if (rewardMatch) {
    const name = rewardMatch[1];
    const translatedName = voucherTitles[name] || name; // Titles match
    // NOTE: partnerName translation is omitted to keep it simple, or we could pass sponsors.
    // For now we will just use the translatedName and drop the partner name if it's too complex,
    // or just reconstruct it.
    
    if (labels.redeemRewardDesc.includes('{name}')) {
      return labels.redeemRewardDesc.replace('{name}', translatedName);
    }
    return desc;
  }

  return desc;
}

export function TransactionList({ 
  transactions,
  labels,
  voucherTitles,
}: { 
  transactions: Transaction[];
  labels: TransactionLabels;
  voucherTitles: Record<string, string>;
}) {
  const [visibleCount, setVisibleCount] = useState(10);

  // We assume transactions are already sorted newest first by the store logic
  const visibleTxs = transactions.slice(0, visibleCount);
  const hasMore = visibleCount < transactions.length;

  return (
    <div className="flex flex-col gap-4">
      {visibleTxs.map((tx) => {
        const isEarn = tx.type === 'earn';
        const displayDescription = getTranslatedDescription(tx.description, tx.type, labels, voucherTitles);
        
        return (
          <div key={tx.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isEarn ? 'bg-emerald/10 text-emerald' : 'bg-warning/10 text-warning'}`}>
                {isEarn ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground line-clamp-1">{displayDescription}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(tx.date).toLocaleDateString(labels.dateLocale, { hour: '2-digit', minute: '2-digit' })}
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
          {labels.loadMore}
        </Button>
      )}
    </div>
  );
}
