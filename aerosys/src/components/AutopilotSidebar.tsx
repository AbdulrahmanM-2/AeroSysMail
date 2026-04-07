export default function AutopilotSidebar() {
  return (
    <div className="w-72 border-l border-white/[0.06] p-4 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">AutoPilot</h3>
        <div className="flex gap-1">
          <button className="p-1 text-gray-400 hover:text-white text-xs">📊</button>
          <button className="p-1 text-gray-400 hover:text-white text-xs">✉️</button>
        </div>
      </div>

      <div className="glass-card p-3">
        <p className="text-xs text-gray-400 mb-1">Monthly Revenue</p>
        <div className="flex items-end gap-2">
          <span className="text-xl font-bold">$124,500</span>
          <span className="text-xs text-emerald-400">▲ +12%</span>
        </div>
        <div className="mt-2 h-8 flex items-end gap-0.5">
          {[30, 45, 38, 60, 52, 70, 65, 80, 75, 85, 78, 90].map((h, i) => (
            <div key={i} className="flex-1 bg-aero-blue/30 rounded-t-sm" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-xs text-gray-400">Active Deals</span>
          </div>
          <span className="text-sm font-bold">8</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Deals Insights</h4>
          <div className="flex gap-1 text-gray-500 text-xs">📊 ✕</div>
        </div>
        <div className="space-y-2">
          <div className="glass-card p-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              <div className="flex-1">
                <p className="text-xs font-medium">Acme Ltd <span className="text-gray-500">contract ready to final.</span></p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs font-bold">$12,500</span>
                  <span className="text-[10px] text-gray-500">6h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Outstanding Invoices</h4>
          <span className="text-xs text-gray-400">5</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-emerald-400 text-xs">✅</span>
          <div>
            <span className="text-sm font-bold">5</span>
            <span className="text-xs text-gray-400 ml-1">$27,800</span>
            <span className="text-xs text-gray-500 ml-1">Pending</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 ml-6">Overdue: 9% Apr 18</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Pending Tasks</h4>
          <span className="text-xs text-gray-500">≡</span>
        </div>
        <div className="space-y-2">
          <div className="glass-card p-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              <div className="flex-1">
                <p className="text-xs font-medium">BrightWave Lot <span className="ml-2 font-bold">$15,000</span></p>
                <p className="text-[10px] text-gray-500">Due Apr 18 · 4h ago</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-aero-blue rounded-full" />
              <p className="text-xs font-medium">Feature proposal <span className="text-[10px] text-gray-500 ml-2">4h ago</span></p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">AI Insights</h4>
          <span className="text-xs text-gray-500">▼▼</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-xs">✅</span>
            <div>
              <p className="text-xs font-medium">Optimize lead responses</p>
              <p className="text-[10px] text-gray-500">Leads respond 25% faster</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
