'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ComposePage() {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const router = useRouter()

  const handleSend = async () => {
    setSending(true)
    try {
      const res = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body, preview: body.slice(0, 60) }),
      })
      if (res.ok) {
        setSent(true)
        setTimeout(() => router.push('/admin/inbox'), 1500)
      }
    } catch { /* handle error */ }
    finally { setSending(false) }
  }

  if (sent) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold">Email Sent!</h2>
        <p className="text-gray-400 mt-2">Redirecting to inbox...</p>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Compose Email</h1>
      <div className="glass-card p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">To</label>
          <input value={to} onChange={e => setTo(e.target.value)} className="input-dark w-full" placeholder="recipient@email.com" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Subject</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} className="input-dark w-full" placeholder="Email subject" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Message</label>
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/[0.06]">
            {['B', 'I', 'U', '≡', '📎', '🔗', '📷'].map((icon, i) => (
              <button key={i} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/[0.06] rounded transition-colors text-sm">{icon}</button>
            ))}
          </div>
          <textarea value={body} onChange={e => setBody(e.target.value)}
            className="input-dark w-full h-64 resize-none" placeholder="Type your message..." />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSend} disabled={sending || !to || !subject}
            className="btn-primary disabled:opacity-50 flex items-center gap-2">
            {sending ? 'Sending...' : '📤 Send'}
          </button>
          <button className="btn-ghost flex items-center gap-2">✨ AI Assist</button>
          <button className="btn-ghost">Save Draft</button>
        </div>
      </div>
    </div>
  )
}
