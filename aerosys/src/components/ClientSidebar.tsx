'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { icon: '📊', label: 'Dashboard', href: '/client' },
  { icon: '📧', label: 'Inbox', href: '/client/inbox' },
  { icon: '📄', label: 'Invoices', href: '/client/invoices' },
  { icon: '💬', label: 'Support', href: '/client/support' },
]
const domItems = [
  { icon: '🔍', label: 'Search & Register', href: '/client/domains' },
  { icon: '📡', label: 'DNS Manager', href: '/client/dns' },
  { icon: '🔄', label: 'Transfers', href: '/client/transfers' },
  { icon: '💳', label: 'Billing', href: '/client/billing' },
]

export default function ClientSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const handleLogout = async () => { await fetch('/api/auth/logout',{method:'POST'}); router.push('/login') }
  const isActive = (href: string) => href==='/client' ? pathname==='/client' : pathname.startsWith(href)

  return (
    <aside className="glass-sidebar w-60 min-h-screen flex flex-col py-4 fixed left-0 top-0 z-40">
      <div className="px-4 mb-6">
        <Link href="/client" className="flex items-center gap-2 group">
          <Image src="/logo.png" alt="AeroSysMail" width={36} height={24} className="drop-shadow-lg group-hover:scale-105 transition-transform" />
          <div><h1 className="text-base font-bold text-white leading-tight">AeroSys<span className="text-orange-400">Mail</span></h1><p className="text-[10px] text-gray-500">Client Portal</p></div>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => (
          <Link key={item.href} href={item.href} className={isActive(item.href)?'sidebar-link-active':'sidebar-link'}>
            <span className="text-base">{item.icon}</span><span>{item.label}</span>
          </Link>
        ))}

        <div className="pt-4 pb-2"><div className="sidebar-link-active cursor-default"><span className="text-base">🌐</span><span>Domains</span></div></div>
        <div className="pl-3 space-y-0.5">{domItems.map(item => (
          <Link key={item.href} href={item.href} className={isActive(item.href)?'sidebar-link-active text-xs !py-2':'sidebar-link text-xs !py-2'}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" /><span>{item.label}</span>
          </Link>
        ))}</div>
      </nav>

      <div className="px-3 mt-auto">
        <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300"><span className="text-base">🚪</span><span>Sign Out</span></button>
      </div>
    </aside>
  )
}
