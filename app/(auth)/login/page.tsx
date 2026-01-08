'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// 에러 코드를 한글 메시지로 변환
function getErrorMessage(errorCode: string | null): string | null {
  if (!errorCode) return null

  const errorMessages: Record<string, string> = {
    'otp_expired': '인증 링크가 만료되었습니다. 다시 회원가입해주세요.',
    'access_denied': '접근이 거부되었습니다.',
    'auth_callback_error': '인증 처리 중 오류가 발생했습니다.',
    'no_code': '인증 코드가 없습니다.',
    'invalid_request': '잘못된 요청입니다.',
  }

  return errorMessages[errorCode] || errorCode
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // URL에서 에러 파라미터 확인
  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) {
      setError(getErrorMessage(urlError))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message === 'Invalid login credentials') {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.')
        } else if (error.message === 'Email not confirmed') {
          setError('이메일 인증이 필요합니다. 받은 메일함을 확인해주세요.')
        } else {
          setError(error.message)
        }
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKakaoLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError('카카오 로그인 중 오류가 발생했습니다.')
        setIsLoading(false)
      }
    } catch (err) {
      setError('카카오 로그인 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">로그인</h1>
          <p className="mt-2 text-muted">
            Golfearn에 오신 것을 환영합니다
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Kakao Login */}
          <button
            onClick={handleKakaoLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-[#191919] font-medium py-3 rounded-lg hover:bg-[#FDD835] transition-colors disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 3C5.58172 3 2 5.94043 2 9.57143C2 11.8816 3.46842 13.9012 5.65579 15.0434L4.83579 18.2571C4.76994 18.513 5.06352 18.7202 5.28807 18.5732L9.04678 16.1104C9.36068 16.1369 9.67832 16.1429 10 16.1429C14.4183 16.1429 18 13.2024 18 9.57143C18 5.94043 14.4183 3 10 3Z" fill="#191919"/>
            </svg>
            카카오로 시작하기
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-muted">또는</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="example@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-muted">로그인 상태 유지</span>
              </label>
              <Link href="/forgot-password" className="text-primary hover:underline">
                비밀번호 찾기
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>

        <p className="text-center text-muted">
          아직 회원이 아니신가요?{' '}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-muted">로딩 중...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
