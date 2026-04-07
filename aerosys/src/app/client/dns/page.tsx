'use client'
import { useState } from 'react'
import { domains } from '@/lib/domainData'
import type { DNSRecordType } from '@/lib/types'

const rtc: Record<string,string> = { A:'bg-blue-500/20 text-blue-400', AAAA:'bg-indigo-500/20 text-indigo-400', CNAME:'bg-purple-500/20 text-purple-400', MX:'bg-orange-500/20 text-orange-400', TXT:'bg-green-500/20 text-green-400', NS:'bg-yellow-500/20 text-yellow-400', SRV:'bg-pink-500/20 text-pink-400', CAA:'bg-red-500/20 text-red-400' }

export default function ClientDNSPage() {
  const myDoms = domains.filter(d => d.registrantEmail==='sarah@techcorp.com'||d.registrant==='Tech Corp')
  const [sel, setSel] = useState(myDoms[0]?.id||'')
  const [showAdd, setShowAdd] = useState(false)
  const dom = domains.find(d => d.id===sel)
  const recs = dom?.dnsRecords||[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">DNS Manager</h1><p className="text-sm text-gray-400 mt-1">Configure DNS records for your domains</p></div>
        <button onClick={()=>setShowAdd(!showAdd)} className="px-4 py-2 bg-aero-blue hover:bg-aero-blue/80 text-white rounded-lg text-sm font-medium transition-colors">+ Add Record</button>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm text-gray-400">Domain:</label>
          <select value={sel} onChange={e=>setSel(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-aero-blue focus:outline-none">
            {myDoms.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          {dom&&<div className="ml-auto text-xs text-gray-400">NS: {dom.nameservers.map(ns=><span key={ns} className="font-mono bg-white/5 px-1.5 py-0.5 rounded ml-1">{ns}</span>)}</div>}
        </div>

        {showAdd && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">Add DNS Record</h3>
            <div className="grid grid-cols-4 gap-3">
              <select className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-sm">{(['A','AAAA','CNAME','MX','TXT','NS'] as DNSRecordType[]).map(t=><option key={t} value={t}>{t}</option>)}</select>
              <input placeholder="@" className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-sm font-mono" />
              <input placeholder="Value" className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-sm font-mono" />
              <div className="flex gap-2"><button className="px-3 py-1.5 bg-aero-blue text-white rounded text-sm font-medium">Add</button><button onClick={()=>setShowAdd(false)} className="px-3 py-1.5 bg-white/5 text-gray-300 rounded text-sm">Cancel</button></div>
            </div>
          </div>
        )}

        <table className="w-full"><thead><tr className="border-b border-white/10 text-left">
          <th className="pb-3 text-xs text-gray-400">Type</th><th className="pb-3 text-xs text-gray-400">Name</th><th className="pb-3 text-xs text-gray-400">Value</th><th className="pb-3 text-xs text-gray-400">TTL</th><th className="pb-3 text-xs text-gray-400">Actions</th>
        </tr></thead><tbody className="divide-y divide-white/5">
          {recs.length===0?<tr><td colSpan={5} className="py-8 text-center text-gray-500 text-sm">No DNS records</td></tr>:
          recs.map(r=>(
            <tr key={r.id} className="hover:bg-white/5 transition-colors">
              <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${rtc[r.type]}`}>{r.type}</span></td>
              <td className="py-3 text-sm text-white font-mono">{r.name}</td>
              <td className="py-3 text-sm text-gray-300 font-mono max-w-[250px] truncate">{r.value}</td>
              <td className="py-3 text-sm text-gray-400">{r.ttl}s</td>
              <td className="py-3"><div className="flex gap-1"><button className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-gray-300">Edit</button><button className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 rounded text-xs text-red-400">Delete</button></div></td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  )
}
