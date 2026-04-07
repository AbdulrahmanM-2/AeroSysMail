'use client'
import { useState, useEffect } from 'react'
import type { Email } from '@/lib/types'

export default function ClientInbox() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selected, setSelected] = useState<Email | null>(null)

  useEffect(() => {
    fetch('/api/emails?folder=inbox').then(r => r.json()).then(d => setEmails(d.emails || []))
  }, [])

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="w-96 border-r border-white/[0.06] overflow-y-auto">
        <div className="p-4 border-b border-white/[0.06]">
          <h2 className="text-lg font-bold">Messages</h2>
          <p className="text-xs text-gray-500">Communications from AeroSys</p>
        </div>
        {emails.map(email => (
          <div key={email.id} onClick={() => setSelected(email)}
            className={`p-4 border-b border-white/[0.04] cursor-pointer transition-all ${
              selected?.id === email.id ? 'bg-aero-blue/10 border-l-2 border-l-aero-blue' : 'hover:bg-white/[0.03]'
            }`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm ${!email.read ? 'font-semibold text-white' : 'text-gray-300'}`}>{email.fromName}</span>
              <span className="text-xs text-gray-500">{new Date(email.date).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-gray-400 mb-1">{email.subject}</p>
            <p className="text-xs text-gray-500 truncate">{email.preview}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 p-6">
        {selected ? (
          <div>
            <h2 className="text-xl font-bold mb-4">{selected.subject}</h2>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold">
                {selected.fromName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{selected.fromName}</p>
                <p className="text-xs text-gray-500">{selected.from}</p>
              </div>
            </div>
            <div className="glass-card p-6">
              {selected.body.split('\n').map((line, i) => (
                <p key={i} className="text-sm text-gray-300 mb-2">{line}</p>
              ))}
            </div>
            <div className="mt-4">
              <button className="btn-primary">Reply</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <span className="text-4xl mb-4 block">📬</span>
              <p>Select a message to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
