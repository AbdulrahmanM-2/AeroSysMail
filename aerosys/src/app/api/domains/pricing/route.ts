import { NextRequest, NextResponse } from 'next/server'
import { domainPricing } from '@/lib/domainData'
export async function GET(req: NextRequest) {
  const category = new URL(req.url).searchParams.get('category')
  const pricing = category ? domainPricing.filter(p => p.category === category) : domainPricing
  return NextResponse.json({ pricing, categories: Array.from(new Set(domainPricing.map(p => p.category))) })
}
