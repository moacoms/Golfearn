import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { updateSession } from '@/lib/supabase/middleware'
import { locales, defaultLocale } from '@/lib/i18n/config'

// next-intl middleware 생성
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // 기본 언어는 URL에서 생략
})

export async function middleware(request: NextRequest) {
  const { searchParams, pathname } = request.nextUrl

  // API 라우트, auth 콜백, 정적 파일은 건너뛰기
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return await updateSession(request)
  }

  // 루트에 code 또는 error 파라미터가 있으면 /auth/callback으로 리다이렉트
  if (pathname === '/' && (searchParams.get('code') || searchParams.get('error'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/callback'
    return NextResponse.redirect(url)
  }

  // 기존 한국어 전용 페이지 처리 (레거시)
  const legacyKoreanPaths = ['/community', '/market', '/join', '/lesson-pro', '/practice-range', '/club-catalog', '/club-recommend']
  const isLegacyPath = legacyKoreanPaths.some(p => pathname.startsWith(p))

  if (isLegacyPath) {
    // 레거시 경로는 기존 로직 유지
    return await updateSession(request)
  }

  // 다국어 처리
  const intlResponse = intlMiddleware(request)

  // Supabase 세션 업데이트
  const sessionResponse = await updateSession(request)

  // 다국어 응답이 있으면 반환, 없으면 세션 응답 반환
  if (intlResponse) {
    return intlResponse
  }

  return sessionResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
