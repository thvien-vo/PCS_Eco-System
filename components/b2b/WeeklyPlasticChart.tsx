'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { MOCK_WEEKLY_PLASTIC } from '@/lib/mock-data';

const MAX_KG = Math.max(...MOCK_WEEKLY_PLASTIC.map((d) => d.kgSorted));

interface WeeklyPlasticChartProps {
  labels: {
    tooltipSeries: string;
    tooltipWeekPrefix: string;
  };
}

export default function WeeklyPlasticChart({ labels }: WeeklyPlasticChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={MOCK_WEEKLY_PLASTIC}
        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        barCategoryGap="28%"
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="week"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v} kg`}
          width={56}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          contentStyle={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            fontSize: '12px',
            color: 'var(--foreground)',
          }}
          formatter={(value) => [
            typeof value === 'number' ? `${value.toLocaleString('vi-VN')} kg` : String(value ?? ''),
            labels.tooltipSeries,
          ]}
          labelFormatter={(label) => `${labels.tooltipWeekPrefix} ${String(label)}`}
        />
        <Bar dataKey="kgSorted" radius={[6, 6, 0, 0]}>
          {MOCK_WEEKLY_PLASTIC.map((entry) => {
            const intensity = entry.kgSorted / MAX_KG;
            const opacity = 0.45 + intensity * 0.55;
            return (
              <Cell
                key={entry.week}
                fill={`rgba(30, 58, 95, ${opacity})`}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
