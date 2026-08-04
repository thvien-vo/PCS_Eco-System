import { MEMBER_TIER_INFO } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { MOTION_TOKENS } from '@/lib/motion-tokens';
import { Info, Leaf } from 'lucide-react';
import { WalletStats } from '@/lib/wallet-calculations';

export function PointsHeroCard({ stats }: { stats: WalletStats }) {
  const { current } = MEMBER_TIER_INFO;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION_TOKENS.durations.base, ease: MOTION_TOKENS.easing.enter }}
      className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-emerald via-mint to-cyan-400 p-6 text-white shadow-lg"
    >
      {/* Decorative background elements */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-black/10 blur-2xl" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-50">Tổng Điểm Xanh</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight">{stats.totalPoints.toLocaleString()}</span>
            <span className="text-sm font-medium text-emerald-50">pt</span>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 backdrop-blur-md">
          <Leaf className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold">{current}</span>
        </div>
      </div>

      <div className="relative z-10 mt-8 flex items-center justify-between rounded-xl bg-black/10 px-4 py-3 backdrop-blur-sm">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-emerald-50">Đã giảm lượng CO₂</span>
          <span className="text-lg font-bold">{stats.co2ReducedKg} kg</span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <Info className="h-4 w-4 text-emerald-50" />
        </div>
      </div>
    </motion.div>
  );
}
