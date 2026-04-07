import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'aerosys-default-secret-change-in-production-2024'
)

const publicPaths = ['/login', '/api/auth/login', '/api/health']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (publicPaths.some(p => pathname.startsWith(p)) || pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname === '/aerosys-logo.svg') {
    return NextResponse.next()
  }

  const token = request.cookies.get('aerosys-session')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, SECRET)
    const role = payload.role as string

    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/client', request.url))
    }
    if (pathname.startsWith('/client') && role === 'admin' && !pathname.includes('preview')) {
      // Admin can access client portal for preview
    }

    const response = NextResponse.next()
    response.headers.set('x-user-role', role)
    response.headers.set('x-user-id', payload.userId as string)
    return response
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('aerosys-session')
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
