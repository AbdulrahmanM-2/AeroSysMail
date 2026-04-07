'use client'
import { useState } from 'react'
import { domainPricing, domains } from '@/lib/domainData'

interface SR { domain:string; available:boolean; premium:boolean; price:number; renewalPrice:number; tld:string }

export default function ClientDomainsPage() {
  const [sq, setSq] = useState('')
  const [results, setResults] = useState<SR[]>([])
  const [searched, setSearched] = useState(false)
  const [cart, setCart] = useState<SR[]>([])
  const [tab, setTab] = useState<'search'|'mydomains'>('search')
  const myDomains = domains.filter(d => d.registrantEmail==='sarah@techcorp.com'||d.registrant==='Tech Corp')

  const handleSearch = () => {
    if(!sq.trim()) return
    const name = sq.replace(/\..+$/,'').toLowerCase().replace(/[^a-z0-9-]/g,'')
    if(!name) return
    const res = domainPricing.map(p => ({ domain:name+p.tld, available:!domains.some(d=>d.name===name+p.tld), premium:p.premium, price:p.registerPrice, renewalPrice:p.renewalPrice, tld:p.tld }))
      .sort((a,b) => a.available===b.available ? a.price-b.price : a.available ? -1 : 1)
    setResults(res); setSearched(true)
  }

  const addCart = (r:SR) => { if(!cart.find(c=>c.domain===r.domain)) setCart([...cart,r]) }
  const rmCart = (d:string) => setCart(cart.filter(c=>c.domain!==d))

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Domains</h1><p className="text-sm text-gray-400 mt-1">Search, register, and manage your domains</p></div>

      <div className="flex gap-2 border-b border-white/10 pb-0">
        {(['search','mydomains'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tab===t?'text-aero-blue border-aero-blue':'text-gray-400 border-transparent hover:text-white'}`}>
            {t==='search'?'🔍 Search & Register':'🌐 My Domains'}
          </button>
        ))}
      </div>

      {tab==='search' && (<>
        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Find Your Perfect Domain</h2>
          <p className="text-sm text-gray-400 mb-6">Search from 20+ TLDs including .aero, .com, .io, .ai and more</p>
          <div className="flex gap-3 max-w-2xl mx-auto">
            <input value={sq} onChange={e=>setSq(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder="Enter your domain name..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-aero-blue focus:outline-none" />
            <button onClick={handleSearch} className="px-6 py-3 bg-aero-blue hover:bg-aero-blue/80 text-white rounded-lg text-sm font-medium transition-colors">Search</button>
          </div>
        </div>

        {searched && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-2">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">{results.filter(r=>r.available).length} available</h3>
              {results.map(r=>(
                <div key={r.domain} className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${r.available?'bg-white/5 border-white/10 hover:border-emerald-500/30':'bg-white/[0.02] border-white/5 opacity-60'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${r.available?'bg-emerald-400':'bg-red-400'}`} />
                    <span className="text-sm font-medium text-white">{r.domain}</span>
                    {r.premium&&<span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">Premium</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right"><p className="text-sm font-bold text-white">${r.price}<span className="text-xs text-gray-400 font-normal">/yr</span></p><p className="text-xs text-gray-500">Renews ${r.renewalPrice}/yr</p></div>
                    {r.available ? (cart.find(c=>c.domain===r.domain) ?
                      <button onClick={()=>rmCart(r.domain)} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium">✓ In Cart</button> :
                      <button onClick={()=>addCart(r)} className="px-3 py-1.5 bg-aero-blue hover:bg-aero-blue/80 text-white rounded-lg text-xs font-medium transition-colors">Add to Cart</button>
                    ) : <span className="text-xs text-red-400 px-3 py-1.5">Taken</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="glass-card p-4 h-fit sticky top-6">
              <h3 className="text-sm font-semibold text-white mb-3">🛒 Cart ({cart.length})</h3>
              {cart.length===0 ? <p className="text-xs text-gray-500 text-center py-4">Add domains to get started</p> : (<>
                <div className="space-y-2 mb-4">{cart.map(c=>(
                  <div key={c.domain} className="flex items-center justify-between py-2 border-b border-white/5"><span className="text-sm text-white">{c.domain}</span><div className="flex items-center gap-2"><span className="text-sm text-emerald-400">${c.price}</span><button onClick={()=>rmCart(c.domain)} className="text-red-400 hover:text-red-300 text-xs">✕</button></div></div>
                ))}</div>
                <div className="flex justify-between py-2 border-t border-white/10 mb-4"><span className="text-sm font-semibold text-white">Total</span><span className="text-sm font-bold text-emerald-400">${cart.reduce((s,c)=>s+c.price,0).toFixed(2)}/yr</span></div>
                <button className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors">Checkout & Register</button>
              </>)}
            </div>
          </div>
        )}
      </>)}

      {tab==='mydomains' && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">My Registered Domains</h3>
          {myDomains.length===0 ? <div className="text-center py-12 text-gray-500"><p className="text-4xl mb-3">🌐</p><p>No domains yet</p></div> :
          <div className="space-y-3">{myDomains.map(d=>(
            <div key={d.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center gap-3"><span className="text-lg">🌐</span><div><p className="text-sm font-medium text-white">{d.name}</p><p className="text-xs text-gray-400">Expires: {d.expiresAt}</p></div></div>
              <div className="flex items-center gap-3"><span className={`text-xs px-2 py-0.5 rounded-full ${d.status==='active'?'bg-emerald-500/20 text-emerald-400':'bg-yellow-500/20 text-yellow-400'}`}>{d.status}</span><button className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-gray-300">DNS</button><button className="px-2 py-1 bg-aero-blue/20 hover:bg-aero-blue/30 text-aero-blue rounded text-xs">Renew</button></div>
            </div>
          ))}</div>}
        </div>
      )}
    </div>
  )
}
