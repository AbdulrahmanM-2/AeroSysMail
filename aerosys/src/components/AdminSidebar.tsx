'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { icon: '📧', label: 'Inbox', href: '/admin/inbox', badge: 12 },
  { icon: '📋', label: 'Tasks', href: '/admin/tasks' },
  { icon: '📅', label: 'Calendar', href: '/admin/calendar' },
]
const bizItems = [
  { icon: '📊', label: 'Dashboard', href: '/admin' },
  { icon: '🤝', label: 'Deals', href: '/admin/deals' },
  { icon: '📄', label: 'Invoices', href: '/admin/invoices' },
  { icon: '👥', label: 'Clients', href: '/admin/clients' },
  { icon: '📈', label: 'Analytics', href: '/admin/analytics' },
]
const domItems = [
  { icon: '🌐', label: 'Domains', href: '/admin/domains' },
  { icon: '📡', label: 'DNS Editor', href: '/admin/dns' },
  { icon: '🔄', label: 'Transfers', href: '/admin/transfers' },
  { icon: '🛡️', label: 'WHOIS', href: '/admin/whois' },
  { icon: '💰', label: 'Pricing', href: '/admin/pricing' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const handleLogout = async () => { await fetch('/api/auth/logout',{method:'POST'}); router.push('/login') }
  const isActive = (href: string) => href==='/admin' ? pathname==='/admin' : pathname.startsWith(href)

  return (
    <aside className="glass-sidebar w-60 min-h-screen flex flex-col py-4 fixed left-0 top-0 z-40 overflow-y-auto">
      <div className="px-4 mb-6">
        <Link href="/admin" className="flex items-center gap-2 group">
          <Image src="/logo.png" alt="AeroSysMail" width={36} height={24} className="drop-shadow-lg group-hover:scale-105 transition-transform" />
          <div><h1 className="text-base font-bold text-white leading-tight">AeroSys<span className="text-orange-400">Mail</span></h1></div>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => (
          <Link key={item.href} href={item.href} className={isActive(item.href)?'sidebar-link-active':'sidebar-link'}>
            <span className="text-base">{item.icon}</span><span className="flex-1">{item.label}</span>
            {item.badge && <span className="bg-aero-blue/20 text-aero-blue text-xs px-2 py-0.5 rounded-full font-medium">{item.badge}</span>}
          </Link>
        ))}

        <div className="pt-4 pb-2"><div className="sidebar-link-active cursor-default"><span className="text-base">🚀</span><span>Business Autopilot</span></div></div>
        <div className="pl-3 space-y-0.5">{bizItems.map(item => (
          <Link key={item.href} href={item.href} className={isActive(item.href)?'sidebar-link-active text-xs !py-2':'sidebar-link text-xs !py-2'}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" /><span>{item.label}</span>
          </Link>
        ))}</div>

        <div className="pt-4 pb-2"><div className="sidebar-link-active cursor-default"><span className="text-base">🌐</span><span>Domain Registrar</span></div></div>
        <div className="pl-3 space-y-0.5">{domItems.map(item => (
          <Link key={item.href} href={item.href} className={isActive(item.href)?'sidebar-link-active text-xs !py-2':'sidebar-link text-xs !py-2'}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" /><span>{item.label}</span>
          </Link>
        ))}</div>
      </nav>

      <div className="px-3 space-y-1 mt-auto">
        <Link href="/admin/settings" className={isActive('/admin/settings')?'sidebar-link-active':'sidebar-link'}><span className="text-base">⚙️</span><span>Settings</span></Link>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300"><span className="text-base">🚪</span><span>Sign Out</span></button>
      </div>
    </aside>
  )
}
