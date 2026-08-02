import { Rss } from 'lucide-react';

export default function FeedPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald/10">
        <Rss className="h-8 w-8 text-emerald" />
      </div>
      <h1 className="text-lg font-bold text-foreground">Cộng đồng Xanh</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Module 3 — Mạng xã hội voucher & Green Feed sẽ được xây dựng trong phiên tiếp theo.
      </p>
    </div>
  );
}
