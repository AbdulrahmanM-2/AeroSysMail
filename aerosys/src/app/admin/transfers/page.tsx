'use client'
import { useState, useEffect } from 'react'
import type { DomainTransfer } from '@/lib/types'

const tsc: Record<string, string> = { pending:'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', in_progress:'bg-blue-500/20 text-blue-400 border-blue-500/30', completed:'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', failed:'bg-red-500/20 text-red-400 border-red-500/30' }
const tsi: Record<string, string> = { pending:'⏳', in_progress:'🔄', completed:'✅', failed:'❌' }

export default function AdminTransfersPage() {
  const [showInit, setShowInit] = useState(false)
  const [filter, setFilter] = useState('all')
  const [domainTransfers, setDomainTransfers] = useState<DomainTransfer[]>([])

  useEffect(() => {
    fetch('/api/domains/transfer').then(r => r.json()).then(d => setDomainTransfers(d.transfers || []))
  }, [])

  const filtered = filter === 'all' ? domainTransfers : domainTransfers.filter(t => t.status === filter)
  const stats = { pending: domainTransfers.filter(t=>t.status==='pending').length, inProgress: domainTransfers.filter(t=>t.status==='in_progress').length, completed: domainTransfers.filter(t=>t.status==='completed').length, failed: domainTransfers.filter(t=>t.status==='failed').length }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Domain Transfers</h1><p className="text-sm text-gray-400 mt-1">Track incoming and outgoing transfers</p></div>
        <button onClick={()=>setShowInit(!showInit)} className="px-4 py-2 bg-aero-blue hover:bg-aero-blue/80 text-white rounded-lg text-sm font-medium transition-colors">+ Initiate Transfer</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[{l:'Pending',v:stats.pending,i:'⏳',c:'text-yellow-400'},{l:'In Progress',v:stats.inProgress,i:'🔄',c:'text-blue-400'},{l:'Completed',v:stats.completed,i:'✅',c:'text-emerald-400'},{l:'Failed',v:stats.failed,i:'❌',c:'text-red-400'}].map(s=>(
          <div key={s.l} className="glass-card p-4"><div className="flex items-center gap-3"><span className="text-2xl">{s.i}</span><div><p className={`text-2xl font-bold ${s.c}`}>{s.v}</p><p className="text-xs text-gray-400">{s.l}</p></div></div></div>
        ))}
      </div>

      {showInit && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Initiate Domain Transfer</h3>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm text-gray-400 mb-1">Domain Name</label><input placeholder="example.com" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-aero-blue focus:outline-none" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Auth/EPP Code</label><input placeholder="Authorization code" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-aero-blue focus:outline-none font-mono" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">From Registrar</label><input placeholder="GoDaddy, Namecheap..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-aero-blue focus:outline-none" /></div>
          </div>
          <div className="flex gap-3 mt-4"><button className="px-4 py-2 bg-aero-blue hover:bg-aero-blue/80 text-white rounded-lg text-sm font-medium transition-colors">Start Transfer</button><button onClick={()=>setShowInit(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors">Cancel</button></div>
        </div>
      )}

      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold text-white flex-1">Transfer History</h3>
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-aero-blue focus:outline-none">
            <option value="all">All</option><option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="failed">Failed</option>
          </select>
        </div>
        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4"><span className="text-2xl">{tsi[t.status]}</span><div><p className="text-sm font-medium text-white">{t.domainName}</p><p className="text-xs text-gray-400">{t.fromRegistrar} → {t.toRegistrar}</p></div></div>
                <div className="flex items-center gap-4">
                  <div className="text-right"><p className="text-xs text-gray-400">Client</p><p className="text-sm text-gray-300">{t.clientName}</p></div>
                  <div className="text-right"><p className="text-xs text-gray-400">Initiated</p><p className="text-sm text-gray-300">{new Date(t.initiatedAt).toLocaleDateString()}</p></div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${tsc[t.status]}`}>{t.status.replace('_',' ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
