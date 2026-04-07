'use client'
import { useState, useEffect } from 'react'
import type { Domain } from '@/lib/types'

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  expired: 'bg-red-500/20 text-red-400 border-red-500/30',
  transferring: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  suspended: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export default function AdminDomainsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showRegister, setShowRegister] = useState(false)
  const [domains, setDomains] = useState<Domain[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, expired: 0 })

  useEffect(() => {
    fetch(`/api/domains?status=${statusFilter}&search=${search}`)
      .then(r => r.json())
      .then(d => {
        setDomains(d.domains || [])
        if (d.stats) setStats(d.stats)
      })
  }, [statusFilter, search])

  const filtered = domains

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Domain Management</h1>
          <p className="text-sm text-gray-400 mt-1">Manage all registered domains</p>
        </div>
        <button onClick={() => setShowRegister(!showRegister)} className="px-4 py-2 bg-aero-blue hover:bg-aero-blue/80 text-white rounded-lg text-sm font-medium transition-colors">+ Register Domain</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[{l:'Total Domains',v:stats.total,i:'🌐',c:'text-white'},{l:'Active',v:stats.active,i:'✅',c:'text-emerald-400'},{l:'Pending',v:stats.pending,i:'⏳',c:'text-yellow-400'},{l:'Expired',v:stats.expired,i:'⚠️',c:'text-red-400'}].map(s=>(
          <div key={s.l} className="glass-card p-4"><div className="flex items-center gap-3"><span className="text-2xl">{s.i}</span><div><p className={`text-2xl font-bold ${s.c}`}>{s.v}</p><p className="text-xs text-gray-400">{s.l}</p></div></div></div>
        ))}
      </div>

      {showRegister && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Register New Domain</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm text-gray-400 mb-1">Domain Name</label><input placeholder="example.com" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-aero-blue focus:outline-none" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Registrant</label><input placeholder="Company Name" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-aero-blue focus:outline-none" /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="px-4 py-2 bg-aero-blue hover:bg-aero-blue/80 text-white rounded-lg text-sm font-medium transition-colors">Register</button>
            <button onClick={() => setShowRegister(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search domains..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-aero-blue focus:outline-none" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-aero-blue focus:outline-none">
            <option value="all">All Status</option><option value="active">Active</option><option value="pending">Pending</option><option value="expired">Expired</option><option value="transferring">Transferring</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full"><thead><tr className="border-b border-white/10 text-left">
            <th className="pb-3 text-xs text-gray-400 font-medium">Domain</th><th className="pb-3 text-xs text-gray-400 font-medium">Registrant</th><th className="pb-3 text-xs text-gray-400 font-medium">Status</th><th className="pb-3 text-xs text-gray-400 font-medium">Expires</th><th className="pb-3 text-xs text-gray-400 font-medium">Auto-Renew</th><th className="pb-3 text-xs text-gray-400 font-medium">Privacy</th><th className="pb-3 text-xs text-gray-400 font-medium">Price/yr</th><th className="pb-3 text-xs text-gray-400 font-medium">Actions</th>
          </tr></thead><tbody className="divide-y divide-white/5">
            {filtered.map(d => (
              <tr key={d.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3"><div className="flex items-center gap-2"><span className="text-lg">🌐</span><div><p className="text-sm font-medium text-white">{d.name}</p><p className="text-xs text-gray-500">{d.tld}</p></div></div></td>
                <td className="py-3 text-sm text-gray-300">{d.registrant}</td>
                <td className="py-3"><span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[d.status]}`}>{d.status}</span></td>
                <td className="py-3 text-sm text-gray-300">{new Date(d.expiresAt).toLocaleDateString()}</td>
                <td className="py-3"><span className={d.autoRenew?'text-emerald-400 text-sm':'text-gray-500 text-sm'}>{d.autoRenew?'✓ On':'✗ Off'}</span></td>
                <td className="py-3"><span className={d.whoisPrivacy?'text-emerald-400 text-sm':'text-gray-500 text-sm'}>{d.whoisPrivacy?'🛡️':'—'}</span></td>
                <td className="py-3 text-sm text-white font-medium">${d.renewalPrice}</td>
                <td className="py-3"><div className="flex gap-1"><button className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-gray-300">DNS</button><button className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-gray-300">WHOIS</button></div></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      </div>
    </div>
  )
}
