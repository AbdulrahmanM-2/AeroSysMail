'use client'
import { useState, useEffect } from 'react'
import type { Domain, DNSRecord } from '@/lib/types'
import type { DNSRecordType } from '@/lib/types'

const rtc: Record<string, string> = { A:'bg-blue-500/20 text-blue-400', AAAA:'bg-indigo-500/20 text-indigo-400', CNAME:'bg-purple-500/20 text-purple-400', MX:'bg-orange-500/20 text-orange-400', TXT:'bg-green-500/20 text-green-400', NS:'bg-yellow-500/20 text-yellow-400', SRV:'bg-pink-500/20 text-pink-400', CAA:'bg-red-500/20 text-red-400' }

export default function AdminDNSPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [selDom, setSelDom] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [records, setRecords] = useState<DNSRecord[]>([])
  const [nt, setNt] = useState<DNSRecordType>('A')
  const [nn, setNn] = useState('')
  const [nv, setNv] = useState('')

  useEffect(() => {
    fetch('/api/domains').then(r => r.json()).then(d => {
      setDomains(d.domains || [])
      if (d.domains?.length > 0 && !selDom) setSelDom(d.domains[0].id)
    })
  }, [])

  useEffect(() => {
    if (selDom) {
      fetch(`/api/domains/dns?domainId=${selDom}`).then(r => r.json()).then(d => setRecords(d.records || []))
    }
  }, [selDom])

  const dom = domains.find(d => d.id === selDom)
  const recs = records
  const all = records

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">DNS Management</h1><p className="text-sm text-gray-400 mt-1">Configure DNS records for all domains</p></div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-aero-blue hover:bg-aero-blue/80 text-white rounded-lg text-sm font-medium transition-colors">+ Add Record</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[['A',all.filter(r=>r.type==='A').length],['CNAME',all.filter(r=>r.type==='CNAME').length],['MX',all.filter(r=>r.type==='MX').length],['TXT',all.filter(r=>r.type==='TXT').length]].map(([t,c])=>(
          <div key={String(t)} className="glass-card p-4"><div className="flex items-center gap-3"><span className={`px-2 py-1 rounded text-xs font-mono font-bold ${rtc[String(t)]}`}>{String(t)}</span><div><p className="text-xl font-bold text-white">{String(c)}</p><p className="text-xs text-gray-400">Records</p></div></div></div>
        ))}
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm text-gray-400">Select Domain:</label>
          <select value={selDom} onChange={e => setSelDom(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-aero-blue focus:outline-none min-w-[250px]">
            {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          {dom && <div className="ml-auto flex items-center gap-2 text-sm text-gray-400"><span>NS:</span>{JSON.parse(dom.nameservers as unknown as string || '[]').map((ns: string)=><span key={ns} className="bg-white/5 px-2 py-0.5 rounded text-xs text-gray-300 font-mono">{ns}</span>)}</div>}
        </div>

        {showAdd && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">Add DNS Record for {dom?.name}</h3>
            <div className="grid grid-cols-4 gap-3">
              <select value={nt} onChange={e => setNt(e.target.value as DNSRecordType)} className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-sm focus:border-aero-blue focus:outline-none">
                {(['A','AAAA','CNAME','MX','TXT','NS','SRV','CAA'] as DNSRecordType[]).map(t=><option key={t} value={t}>{t}</option>)}
              </select>
              <input value={nn} onChange={e=>setNn(e.target.value)} placeholder="@" className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-sm focus:border-aero-blue focus:outline-none font-mono" />
              <input value={nv} onChange={e=>setNv(e.target.value)} placeholder="Value" className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-sm focus:border-aero-blue focus:outline-none font-mono" />
              <div className="flex gap-2"><button className="px-3 py-1.5 bg-aero-blue hover:bg-aero-blue/80 text-white rounded text-sm font-medium transition-colors">Add</button><button onClick={()=>setShowAdd(false)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded text-sm transition-colors">Cancel</button></div>
            </div>
          </div>
        )}

        <table className="w-full"><thead><tr className="border-b border-white/10 text-left">
          <th className="pb-3 text-xs text-gray-400 font-medium">Type</th><th className="pb-3 text-xs text-gray-400 font-medium">Name</th><th className="pb-3 text-xs text-gray-400 font-medium">Value</th><th className="pb-3 text-xs text-gray-400 font-medium">TTL</th><th className="pb-3 text-xs text-gray-400 font-medium">Priority</th><th className="pb-3 text-xs text-gray-400 font-medium">Actions</th>
        </tr></thead><tbody className="divide-y divide-white/5">
          {recs.length === 0 ? <tr><td colSpan={6} className="py-8 text-center text-gray-500 text-sm">No DNS records configured</td></tr> :
          recs.map(r => (
            <tr key={r.id} className="hover:bg-white/5 transition-colors">
              <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${rtc[r.type]}`}>{r.type}</span></td>
              <td className="py-3 text-sm text-white font-mono">{r.name}</td>
              <td className="py-3 text-sm text-gray-300 font-mono max-w-[300px] truncate">{r.value}</td>
              <td className="py-3 text-sm text-gray-400">{r.ttl}s</td>
              <td className="py-3 text-sm text-gray-400">{r.priority ?? '—'}</td>
              <td className="py-3"><div className="flex gap-1"><button className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-gray-300">Edit</button><button className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 rounded text-xs text-red-400">Delete</button></div></td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  )
}
