import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { searchParams } = new URL(request.url)
  const folder = searchParams.get('folder') || 'inbox'
  
  const emails = await prisma.email.findMany({
    where: { folder },
    orderBy: { date: 'desc' }
  })
  
  return NextResponse.json({ 
    emails, 
    total: emails.length, 
    unread: emails.filter(e => !e.read).length 
  })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const body = await request.json()
  
  const newEmail = await prisma.email.create({
    data: {
      from: session.email,
      fromName: session.name,
      to: body.to,
      subject: body.subject,
      body: body.body,
      preview: body.preview || body.body.substring(0, 50),
      date: new Date(),
      read: true,
      starred: false,
      folder: 'sent',
    }
  })
  
  return NextResponse.json({ email: newEmail }, { status: 201 })
}