'use client';

import dynamic from 'next/dynamic';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DailyTrend } from '@/lib/wallet-calculations';

// Recharts component MUST be 'use client' and dynamically imported with ssr: false
// per pcs-tech-standards §10 to prevent 0-width flash from ResponsiveContainer.

interface WeeklyChartInnerProps {
  data: DailyTrend[];
}

interface CustomTooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
        <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald" />
            <span className="text-xs font-medium text-emerald">{payload[0].value} pt</span>
          </div>
          {payload[1] && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="text-xs font-medium text-cyan-500">{payload[1].value} kg CO₂</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export function WeeklyChartInner({ data }: WeeklyChartInnerProps) {
  // Format labels to simple day/month for the X-axis
  const formattedData = data.map((item) => {
    const d = new Date(item.day);
    return {
      ...item,
      displayDate: `${d.getDate()}/${d.getMonth() + 1}`,
    };
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            yAxisId="left"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            axisLine={false} 
            tickLine={false} 
            tick={false} // Hide secondary axis labels to keep it clean
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="points"
            stroke="var(--primary-emerald)"
            strokeWidth={3}
            dot={{ r: 4, fill: 'var(--primary-emerald)', strokeWidth: 2, stroke: 'var(--card)' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="co2Kg"
            stroke="#22d3ee" // cyan-400
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            activeDot={{ r: 4, fill: '#22d3ee', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Export the dynamically imported wrapper
export const WeeklyChart = dynamic(() => Promise.resolve(WeeklyChartInner), { 
  ssr: false,
  loading: () => <div className="shimmer h-64 w-full rounded-2xl" />
});
