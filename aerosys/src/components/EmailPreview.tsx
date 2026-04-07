'use client'
import type { Email } from '@/lib/types'

interface Props {
  email: Email | null
}

const smartReplies = [
  "Yes, Wednesday at 2 PM works!",
  "Can we do it at 3 PM instead?",
  "How about Thursday at 11 AM?",
]

export default function EmailPreview({ email }: Props) {
  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <span className="text-4xl mb-4 block">📬</span>
          <p>Select an email to read</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-5 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">{email.subject}</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-gray-400 hover:text-white transition-colors">✏️</button>
            <button className="p-1.5 text-gray-400 hover:text-white transition-colors">📌</button>
            <button className="p-1.5 text-gray-400 hover:text-white transition-colors">⋯</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-sm font-bold">
            {email.fromName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium">
              {email.fromName} <span className="text-gray-500 font-normal">{email.from}</span>
            </p>
            <p className="text-xs text-gray-500">to alex@aerosys.aero</p>
          </div>
          <span className="ml-auto text-xs text-gray-500">
            {new Date(email.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </span>
        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        <div className="prose prose-invert max-w-none">
          {email.body.split('\n').map((line, i) => (
            <p key={i} className="text-sm text-gray-300 mb-2 leading-relaxed">{line}</p>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {smartReplies.map((reply, i) => (
            <button key={i} className="text-xs px-3 py-2 rounded-full border border-aero-blue/30 text-aero-blue hover:bg-aero-blue/10 transition-all">
              {reply}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="text-emerald-400">✅</span>
            Confirm the meeting for <strong className="text-white">Wednesday at 2 PM</strong> ☑️
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="text-aero-blue">📅</span>
            Check <strong className="text-white">Alex&apos;s</strong> calendar availability
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/[0.06]">
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/[0.06]">
            {['☐', '✎', 'B', 'I', 'U', '≡', '≡', '≡', '≡'].map((icon, i) => (
              <button key={i} className="p-1 text-gray-400 hover:text-white text-sm transition-colors">{icon}</button>
            ))}
          </div>
          <textarea className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-600 resize-none outline-none h-16"
            placeholder="Type your reply..." defaultValue="Sure, that works. I'll prepare the notes and book the meeting for Wednesday, April 24th at 2 PM. See you then!" />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button className="btn-primary text-sm py-1.5 px-4">Send</button>
              <button className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                ✨ Smart Reply
              </button>
              <button className="text-xs text-gray-400 hover:text-white">More Options</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
