import { motion } from 'framer-motion';
import { MOTION_TOKENS } from '@/lib/motion-tokens';
import { WalletStats } from '@/lib/wallet-calculations';

export function ActivityRings({ stats }: { stats: WalletStats }) {
  const size = 200;
  const strokeWidth = 16;
  const center = size / 2;
  
  // Outer ring (CO2)
  const radiusOuter = center - strokeWidth;
  const circumferenceOuter = 2 * Math.PI * radiusOuter;
  const maxCo2 = 5; // e.g., 5kg is a full ring for demo
  const progressOuter = Math.min(stats.co2ReducedKg / maxCo2, 1);
  const strokeDashoffsetOuter = circumferenceOuter - progressOuter * circumferenceOuter;

  // Inner ring (Trees)
  const radiusInner = radiusOuter - strokeWidth - 4;
  const circumferenceInner = 2 * Math.PI * radiusInner;
  const maxTrees = 1; // e.g., 1 tree is a full ring for demo
  const progressInner = Math.min(stats.treesEquivalent / maxTrees, 1);
  const strokeDashoffsetInner = circumferenceInner - progressInner * circumferenceInner;

  return (
    <div className="flex flex-col items-center py-6">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Rings */}
        <svg className="absolute left-0 top-0 h-full w-full -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radiusOuter}
            stroke="var(--border)"
            strokeWidth={strokeWidth}
            fill="none"
            className="opacity-50"
          />
          <circle
            cx={center}
            cy={center}
            r={radiusInner}
            stroke="var(--border)"
            strokeWidth={strokeWidth}
            fill="none"
            className="opacity-50"
          />
        </svg>

        {/* Animated Progress Rings */}
        <svg className="absolute left-0 top-0 h-full w-full -rotate-90 drop-shadow-md">
          {/* Outer Ring - CO2 (Cyan/Emerald) */}
          <motion.circle
            cx={center}
            cy={center}
            r={radiusOuter}
            stroke="url(#gradient-outer)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumferenceOuter}
            initial={{ strokeDashoffset: circumferenceOuter }}
            animate={{ strokeDashoffset: strokeDashoffsetOuter }}
            transition={{ duration: 1.5, ease: MOTION_TOKENS.easing.standard }}
          />
          {/* Inner Ring - Trees (Neon Mint) */}
          <motion.circle
            cx={center}
            cy={center}
            r={radiusInner}
            stroke="var(--neon-mint)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumferenceInner}
            initial={{ strokeDashoffset: circumferenceInner }}
            animate={{ strokeDashoffset: strokeDashoffsetInner }}
            transition={{ duration: 1.5, ease: MOTION_TOKENS.easing.standard, delay: 0.2 }}
          />
          <defs>
            <linearGradient id="gradient-outer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--primary-emerald)" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center"
          >
            <span className="block text-2xl font-bold text-foreground">
              {stats.co2ReducedKg}
            </span>
            <span className="block text-xs font-medium text-muted-foreground">
              kg CO₂
            </span>
          </motion.div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex w-full justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald" />
          <span className="text-xs font-medium text-muted-foreground">CO₂ Giảm ({maxCo2}kg)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-mint" />
          <span className="text-xs font-medium text-muted-foreground">Cây ({maxTrees})</span>
        </div>
      </div>
    </div>
  );
}
