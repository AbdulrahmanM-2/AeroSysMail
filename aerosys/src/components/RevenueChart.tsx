'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RevenueChartProps {
  data: { month: string; revenue: number }[]
  currentRevenue: number
}

export default function RevenueChart({ data, currentRevenue }: RevenueChartProps) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Revenue Tracker</h3>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-gray-400">✓ Monthly Earnings</span>
        <span className="text-2xl font-bold text-emerald-400">${currentRevenue.toLocaleString()}</span>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickFormatter={v => `${v/1000}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            />
            <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
