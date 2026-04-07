'use client'
import { useState } from 'react'
import { domainTransfers } from '@/lib/domainData'

const sc: Record<string,string> = { pending:'bg-yellow-500/20 text-yellow-400', in_progress:'bg-blue-500/20 text-blue-400', completed:'bg-emerald-500/20 text-emerald-400', failed:'bg-red-500/20 text-red-400' }

export default function ClientTransfersPage() {
  const [show, setShow] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Domain Transfers</h1><p className="text-sm text-gray-400 mt-1">Transfer domains to AeroSys</p></div>
        <button onClick={()=>setShow(!show)} className="px-4 py-2 bg-aero-blue hover:bg-aero-blue/80 text-white rounded-lg text-sm font-medium transition-colors">+ Transfer Domain</button>
      </div>

      <div className="glass-card p-8 border-dashed border-aero-blue/30">
        <div className="text-center max-w-lg mx-auto">
          <span className="text-4xl">🔄</span>
          <h3 className="text-lg font-semibold text-white mt-3 mb-2">Transfer Your Domain to AeroSys</h3>
          <p className="text-sm text-gray-400 mb-4">Better pricing, free WHOIS privacy, unified DNS. Transfers include +1 year extension.</p>
          <div className="flex gap-4 justify-center text-sm">
            <div className="flex items-center gap-2 text-emerald-400"><span>✓</span> Free Privacy</div>
            <div className="flex items-center gap-2 text-emerald-400"><span>✓</span> +1 Year</div>
            <div className="flex items-center gap-2 text-emerald-400"><span>✓</span> No Downtime</div>
          </div>
        </div>
      </div>

      {show && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Initiate Transfer</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm text-gray-400 mb-1">Domain Name</label><input placeholder="example.com" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Auth Code (EPP)</label><input placeholder="From current registrar" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono" /></div>
          </div>
          <div className="flex gap-3 mt-4"><button className="px-4 py-2 bg-aero-blue text-white rounded-lg text-sm font-medium">Start Transfer</button><button onClick={()=>setShow(false)} className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm">Cancel</button></div>
        </div>
      )}

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Transfer History</h3>
        <div className="space-y-3">
          {domainTransfers.map(t=>(
            <div key={t.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center gap-3"><span className="text-lg">🔄</span><div><p className="text-sm font-medium text-white">{t.domainName}</p><p className="text-xs text-gray-400">{t.fromRegistrar} → AeroSys</p></div></div>
              <div className="flex items-center gap-3"><span className="text-xs text-gray-400">{t.initiatedAt}</span><span className={`text-xs px-2 py-0.5 rounded-full ${sc[t.status]}`}>{t.status.replace('_',' ')}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
