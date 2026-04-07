import StatCard from '@/components/StatCard'
import DealPipeline from '@/components/DealPipeline'
import RevenueChart from '@/components/RevenueChart'
import ApprovalQueue from '@/components/ApprovalQueue'
import AIInsights from '@/components/AIInsights'
import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  // Fetch data dynamically from the database
  const deals = await prisma.deal.findMany()
  const revenueData = await prisma.revenueData.findMany()
  const aiInsights = await prisma.aIInsight.findMany({
    orderBy: { timestamp: 'desc' }
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span>Business Autopilot</span>
          </h1>
          <p className="text-sm text-gray-500">Your AI-Powered Business Operator</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Monthly Revenue" value="$1,845,200" change="+18.4%" positive icon="💰" />
        <StatCard title="Active Deals" value="142" subtitle="38 Closing Soon" icon="🤝" />
        <StatCard title="Outstanding Invoices" value="47" subtitle="$312,450 Pending" icon="📄" />
        <StatCard title="AI Actions Today" value="1,284" subtitle="842 Emails Sent" icon="🤖" />
      </div>

      <DealPipeline deals={deals as any} />

      <div className="grid grid-cols-2 gap-4">
        <AIInsights insights={aiInsights as any} />
        <RevenueChart data={revenueData} currentRevenue={8452100} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          {/* Additional content area */}
        </div>
        <ApprovalQueue />
      </div>
    </div>
  )
}