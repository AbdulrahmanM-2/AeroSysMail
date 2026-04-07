'use client'
import { useState, useEffect } from 'react'
import type { DomainPricing } from '@/lib/types'

const catC: Record<string, string> = { generic:'bg-blue-500/20 text-blue-400', country:'bg-green-500/20 text-green-400', new:'bg-purple-500/20 text-purple-400', aviation:'bg-orange-500/20 text-orange-400', business:'bg-cyan-500/20 text-cyan-400' }

export default function AdminPricingPage() {
  const [filterCat, setFilterCat] = useState('all')
  const [search, setSearch] = useState('')
  const [domainPricing, setDomainPricing] = useState<DomainPricing[]>([])

  useEffect(() => {
    fetch('/api/domains/pricing').then(r => r.json()).then(d => setDomainPricing(d.pricing || []))
  }, [])

  const filtered = domainPricing.filter(p => (filterCat==='all'||p.category===filterCat) && p.tld.toLowerCase().includes(search.toLowerCase()))
  const cats = Array.from(new Set(domainPricing.map(p => p.category)))
  const avg = domainPricing.length > 0 ? (domainPricing.reduce((s,p)=>s+p.registerPrice,0)/domainPricing.length).toFixed(2) : '0.00'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Domain Pricing</h1><p className="text-sm text-gray-400 mt-1">Configure TLD pricing for registration, renewal, and transfer</p></div>
        <button className="px-4 py-2 bg-aero-blue hover:bg-aero-blue/80 text-white rounded-lg text-sm font-medium transition-colors">+ Add TLD</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[{l:'Total TLDs',v:domainPricing.length,i:'🏷️',c:'text-white'},{l:'Avg. Price',v:`$${avg}`,i:'💰',c:'text-emerald-400'},{l:'Premium',v:domainPricing.filter(p=>p.premium).length,i:'⭐',c:'text-yellow-400'},{l:'Popular',v:domainPricing.filter(p=>p.popular).length,i:'🔥',c:'text-orange-400'}].map(s=>(
          <div key={s.l} className="glass-card p-4"><div className="flex items-center gap-3"><span className="text-2xl">{s.i}</span><div><p className={`text-2xl font-bold ${s.c}`}>{s.v}</p><p className="text-xs text-gray-400">{s.l}</p></div></div></div>
        ))}
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search TLDs..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-aero-blue focus:outline-none" />
          <div className="flex gap-2">
            <button onClick={()=>setFilterCat('all')} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filterCat==='all'?'bg-aero-blue text-white':'bg-white/5 text-gray-300 hover:bg-white/10'}`}>All</button>
            {cats.map(c=><button key={c} onClick={()=>setFilterCat(c)} className={`px-3 py-1.5 rounded-lg text-xs transition-colors capitalize ${filterCat===c?'bg-aero-blue text-white':'bg-white/5 text-gray-300 hover:bg-white/10'}`}>{c}</button>)}
          </div>
        </div>
        <table className="w-full"><thead><tr className="border-b border-white/10 text-left">
          <th className="pb-3 text-xs text-gray-400">TLD</th><th className="pb-3 text-xs text-gray-400">Category</th><th className="pb-3 text-xs text-gray-400">Register</th><th className="pb-3 text-xs text-gray-400">Renewal</th><th className="pb-3 text-xs text-gray-400">Transfer</th><th className="pb-3 text-xs text-gray-400">Tags</th><th className="pb-3 text-xs text-gray-400">Actions</th>
        </tr></thead><tbody className="divide-y divide-white/5">
          {filtered.map(p=>(
            <tr key={p.tld} className="hover:bg-white/5 transition-colors">
              <td className="py-3 text-sm font-mono font-bold text-white">{p.tld}</td>
              <td className="py-3"><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${catC[p.category]}`}>{p.category}</span></td>
              <td className="py-3 text-sm text-emerald-400 font-medium">${p.registerPrice}</td>
              <td className="py-3 text-sm text-white">${p.renewalPrice}</td>
              <td className="py-3 text-sm text-gray-300">${p.transferPrice}</td>
              <td className="py-3"><div className="flex gap-1">{p.premium&&<span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">Premium</span>}{p.popular&&<span className="text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">Popular</span>}</div></td>
              <td className="py-3"><button className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-gray-300">Edit</button></td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  )
}
