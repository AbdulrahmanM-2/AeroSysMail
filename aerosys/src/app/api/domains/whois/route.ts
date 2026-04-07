import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const domainId = searchParams.get('domainId')
  
  if (!domainId) {
    return NextResponse.json({ error: 'Domain ID required' }, { status: 400 })
  }

  const whois = await prisma.wHOISInfo.findUnique({
    where: { domainId }
  })
  
  return NextResponse.json({ whois })
}