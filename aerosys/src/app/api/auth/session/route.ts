import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { users } from '@/lib/data'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  const user = users.find(u => u.id === session.userId)
  return NextResponse.json({
    authenticated: true,
    user: user ? { id: user.id, email: user.email, name: user.name, role: user.role, company: user.company } : null,
  })
}
