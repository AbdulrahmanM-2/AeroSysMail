import AdminSidebar from '@/components/AdminSidebar'
import TopBar from '@/components/TopBar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 ml-60 flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  )
}
