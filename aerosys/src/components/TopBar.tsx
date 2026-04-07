'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function TopBar() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => { if (d.user) setUser(d.user) })
  }, [])

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="lg:hidden">
          <Image src="/logo.png" alt="AeroSysMail" width={32} height={22} className="drop-shadow-lg" />
        </div>
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="input-dark w-full pl-10 py-2 text-sm" placeholder="Search mail, deals, clients..." />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="glass-card px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-white/[0.08] transition-all">
          <div className="w-2 h-2 bg-aero-green rounded-full animate-pulse" />
          <span className="text-xs text-gray-400 hidden sm:inline">Listening...</span>
          <svg className="w-4 h-4 text-aero-blue" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </div>

        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-white/[0.08]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aero-blue to-blue-700 flex items-center justify-center text-sm font-bold">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-white leading-tight">{user?.name || 'Loading...'}</p>
            <p className="text-[10px] text-gray-500">{user?.role === 'admin' ? 'Administrator' : 'Client'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
