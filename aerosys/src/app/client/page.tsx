'use client'
import { useState, useEffect } from 'react'

export default function ClientDashboard() {
  const [user, setUser] = useState<{ name: string; company: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => { if (d.user) setUser(d.user) })
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Welcome back, {user?.name || 'Client'}</h1>
        <p className="text-sm text-gray-500">{user?.company || ''} Portal</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card-hover p-5">
          <p className="text-xs text-gray-400 mb-1">Active Services</p>
          <p className="text-3xl font-bold">3</p>
          <p className="text-xs text-emerald-400 mt-1">All operational</p>
        </div>
        <div className="glass-card-hover p-5">
          <p className="text-xs text-gray-400 mb-1">Open Invoices</p>
          <p className="text-3xl font-bold">2</p>
          <p className="text-xs text-amber-400 mt-1">$19,800 pending</p>
        </div>
        <div className="glass-card-hover p-5">
          <p className="text-xs text-gray-400 mb-1">Support Tickets</p>
          <p className="text-3xl font-bold">1</p>
          <p className="text-xs text-aero-blue mt-1">Response within 2h</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { icon: '📧', text: 'New email from AeroSys Support', time: '2h ago' },
              { icon: '📄', text: 'Invoice INV-003 received', time: '1d ago' },
              { icon: '✅', text: 'Service upgrade completed', time: '3d ago' },
              { icon: '💬', text: 'Support ticket #104 resolved', time: '5d ago' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition-all cursor-pointer">
                <span>{item.icon}</span>
                <span className="text-sm text-gray-300 flex-1">{item.text}</span>
                <span className="text-xs text-gray-500">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Your Services</h3>
          <div className="space-y-3">
            {[
              { name: 'Email Suite', status: 'Active', plan: 'Enterprise' },
              { name: 'Cloud Storage', status: 'Active', plan: '500GB' },
              { name: 'API Access', status: 'Active', plan: 'Pro Tier' },
            ].map((svc, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <div>
                  <p className="text-sm font-medium">{svc.name}</p>
                  <p className="text-xs text-gray-500">{svc.plan}</p>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">{svc.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
