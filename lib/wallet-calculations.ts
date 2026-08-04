import { Transaction } from '@/types';

export interface DailyTrend {
  day: string; // ISO date string (YYYY-MM-DD)
  points: number; // Points earned that day
  co2Kg: number; // CO2 reduced that day
}

export interface WalletStats {
  totalPoints: number;
  totalEarned: number;
  totalRedeemed: number;
  co2ReducedKg: number;
  treesEquivalent: number;
  scanCount: number;
  weeklyTrend: DailyTrend[];
}

export function computeWalletStats(transactions: Transaction[], currentPoints: number): WalletStats {
  let totalEarned = 0;
  let totalRedeemed = 0;
  let scanCount = 0;
  
  const dailyMap = new Map<string, number>();

  // Process transactions
  transactions.forEach((tx) => {
    if (tx.type === 'earn') {
      totalEarned += tx.amount;
      // We assume each earn transaction is 1 scan session.
      // If we wanted to parse the amount of bottles from description, we could,
      // but keeping it simple for the demo: 1 transaction = 1 scan session.
      // Or we can say every 5 points = 1 bottle (based on 25pt = 5 bottles in Kiosk).
      // Let's use the points to estimate bottles.
      // Module 7 gives 5 points per PET bottle.
      const bottlesInTx = Math.floor(tx.amount / 5);
      scanCount += bottlesInTx;

      // Group by local date string
      const dateStr = new Date(tx.date).toLocaleDateString('en-CA'); // YYYY-MM-DD
      const currentDayPoints = dailyMap.get(dateStr) || 0;
      dailyMap.set(dateStr, currentDayPoints + tx.amount);
    } else if (tx.type === 'redeem') {
      totalRedeemed += tx.amount;
    }
  });

  // Single Source of Truth Formula
  // Note: These are estimated conversion factors for demo purposes.
  // 0.12 kg CO2 per PET bottle recycled
  const co2ReducedKg = scanCount * 0.12; 
  // 21.77 kg CO2 absorbed per tree per year
  const treesEquivalent = co2ReducedKg / 21.77; 

  // Generate last 7 days for the chart to ensure we have a full week even if empty
  const weeklyTrend: DailyTrend[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-CA');
    const pointsThatDay = dailyMap.get(dateStr) || 0;
    
    // Reverse engineer bottles for that day from points
    const bottlesThatDay = Math.floor(pointsThatDay / 5);
    const co2ThatDay = bottlesThatDay * 0.12;
    
    weeklyTrend.push({
      day: dateStr,
      points: pointsThatDay,
      co2Kg: Number(co2ThatDay.toFixed(2)),
    });
  }

  return {
    totalPoints: currentPoints,
    totalEarned,
    totalRedeemed,
    co2ReducedKg: Number(co2ReducedKg.toFixed(2)),
    treesEquivalent: Number(treesEquivalent.toFixed(2)),
    scanCount,
    weeklyTrend,
  };
}
