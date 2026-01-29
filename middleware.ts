import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { updateSession } from '@/lib/supabase/middleware'
import { locales, defaultLocale } from '@/lib/i18n/config'

// next-intl middleware 생성
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // 항상 언어 접두사 표시
  localeDetection: true, // 브라우저 언어 자동 감지
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
  const legacyPaths = [
    '/community', '/market', '/join', '/lesson-pro', '/practice-range',
    '/club-catalog', '/club-recommend', '/mypage', '/guide', '/golf-courses',
    '/admin', '/login', '/signup',
  ]

  // 직접 레거시 경로 접근 (예: /mypage)
  const isLegacyPath = legacyPaths.some(p => pathname.startsWith(p))
  if (isLegacyPath) {
    return await updateSession(request)
  }

  // locale prefix가 붙은 레거시 경로 리다이렉트 (예: /ko/mypage → /mypage)
  const localePrefix = locales.find(l => pathname.startsWith(`/${l}/`))
  if (localePrefix) {
    const pathWithoutLocale = pathname.slice(`/${localePrefix}`.length)
    const isLocalePrefixedLegacy = legacyPaths.some(p => pathWithoutLocale.startsWith(p))
    if (isLocalePrefixedLegacy) {
      const url = request.nextUrl.clone()
      url.pathname = pathWithoutLocale
      return NextResponse.redirect(url)
    }
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
