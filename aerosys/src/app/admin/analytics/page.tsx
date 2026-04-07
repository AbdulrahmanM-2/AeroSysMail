'use client'
import { useState, useEffect } from 'react'
import RevenueChart from '@/components/RevenueChart'

interface Analytics {
  revenue: { monthly: { month: string; revenue: number }[]; current: number; growth: number; total: number }
  deals: { total: number; active: number; closingRate: number; pipeline: number }
  invoices: { total: number; pending: number; pendingAmount: number; overdueAmount: number }
  clients: { total: number; active: number }
  emailStats: { sent: number; received: number; unread: number }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(setData)
  }, [])

  if (!data) return <div className="p-6 flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-aero-blue border-t-transparent rounded-full" /></div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Analytics</h1>
        <p className="text-sm text-gray-500">Business intelligence & insights</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400">Revenue</p>
          <p className="text-xl font-bold">${data.revenue.current.toLocaleString()}</p>
          <p className="text-xs text-emerald-400">+{data.revenue.growth}%</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400">Pipeline</p>
          <p className="text-xl font-bold">${data.deals.pipeline.toLocaleString()}</p>
          <p className="text-xs text-gray-500">{data.deals.active} active</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400">Close Rate</p>
          <p className="text-xl font-bold">{data.deals.closingRate}%</p>
          <p className="text-xs text-gray-500">{data.deals.total} total deals</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400">Active Clients</p>
          <p className="text-xl font-bold">{data.clients.active}</p>
          <p className="text-xs text-gray-500">of {data.clients.total}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400">Emails Sent</p>
          <p className="text-xl font-bold">{data.emailStats.sent}</p>
          <p className="text-xs text-gray-500">{data.emailStats.unread} unread</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <RevenueChart data={data.revenue.monthly} currentRevenue={data.revenue.total} />
        <div className="glass-card p-5">
          <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Customer Acquisition', value: 85, color: 'bg-aero-blue' },
              { label: 'Retention Rate', value: 92, color: 'bg-emerald-500' },
              { label: 'Upsell Rate', value: 38, color: 'bg-amber-500' },
              { label: 'Support Score', value: 96, color: 'bg-purple-500' },
              { label: 'Response Time', value: 78, color: 'bg-cyan-500' },
            ].map(metric => (
              <div key={metric.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">{metric.label}</span>
                  <span className="text-sm font-medium">{metric.value}%</span>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className={`h-full ${metric.color} rounded-full transition-all duration-1000`} style={{ width: `${metric.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
