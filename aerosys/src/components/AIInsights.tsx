import type { AIInsight } from '@/lib/types'

export default function AIInsights({ insights }: { insights: AIInsight[] }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">AI Insights</h3>
        <div className="flex gap-1">
          <button className="text-gray-400 hover:text-white text-sm p-1">◀</button>
          <button className="text-gray-400 hover:text-white text-sm p-1">▶</button>
        </div>
      </div>
      <div className="space-y-3">
        {insights.slice(0, 4).map(insight => (
          <div key={insight.id} className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
              insight.type === 'optimization' ? 'bg-aero-blue/20' :
              insight.type === 'alert' ? 'bg-amber-500/20' : 'bg-emerald-500/20'
            }`}>
              <span className={`text-xs ${
                insight.type === 'optimization' ? 'text-aero-blue' :
                insight.type === 'alert' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {insight.type === 'optimization' ? '⚡' : insight.type === 'alert' ? '⚠' : '💡'}
              </span>
            </div>
            <p className="text-sm text-gray-300">{insight.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
