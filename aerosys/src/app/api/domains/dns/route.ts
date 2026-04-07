import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const domainId = searchParams.get('domainId')
  
  if (!domainId) {
    return NextResponse.json({ error: 'Domain ID required' }, { status: 400 })
  }

  const records = await prisma.dNSRecord.findMany({
    where: { domainId }
  })
  
  return NextResponse.json({ records })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  const newRecord = await prisma.dNSRecord.create({
    data: {
      domainId: body.domainId,
      type: body.type,
      name: body.name,
      value: body.value,
      ttl: body.ttl || 3600,
      priority: body.priority,
      weight: body.weight,
      port: body.port
    }
  })
  
  return NextResponse.json({ message: 'DNS record added', record: newRecord })
}