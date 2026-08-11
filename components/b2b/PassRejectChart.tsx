'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { MOCK_PASS_REJECT } from '@/lib/mock-data';

export default function PassRejectChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={MOCK_PASS_REJECT}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
        barCategoryGap="30%"
        barGap={4}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="plasticType"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
          width={40}
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
          formatter={(value, name) => [
            typeof value === 'number' ? value.toLocaleString('vi-VN') : String(value ?? ''),
            name === 'pass' ? '✅ Đạt' : '❌ Từ chối',
          ]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (value === 'pass' ? 'Đạt' : 'Từ chối')}
          wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)' }}
        />
        <Bar dataKey="pass" fill="#2d6a9f" radius={[0, 4, 4, 0]} name="pass" />
        <Bar dataKey="reject" fill="#8a9ab5" radius={[0, 4, 4, 0]} name="reject" />
      </BarChart>
    </ResponsiveContainer>
  );
}
