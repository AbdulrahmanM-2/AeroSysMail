'use client'
import { useState } from 'react'

export default function SupportPage() {
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const tickets = [
    { id: 'T-104', subject: 'Email delivery delay', status: 'resolved', date: '2026-04-01', priority: 'medium' },
    { id: 'T-105', subject: 'Storage quota increase request', status: 'open', date: '2026-04-05', priority: 'low' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-xl font-bold">Support</h1><p className="text-sm text-gray-500">Get help from our team</p></div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center cursor-pointer hover:bg-white/[0.06] transition-all">
          <span className="text-2xl mb-2 block">📚</span>
          <p className="text-sm font-medium">Knowledge Base</p>
          <p className="text-xs text-gray-500 mt-1">Browse articles</p>
        </div>
        <div className="glass-card p-4 text-center cursor-pointer hover:bg-white/[0.06] transition-all">
          <span className="text-2xl mb-2 block">💬</span>
          <p className="text-sm font-medium">Live Chat</p>
          <p className="text-xs text-emerald-400 mt-1">Online now</p>
        </div>
        <div className="glass-card p-4 text-center cursor-pointer hover:bg-white/[0.06] transition-all">
          <span className="text-2xl mb-2 block">📧</span>
          <p className="text-sm font-medium">Email Support</p>
          <p className="text-xs text-gray-500 mt-1">support@aerosys.aero</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4">Your Tickets</h3>
        <div className="space-y-2">
          {tickets.map(ticket => (
            <div key={ticket.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer">
              <span className="text-sm font-mono font-medium text-aero-blue">{ticket.id}</span>
              <span className="text-sm flex-1">{ticket.subject}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                ticket.status === 'open' ? 'bg-aero-blue/20 text-aero-blue' : 'bg-emerald-500/20 text-emerald-400'
              }`}>{ticket.status}</span>
              <span className="text-xs text-gray-500">{ticket.date}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4">New Support Request</h3>
        {submitted ? (
          <div className="text-center py-8">
            <span className="text-3xl mb-3 block">✅</span>
            <p className="font-medium">Ticket submitted!</p>
            <p className="text-sm text-gray-500 mt-1">We typically respond within 2 hours</p>
            <button onClick={() => setSubmitted(false)} className="btn-ghost mt-4 text-sm">Submit Another</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Subject</label>
              <input className="input-dark w-full" placeholder="Brief description of your issue" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Priority</label>
              <select className="input-dark w-full">
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                className="input-dark w-full h-32 resize-none" placeholder="Describe your issue in detail..." />
            </div>
            <button onClick={() => setSubmitted(true)} className="btn-primary">Submit Ticket</button>
          </div>
        )}
      </div>
    </div>
  )
}
