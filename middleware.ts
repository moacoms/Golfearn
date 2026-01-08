import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { searchParams, pathname } = request.nextUrl

  // 루트에 code 또는 error 파라미터가 있으면 /auth/callback으로 리다이렉트
  if (pathname === '/' && (searchParams.get('code') || searchParams.get('error'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/callback'
    // 모든 쿼리 파라미터 유지
    return NextResponse.redirect(url)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
