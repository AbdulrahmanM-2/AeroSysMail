import { prisma } from '@/lib/prisma'

export default async function InvoicesPage() {
  // Fetch invoices directly from the database
  const invoices = await prisma.invoice.findMany({
    orderBy: { dueDate: 'asc' }
  })

  // Calculate stats server-side
  const stats = {
    total: invoices.length,
    totalAmount: invoices.reduce((s, i) => s + i.amount, 0),
    pending: invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0),
    paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
  }

  const statusColor = (s: string) => {
    switch(s) {
      case 'paid': return 'bg-emerald-500/20 text-emerald-400'
      case 'pending': return 'bg-amber-500/20 text-amber-400'
      case 'overdue': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Invoices</h1>
          <p className="text-sm text-gray-500">Track payments and billing</p>
        </div>
        <button className="btn-primary">+ New Invoice</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400">Total Revenue</p>
          <p className="text-2xl font-bold">${stats.totalAmount.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400">Paid</p>
          <p className="text-2xl font-bold text-emerald-400">${stats.paid.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-amber-400">${stats.pending.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400">Overdue</p>
          <p className="text-2xl font-bold text-red-400">${stats.overdue.toLocaleString()}</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Invoice</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Client</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Amount</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Status</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Due Date</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors">
                <td className="px-4 py-3 text-sm font-medium font-mono">{inv.id}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{inv.client}</td>
                <td className="px-4 py-3 text-sm font-medium">${inv.amount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor(inv.status)}`}>
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{new Date(inv.dueDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-xs text-aero-blue hover:text-blue-400">View</button>
                    <button className="text-xs text-gray-400 hover:text-white">Download</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}