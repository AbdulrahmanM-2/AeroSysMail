interface Approval {
  id: string
  title: string
  type: 'deal' | 'client' | 'invoice'
}

const approvals: Approval[] = [
  { id: '1', title: 'High Value Deal > $50K', type: 'deal' },
  { id: '2', title: 'New Client Verification Needed', type: 'client' },
  { id: '3', title: 'Pending Large Invoice', type: 'invoice' },
]

export default function ApprovalQueue() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Approval Queue</h3>
        <button className="text-gray-400 hover:text-white text-sm">▾</button>
      </div>
      <div className="space-y-3">
        {approvals.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 text-xs">✓</span>
            </div>
            <span className="text-sm text-gray-300">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
