import { NextRequest, NextResponse } from 'next/server'
import { domainPricing, domains } from '@/lib/domainData'
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''
  const name = query.replace(/\..+$/, '').toLowerCase().replace(/[^a-z0-9-]/g, '')
  if (!name) return NextResponse.json({ results: [] })
  const results = domainPricing.map(p => ({ domain: name + p.tld, available: !domains.some(d => d.name === name + p.tld), premium: p.premium, price: p.registerPrice, renewalPrice: p.renewalPrice }))
  return NextResponse.json({ results: results.sort((a, b) => (a.available === b.available ? a.price - b.price : a.available ? -1 : 1)) })
}
