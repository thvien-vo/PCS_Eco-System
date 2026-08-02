import { Gift } from 'lucide-react';

export default function MarketplacePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-mint/10">
        <Gift className="h-8 w-8 text-mint" />
      </div>
      <h1 className="text-lg font-bold text-foreground">Chợ Đổi Thưởng</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Module 6 — Marketplace đổi quà sẽ được xây dựng trong phiên tiếp theo.
      </p>
    </div>
  );
}
