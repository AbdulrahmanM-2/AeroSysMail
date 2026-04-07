interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  change?: string
  positive?: boolean
  icon?: string
  sparkline?: boolean
}

export default function StatCard({ title, value, subtitle, change, positive = true, icon }: StatCardProps) {
  return (
    <div className="glass-card-hover p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="flex items-end gap-3">
        <p className="stat-value text-white">{value}</p>
        {change && (
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${positive ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
            {positive ? '▲' : '▼'} {change}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-gray-500 mt-1.5">{subtitle}</p>}
      <div className="mt-3 h-8 flex items-end gap-0.5">
        {[40, 65, 45, 80, 55, 70, 85, 60, 90, 75, 95, 88].map((h, i) => (
          <div key={i} className="flex-1 bg-aero-blue/20 rounded-t-sm" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}
