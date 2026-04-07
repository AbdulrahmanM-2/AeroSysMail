import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const transfers = await prisma.domainTransfer.findMany({
    orderBy: { initiatedAt: 'desc' }
  })
  
  return NextResponse.json({ transfers })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  const newTransfer = await prisma.domainTransfer.create({
    data: {
      domainName: body.domainName,
      fromRegistrar: body.fromRegistrar,
      toRegistrar: 'AeroSys',
      status: 'pending',
      authCode: body.authCode,
      clientId: 'c1', // Default for demo
      clientName: 'Admin User' // Default for demo
    }
  })
  
  return NextResponse.json({ message: 'Transfer initiated', transfer: newTransfer })
}