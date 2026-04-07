'use client'
import { useState, useEffect } from 'react'
import type { Domain, WHOISInfo } from '@/lib/types'

export default function AdminWHOISPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [selDom, setSelDom] = useState('')
  const [editing, setEditing] = useState(false)
  const [whois, setWhois] = useState<WHOISInfo | null>(null)

  useEffect(() => {
    fetch('/api/domains').then(r => r.json()).then(d => {
      setDomains(d.domains || [])
      if (d.domains?.length > 0 && !selDom) setSelDom(d.domains[0].id)
    })
  }, [])

  useEffect(() => {
    if (selDom) {
      fetch(`/api/domains/whois?domainId=${selDom}`).then(r => r.json()).then(d => setWhois(d.whois || null))
    }
  }, [selDom])

  const dom = domains.find(d => d.id === selDom)

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-2 border-b border-white/5"><span className="text-sm text-gray-400">{label}</span><span className="text-sm text-white font-medium">{dom?.whoisPrivacy && !editing ? '••••••••' : value}</span></div>
  )

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">WHOIS Management</h1><p className="text-sm text-gray-400 mt-1">View and manage WHOIS records with privacy protection</p></div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4"><div className="flex items-center gap-3"><span className="text-2xl">🛡️</span><div><p className="text-2xl font-bold text-emerald-400">{domains.filter(d=>d.whoisPrivacy).length}</p><p className="text-xs text-gray-400">Privacy Enabled</p></div></div></div>
        <div className="glass-card p-4"><div className="flex items-center gap-3"><span className="text-2xl">👁️</span><div><p className="text-2xl font-bold text-yellow-400">{domains.filter(d=>!d.whoisPrivacy).length}</p><p className="text-xs text-gray-400">Privacy Disabled</p></div></div></div>
        <div className="glass-card p-4"><div className="flex items-center gap-3"><span className="text-2xl">📋</span><div><p className="text-2xl font-bold text-white">{domains.length}</p><p className="text-xs text-gray-400">WHOIS Records</p></div></div></div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="glass-card p-4 col-span-1">
          <h3 className="text-sm font-semibold text-white mb-3">Domains</h3>
          <div className="space-y-1">{domains.map(d=>(
            <button key={d.id} onClick={()=>{setSelDom(d.id);setEditing(false)}} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selDom===d.id?'bg-aero-blue/20 text-aero-blue':'text-gray-300 hover:bg-white/5'}`}>
              <div className="flex items-center justify-between"><span>{d.name}</span>{d.whoisPrivacy&&<span className="text-xs">🛡️</span>}</div>
            </button>
          ))}</div>
        </div>

        <div className="glass-card p-6 col-span-2">
          {dom && whois ? (<>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">WHOIS: {dom.name}</h3>
              <div className="flex gap-2">
                <button onClick={()=>setEditing(!editing)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-300 transition-colors">{editing?'Lock':'Reveal & Edit'}</button>
                <button className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${dom.whoisPrivacy?'bg-emerald-500/20 text-emerald-400':'bg-yellow-500/20 text-yellow-400'}`}>{dom.whoisPrivacy?'🛡️ Privacy On':'👁️ Privacy Off'}</button>
              </div>
            </div>
            <div className="space-y-4">
              <div><h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Registrant</h4><Row label="Name" value={whois.registrantName} /><Row label="Organization" value={whois.registrantOrg} /><Row label="Email" value={whois.registrantEmail} /><Row label="Phone" value={whois.registrantPhone} /><Row label="Address" value={`${whois.registrantAddress}, ${whois.registrantCity}, ${whois.registrantState}`} /><Row label="Country" value={whois.registrantCountry} /></div>
              <div><h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Admin Contact</h4><Row label="Name" value={whois.adminName} /><Row label="Email" value={whois.adminEmail} /></div>
              <div><h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tech Contact</h4><Row label="Name" value={whois.techName} /><Row label="Email" value={whois.techEmail} /></div>
              <div><h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Dates</h4><Row label="Created" value={new Date(whois.createdDate).toLocaleDateString()} /><Row label="Updated" value={new Date(whois.updatedDate).toLocaleDateString()} /><Row label="Expires" value={new Date(whois.expiryDate).toLocaleDateString()} /></div>
            </div>
          </>) : dom ? (<div className="text-center py-12 text-gray-500"><p className="text-4xl mb-3">📋</p><p className="text-sm">No WHOIS record for {dom.name}</p></div>) : null}
        </div>
      </div>
    </div>
  )
}
