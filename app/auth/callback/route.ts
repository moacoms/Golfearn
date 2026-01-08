import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/'

  // URL에서 직접 에러가 전달된 경우
  if (error) {
    const errorMsg = errorCode || error
    return NextResponse.redirect(`${origin}/login?error=${errorMsg}&message=${encodeURIComponent(errorDescription || '')}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    // 코드 교환 실패 시 상세 에러 전달
    console.error('Auth callback error:', exchangeError)
    return NextResponse.redirect(`${origin}/login?error=${exchangeError.message}`)
  }

  // code가 없는 경우
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
