'use client'
import { useState } from 'react'
import { domains } from '@/lib/domainData'
import { invoices } from '@/lib/data'

export default function ClientBillingPage() {
  const [tab, setTab] = useState<'overview'|'invoices'|'payment'>('overview')
  const myDoms = domains.filter(d => d.registrantEmail==='sarah@techcorp.com'||d.registrant==='Tech Corp')
  const myInv = invoices.filter(i => i.client==='Tech Corp')
  const totalCost = myDoms.reduce((s,d)=>s+d.renewalPrice,0)
  const totalPaid = myInv.filter(i=>i.status==='paid').reduce((s,i)=>s+i.amount,0)

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Billing & Payments</h1><p className="text-sm text-gray-400 mt-1">Manage billing, invoices, and payments</p></div>

      <div className="grid grid-cols-4 gap-4">
        {[{l:'Annual Cost',v:`$${totalCost.toFixed(2)}`,i:'🌐',c:'text-white'},{l:'Total Paid',v:`$${totalPaid.toLocaleString()}`,i:'✅',c:'text-emerald-400'},{l:'Pending',v:`$${myInv.filter(i=>i.status==='pending').reduce((s,i)=>s+i.amount,0).toLocaleString()}`,i:'⏳',c:'text-yellow-400'},{l:'Domains',v:myDoms.length,i:'📦',c:'text-aero-blue'}].map(s=>(
          <div key={s.l} className="glass-card p-4"><div className="flex items-center gap-3"><span className="text-2xl">{s.i}</span><div><p className={`text-2xl font-bold ${s.c}`}>{s.v}</p><p className="text-xs text-gray-400">{s.l}</p></div></div></div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-0">
        {(['overview','invoices','payment'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${tab===t?'text-aero-blue border-aero-blue':'text-gray-400 border-transparent hover:text-white'}`}>
            {t==='payment'?'💳 Payment Methods':t==='invoices'?'📄 Invoices':'📊 Overview'}
          </button>
        ))}
      </div>

      {tab==='overview' && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Domain Renewals</h3>
          <table className="w-full"><thead><tr className="border-b border-white/10 text-left"><th className="pb-3 text-xs text-gray-400">Domain</th><th className="pb-3 text-xs text-gray-400">Expires</th><th className="pb-3 text-xs text-gray-400">Auto-Renew</th><th className="pb-3 text-xs text-gray-400">Price</th><th className="pb-3 text-xs text-gray-400">Actions</th></tr></thead>
          <tbody className="divide-y divide-white/5">{myDoms.map(d=>(
            <tr key={d.id} className="hover:bg-white/5"><td className="py-3 text-sm text-white font-medium">{d.name}</td><td className="py-3 text-sm text-gray-300">{d.expiresAt}</td><td className="py-3"><span className={d.autoRenew?'text-emerald-400 text-sm':'text-gray-500 text-sm'}>{d.autoRenew?'✓ On':'✗ Off'}</span></td><td className="py-3 text-sm text-white">${d.renewalPrice}/yr</td><td className="py-3"><button className="px-3 py-1 bg-aero-blue/20 text-aero-blue rounded text-xs">Renew</button></td></tr>
          ))}</tbody></table>
        </div>
      )}

      {tab==='invoices' && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Invoices</h3>
          <div className="space-y-3">{myInv.map(inv=>(
            <div key={inv.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center gap-3"><span className="text-lg">📄</span><div><p className="text-sm font-medium text-white">{inv.id}</p><p className="text-xs text-gray-400">Due: {inv.dueDate}</p></div></div>
              <div className="flex items-center gap-4"><span className="text-sm font-bold text-white">${inv.amount.toLocaleString()}</span><span className={`text-xs px-2 py-0.5 rounded-full ${inv.status==='paid'?'bg-emerald-500/20 text-emerald-400':inv.status==='pending'?'bg-yellow-500/20 text-yellow-400':'bg-red-500/20 text-red-400'}`}>{inv.status}</span>{inv.status!=='paid'&&<button className="px-3 py-1 bg-emerald-500 text-white rounded text-xs">Pay Now</button>}</div>
            </div>
          ))}</div>
        </div>
      )}

      {tab==='payment' && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"><div className="flex items-center gap-3"><span className="text-2xl">💳</span><div><p className="text-sm font-medium text-white">Visa ending in 4242</p><p className="text-xs text-gray-400">Expires 12/2028 • Default</p></div></div><span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Default</span></div>
            <button className="w-full py-3 bg-white/5 border border-dashed border-white/20 rounded-lg text-sm text-gray-400 hover:bg-white/10 transition-colors">+ Add Payment Method</button>
          </div>
        </div>
      )}
    </div>
  )
}
