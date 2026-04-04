import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/studio')) {
    const allowedEmails = ['amoghsuman@gmail.com']
    const authHeader = request.cookies.get('studio-access')

    if (!authHeader || !allowedEmails.includes(authHeader.value)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}