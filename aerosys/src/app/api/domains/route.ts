import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  
  const where: any = {}
  if (status && status !== 'all') where.status = status
  if (search) where.name = { contains: search }

  const domains = await prisma.domain.findMany({
    where,
    orderBy: { name: 'asc' }
  })

  const allDomains = await prisma.domain.findMany()
  
  const stats = { 
    total: allDomains.length, 
    active: allDomains.filter(d => d.status === 'active').length, 
    pending: allDomains.filter(d => d.status === 'pending').length, 
    expired: allDomains.filter(d => d.status === 'expired').length, 
    transferring: allDomains.filter(d => d.status === 'transferring').length 
  }
  
  return NextResponse.json({ domains, stats })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  const newDomain = await prisma.domain.create({
    data: {
      name: body.name,
      tld: body.name.substring(body.name.lastIndexOf('.')),
      registrant: body.registrant,
      registrantEmail: body.registrantEmail || 'admin@aerosys.aero',
      status: 'active',
      registeredAt: new Date(),
      expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      autoRenew: true,
      locked: true,
      whoisPrivacy: true,
      nameservers: JSON.stringify(['ns1.aerosys.aero', 'ns2.aerosys.aero']),
      price: 12.99,
      renewalPrice: 14.99
    }
  })
  
  return NextResponse.json({ message: 'Domain registered', domain: newDomain })
}