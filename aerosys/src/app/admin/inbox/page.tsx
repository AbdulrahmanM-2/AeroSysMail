'use client'
import { useState, useEffect } from 'react'
import EmailList from '@/components/EmailList'
import EmailPreview from '@/components/EmailPreview'
import AutopilotSidebar from '@/components/AutopilotSidebar'
import type { Email } from '@/lib/types'

export default function AdminInbox() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [folder, setFolder] = useState('inbox')

  useEffect(() => {
    fetch(`/api/emails?folder=${folder}`).then(r => r.json()).then(d => {
      setEmails(d.emails || [])
      if (d.emails?.length > 0 && !selected) setSelected(d.emails[0].id)
    })
  }, [folder, selected])

  const selectedEmail = emails.find(e => e.id === selected) || null

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="w-80 border-r border-white/[0.06]">
        <EmailList emails={emails} selected={selected} onSelect={setSelected} folder={folder} onFolderChange={setFolder} />
      </div>
      <EmailPreview email={selectedEmail} />
      <AutopilotSidebar />
    </div>
  )
}
