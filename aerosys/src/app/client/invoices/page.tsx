'use client'
import { useState, useEffect } from 'react'
import type { Invoice } from '@/lib/types'

export default function ClientInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState({ total: 0, totalAmount: 0, pending: 0 })

  useEffect(() => {
    fetch('/api/invoices').then(r => r.json()).then(d => {
      setInvoices(d.invoices || [])
      if (d.stats) setStats(d.stats)
    })
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-xl font-bold">My Invoices</h1><p className="text-sm text-gray-500">View and manage your billing</p></div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400">Total Billed</p>
          <p className="text-2xl font-bold">${stats.totalAmount.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400">Outstanding</p>
          <p className="text-2xl font-bold text-amber-400">${stats.pending.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400">Invoices</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
      </div>

      <div className="space-y-3">
        {invoices.map(inv => (
          <div key={inv.id} className="glass-card-hover p-4 flex items-center gap-4 cursor-pointer">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              inv.status === 'paid' ? 'bg-emerald-500/20' : inv.status === 'overdue' ? 'bg-red-500/20' : 'bg-amber-500/20'
            }`}>
              <span className="text-lg">{inv.status === 'paid' ? '✅' : inv.status === 'overdue' ? '⚠️' : '🕐'}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium font-mono">{inv.id}</p>
              <p className="text-xs text-gray-500">Due: {inv.dueDate}</p>
            </div>
            <p className="text-lg font-bold">${inv.amount.toLocaleString()}</p>
            <span className={`text-xs px-2 py-1 rounded-full ${
              inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
              inv.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>{inv.status}</span>
            {inv.status === 'pending' && <button className="btn-primary text-sm py-1.5">Pay Now</button>}
          </div>
        ))}
      </div>
    </div>
  )
}
