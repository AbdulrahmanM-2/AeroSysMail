import DealPipeline from '@/components/DealPipeline'
import { prisma } from '@/lib/prisma'

export default async function DealsPage() {
  // Fetch deals directly from the database
  const deals = await prisma.deal.findMany({
    orderBy: { createdAt: 'desc' }
  })

  // Calculate stats server-side
  const stats = {
    total: deals.length,
    totalValue: deals.reduce((s, d) => s + d.value, 0),
    byStage: {
      new_lead: deals.filter(d => d.stage === 'new_lead').length,
      negotiation: deals.filter(d => d.stage === 'negotiation').length,
      awaiting_signature: deals.filter(d => d.stage === 'awaiting_signature').length,
      closed: deals.filter(d => d.stage === 'closed').length,
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Deals</h1>
          <p className="text-sm text-gray-500">Manage your sales pipeline</p>
        </div>
        <button className="btn-primary">+ New Deal</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400">Total Pipeline</p>
          <p className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400">New Leads</p>
          <p className="text-2xl font-bold text-blue-400">{stats.byStage.new_lead}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400">In Negotiation</p>
          <p className="text-2xl font-bold text-amber-400">{stats.byStage.negotiation}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400">Closed Won</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.byStage.closed}</p>
        </div>
      </div>

      <DealPipeline deals={deals as any} />

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Deal</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Company</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Value</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Stage</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Probability</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Assigned</th>
            </tr>
          </thead>
          <tbody>
            {deals.map(deal => (
              <tr key={deal.id} className="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors">
                <td className="px-4 py-3 text-sm font-medium">{deal.name}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{deal.company}</td>
                <td className="px-4 py-3 text-sm font-medium">${deal.value.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    deal.stage === 'new_lead' ? 'bg-blue-500/20 text-blue-400' :
                    deal.stage === 'negotiation' ? 'bg-amber-500/20 text-amber-400' :
                    deal.stage === 'awaiting_signature' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {deal.stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-aero-blue rounded-full" style={{ width: `${deal.probability}%` }} />
                    </div>
                    <span className="text-xs text-gray-400">{deal.probability}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{deal.assignedTo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}