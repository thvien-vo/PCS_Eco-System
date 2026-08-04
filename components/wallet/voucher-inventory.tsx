import { useFeedStore } from '@/store/feed-store';
import { EmptyState } from '@/components/shared/empty-state';
import { Ticket } from 'lucide-react';
import { useDragScroll } from '@/hooks/use-drag-scroll';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function VoucherInventory() {
  const { savedVoucherDetails } = useFeedStore();
  const { ref, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onClickCapture } = useDragScroll();
  const router = useRouter();

  if (savedVoucherDetails.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-2">
        <EmptyState
          icon={Ticket}
          title="Chưa có voucher"
          description="Bạn chưa lưu voucher nào từ cộng đồng."
          actionLabel="Khám phá ngay"
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
      {savedVoucherDetails.map((voucher) => (
        <div 
          key={voucher.id} 
          className="flex w-64 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          <div className="relative h-24 w-full bg-muted">
            <Image
              src={voucher.imageUrl}
              alt={voucher.title}
              fill
              className="object-cover"
              sizes="256px"
            />
          </div>
          <div className="flex flex-col p-4">
            <span className="text-xs font-medium text-muted-foreground">{voucher.sponsorName}</span>
            <h4 className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">{voucher.title}</h4>
            <div className="mt-3 flex items-center justify-between">
              <span className="rounded-md bg-emerald/10 px-2 py-1 text-xs font-bold tracking-widest text-emerald">
                {voucher.code}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Lưu: {new Date(voucher.savedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
