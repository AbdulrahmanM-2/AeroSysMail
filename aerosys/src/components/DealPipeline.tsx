'use client'
import type { Deal } from '@/lib/types'

const stages = [
  { key: 'new_lead', label: 'New Leads', color: 'bg-blue-500' },
  { key: 'negotiation', label: 'In Negotiation', color: 'bg-amber-500' },
  { key: 'awaiting_signature', label: 'Awaiting Signature', color: 'bg-purple-500' },
  { key: 'closed', label: 'Closed Deals', color: 'bg-emerald-500' },
]

export default function DealPipeline({ deals }: { deals: Deal[] }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Deal Pipeline</h3>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/[0.06]">◀</button>
          <button className="p-1.5 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/[0.06]">🔄</button>
          <button className="p-1.5 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/[0.06]">🕐</button>
          <button className="p-1.5 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/[0.06]">⋯</button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {stages.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage.key)
          return (
            <div key={stage.key} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white">{stage.label}</h4>
                <span className="text-xs bg-white/[0.08] text-gray-300 px-2 py-0.5 rounded-full">{stageDeals.length}</span>
              </div>
              <div className="space-y-2">
                {stageDeals.map(deal => (
                  <div key={deal.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer border border-transparent hover:border-white/[0.08]">
                    <div className={`w-5 h-5 rounded ${stage.color}/20 flex items-center justify-center`}>
                      <svg className={`w-3 h-3 ${stage.color.replace('bg-', 'text-')}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{deal.company}</p>
                      {deal.stage === 'closed' && <p className="text-xs text-gray-500">${deal.value.toLocaleString()}</p>}
                    </div>
                    {deal.stage === 'closed' && (
                      <div className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
