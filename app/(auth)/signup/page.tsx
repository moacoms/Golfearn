'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { signUp } from '@/lib/actions/auth'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    username: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }

    setIsLoading(true)

    try {
      // 서버 액션으로 회원가입 (PKCE 문제 해결)
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        username: formData.username,
      })

      if (result.error) {
        if (result.error.includes('already registered')) {
          setError('이미 가입된 이메일입니다.')
        } else {
          setError(result.error)
        }
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKakaoSignup = async () => {
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

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="card">
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-2xl font-bold mb-2">이메일을 확인해주세요!</h1>
            <p className="text-muted mb-6">
              <strong>{formData.email}</strong>로 확인 메일을 보냈습니다.
              <br />
              메일의 링크를 클릭하면 가입이 완료됩니다.
            </p>
            <Link href="/login" className="btn btn-primary">
              로그인 페이지로
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">회원가입</h1>
          <p className="mt-2 text-muted">
            골린이의 여정을 함께 시작해요
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Kakao Signup */}
          <button
            onClick={handleKakaoSignup}
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

          {/* Email Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="example@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                닉네임
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="input"
                placeholder="골린이"
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
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="8자 이상 입력해주세요"
                minLength={8}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium mb-1">
                비밀번호 확인
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                className="input"
                placeholder="비밀번호를 다시 입력해주세요"
                required
                disabled={isLoading}
              />
            </div>

            <div className="text-sm text-muted">
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1 rounded border-border" required />
                <span>
                  <Link href="/terms" className="text-primary hover:underline">이용약관</Link>
                  {' '}및{' '}
                  <Link href="/privacy" className="text-primary hover:underline">개인정보처리방침</Link>
                  에 동의합니다.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3"
            >
              {isLoading ? '가입 중...' : '가입하기'}
            </button>
          </form>
        </div>

        <p className="text-center text-muted">
          이미 회원이신가요?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
