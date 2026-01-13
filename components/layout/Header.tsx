'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // 현재 사용자 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // 인증 상태 변화 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navItems = [
    { href: '/guide', label: '입문 가이드' },
    { href: '/community', label: '커뮤니티' },
    { href: '/market', label: '중고거래' },
    { href: '/join', label: '조인 매칭' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <nav className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary">
          Golfearn
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="text-muted text-sm">...</div>
          ) : user ? (
            <>
              <Link href="/mypage" className="text-muted hover:text-foreground transition-colors">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}님
              </Link>
              <button onClick={handleSignOut} className="btn btn-outline">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline">
                로그인
              </Link>
              <Link href="/signup" className="btn btn-primary">
                회원가입
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="메뉴 열기"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-border">
          <div className="container py-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-muted hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-4 border-t border-border">
              {user ? (
                <>
                  <Link href="/mypage" className="btn btn-outline flex-1" onClick={() => setIsMenuOpen(false)}>
                    마이페이지
                  </Link>
                  <button onClick={handleSignOut} className="btn btn-primary flex-1">
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-outline flex-1">
                    로그인
                  </Link>
                  <Link href="/signup" className="btn btn-primary flex-1">
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
