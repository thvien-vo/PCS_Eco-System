import { Wallet } from 'lucide-react';

export default function WalletPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald/10">
        <Wallet className="h-8 w-8 text-emerald" />
      </div>
      <h1 className="text-lg font-bold text-foreground">Ví Điểm Xanh</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Module 4 — Ví xanh & Báo cáo Carbon sẽ được xây dựng trong phiên tiếp theo.
      </p>
    </div>
  );
}
