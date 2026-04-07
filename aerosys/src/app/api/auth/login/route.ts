import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createSession } from '@/lib/auth'
import { users, credentials } from '@/lib/data'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = users.find(u => u.email === email)
    const storedHash = credentials[email]

    if (!user || !storedHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // For demo: accept "admin123" or "client123" directly
    const validPasswords = ['admin123', 'client123']
    const isValid = validPasswords.includes(password) || await bcrypt.compare(password, storedHash)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await createSession(user.id, user.email, user.name, user.role)

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      redirect: user.role === 'admin' ? '/admin' : '/client',
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
