import { useFeedStore } from '@/store/feed-store';
import { EmptyState } from '@/components/shared/empty-state';
import { Ticket } from 'lucide-react';
import { useDragScroll } from '@/hooks/use-drag-scroll';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { TranslationDictionary } from '@/lib/i18n/dictionaries';

type VoucherLabels = TranslationDictionary['wallet']['vouchers'];

export function VoucherInventory({ labels }: { labels: VoucherLabels }) {
  const { savedVoucherDetails } = useFeedStore();
  const { ref, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onClickCapture } = useDragScroll();
  const router = useRouter();

  if (savedVoucherDetails.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-2">
        <EmptyState
          icon={Ticket}
          title={labels.emptyTitle}
          description={labels.emptyDescription}
          actionLabel={labels.emptyAction}
          onAction={() => router.push('/feed')}
        />
      </div>
    );
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onClickCapture={onClickCapture}
      className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide cursor-grab active:cursor-grabbing"
    >
      {savedVoucherDetails.map((voucher) => {
        const displayTitle = labels.titles[voucher.title] || voucher.title;
        const displaySponsor = labels.sponsors[voucher.sponsorName] || voucher.sponsorName;

        return (
          <div 
            key={voucher.id} 
            className="flex w-64 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="relative h-24 w-full bg-muted">
              <Image
                src={voucher.imageUrl}
                alt={displayTitle}
                fill
                className="object-cover"
                sizes="256px"
              />
            </div>
            <div className="flex flex-col p-4">
              <span className="text-xs font-medium text-muted-foreground">{displaySponsor}</span>
              <h4 className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">{displayTitle}</h4>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-md bg-emerald/10 px-2 py-1 text-xs font-bold tracking-widest text-emerald">
                  {voucher.code}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {labels.savedAt} {new Date(voucher.savedAt).toLocaleDateString(labels.dateLocale)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
