import { Trophy } from 'lucide-react';

export default function ChallengePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10">
        <Trophy className="h-8 w-8 text-warning" />
      </div>
      <h1 className="text-lg font-bold text-foreground">Thử thách & Gamification</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Module 5 — Thẻ swipe & Bảng xếp hạng sẽ được xây dựng trong phiên tiếp theo.
      </p>
    </div>
  );
}
