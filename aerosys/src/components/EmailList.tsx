'use client'
import type { Email } from '@/lib/types'

interface Props {
  emails: Email[]
  selected: string | null
  onSelect: (id: string) => void
  folder: string
  onFolderChange: (folder: string) => void
}

const folders = [
  { key: 'inbox', label: 'Inbox', icon: '📥' },
  { key: 'sent', label: 'Sent', icon: '📤' },
  { key: 'drafts', label: 'Drafts', icon: '📝' },
  { key: 'starred', label: 'Starred', icon: '⭐' },
  { key: 'important', label: 'Important', icon: '🔴' },
]

export default function EmailList({ emails, selected, onSelect, folder, onFolderChange }: Props) {
  const timeAgo = (date: string) => {
    const d = new Date(date)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  return (
    <div className="flex h-full">
      <div className="w-44 border-r border-white/[0.06] p-3 space-y-1">
        {folders.map(f => (
          <button key={f.key} onClick={() => onFolderChange(f.key)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
              folder === f.key ? 'bg-aero-blue/20 text-white border border-aero-blue/30' : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
            }`}>
            <span>{f.icon}</span>
            <span>{f.label}</span>
            {f.key === 'inbox' && <span className="ml-auto text-xs text-aero-blue">12</span>}
            {f.key === 'drafts' && <span className="ml-auto text-xs text-gray-500">3</span>}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <span className="text-sm font-medium text-white">All</span>
          <span className="text-sm text-aero-blue font-medium">AI</span>
          <span className="text-sm text-gray-400">Unread</span>
          <span className="text-sm text-gray-400">Analytics</span>
          <span className="text-sm text-gray-400">Business Autopilot</span>
        </div>
        {emails.map(email => (
          <div key={email.id} onClick={() => onSelect(email.id)}
            className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-white/[0.04] transition-all ${
              selected === email.id ? 'bg-aero-blue/10 border-l-2 border-l-aero-blue' : 'hover:bg-white/[0.03]'
            } ${!email.read ? 'bg-white/[0.02]' : ''}`}>
            <input type="checkbox" className="mt-1.5 rounded border-white/20 bg-white/5" onClick={e => e.stopPropagation()} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${!email.read ? 'font-semibold text-white' : 'text-gray-300'}`}>
                  {email.fromName}
                </span>
                <span className="text-xs text-gray-500">{timeAgo(email.date)}</span>
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">{email.preview}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
