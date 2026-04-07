import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const deals = await prisma.deal.findMany()
  
  return NextResponse.json({ deals, stats: {
    total: deals.length,
    totalValue: deals.reduce((s, d) => s + d.value, 0),
    byStage: {
      new_lead: deals.filter(d => d.stage === 'new_lead').length,
      negotiation: deals.filter(d => d.stage === 'negotiation').length,
      awaiting_signature: deals.filter(d => d.stage === 'awaiting_signature').length,
      closed: deals.filter(d => d.stage === 'closed').length,
    }
  }})
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  
  const body = await request.json()
  const newDeal = await prisma.deal.create({
    data: {
      name: body.name,
      company: body.company,
      value: body.value,
      stage: body.stage || 'new_lead',
      assignedTo: body.assignedTo,
      probability: body.probability || 0,
    }
  })
  
  return NextResponse.json({ deal: newDeal }, { status: 201 })
}