'use client'
import { useState } from 'react'

export default function SettingsPage() {
  const [domain, setDomain] = useState('mail.aerosys.aero')
  const [saved, setSaved] = useState(false)

  const settings = [
    { category: 'Email Configuration', items: [
      { label: 'Primary Domain', value: domain, editable: true },
      { label: 'SMTP Port', value: '587 (TLS)', editable: false },
      { label: 'IMAP Port', value: '993 (SSL)', editable: false },
      { label: 'SPF Record', value: 'v=spf1 include:aerosys.aero ~all', editable: false },
      { label: 'DKIM', value: 'Enabled (2048-bit)', editable: false },
      { label: 'DMARC', value: 'v=DMARC1; p=quarantine', editable: false },
    ]},
    { category: 'Security', items: [
      { label: 'Two-Factor Auth', value: 'Enabled', editable: false },
      { label: 'Session Timeout', value: '24 hours', editable: false },
      { label: 'Login Attempts', value: '5 max', editable: false },
      { label: 'Password Policy', value: 'Strong (12+ chars)', editable: false },
    ]},
    { category: 'Services', items: [
      { label: 'SQLite Database', value: 'Connected', editable: false },
      { label: 'Redis Cache', value: 'Connected', editable: false },
      { label: 'MinIO Storage', value: 'Connected', editable: false },
      { label: 'Postfix SMTP', value: 'Running', editable: false },
      { label: 'Dovecot IMAP', value: 'Running', editable: false },
    ]},
  ]

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Settings</h1><p className="text-sm text-gray-500">Platform configuration</p></div>
        <button onClick={() => setSaved(true)} className="btn-primary">Save Changes</button>
      </div>
      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 text-emerald-400 text-sm flex items-center gap-2">
          ✅ Settings saved successfully
        </div>
      )}
      {settings.map(section => (
        <div key={section.category} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">{section.category}</h3>
          <div className="space-y-3">
            {section.items.map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-sm text-gray-400">{item.label}</span>
                {item.editable ? (
                  <input value={domain} onChange={e => setDomain(e.target.value)} className="input-dark text-sm py-1 w-64 text-right" />
                ) : (
                  <span className="text-sm text-gray-300 font-mono">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-2">Custom Domain</h3>
        <p className="text-xs text-gray-500 mb-4">Configure your own domain for the platform</p>
        <div className="space-y-3">
          <div className="flex gap-3">
            <input className="input-dark flex-1" placeholder="yourdomain.com" />
            <button className="btn-primary">Add Domain</button>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <p>To use a custom domain, add these DNS records:</p>
            <p className="font-mono bg-white/[0.04] px-3 py-1.5 rounded">CNAME → cname.vercel-dns.com</p>
            <p className="font-mono bg-white/[0.04] px-3 py-1.5 rounded">TXT → aerosys-verification=your-code</p>
          </div>
        </div>
      </div>
    </div>
  )
}
