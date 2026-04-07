import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { deals, invoices, clients, emails, revenueData } from '@/lib/data'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const closedDeals = deals.filter(d => d.stage === 'closed')
  return NextResponse.json({
    revenue: {
      monthly: revenueData,
      total: revenueData.reduce((s, r) => s + r.revenue, 0),
      current: revenueData[revenueData.length - 1].revenue,
      growth: 12,
    },
    deals: {
      total: deals.length,
      active: deals.filter(d => d.stage !== 'closed').length,
      closingRate: Math.round((closedDeals.length / deals.length) * 100),
      pipeline: deals.filter(d => d.stage !== 'closed').reduce((s, d) => s + d.value, 0),
    },
    invoices: {
      total: invoices.length,
      pending: invoices.filter(i => i.status === 'pending').length,
      pendingAmount: invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0),
      overdueAmount: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0),
    },
    clients: {
      total: clients.length,
      active: clients.filter(c => c.status === 'active').length,
    },
    emailStats: {
      sent: emails.filter(e => e.folder === 'sent').length,
      received: emails.filter(e => e.folder === 'inbox').length,
      unread: emails.filter(e => !e.read).length,
    },
  })
}
