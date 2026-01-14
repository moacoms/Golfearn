'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    // 현재 사용자 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)

      // 읽지 않은 알림 수 조회
      if (user) {
        supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false)
          .then(({ count }) => {
            setUnreadCount(count || 0)
          })
      }
    })

    // 인증 상태 변화 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setUnreadCount(0)
      }
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
              {/* 알림 아이콘 */}
              <Link
                href="/mypage/notifications"
                className="relative p-2 text-muted hover:text-foreground transition-colors"
                aria-label="알림"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
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
            <div className="flex flex-col gap-3 pt-4 border-t border-border">
              {user ? (
                <>
                  <Link
                    href="/mypage/notifications"
                    className="flex items-center justify-between text-muted hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>알림</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <div className="flex gap-3">
                    <Link href="/mypage" className="btn btn-outline flex-1" onClick={() => setIsMenuOpen(false)}>
                      마이페이지
                    </Link>
                    <button onClick={handleSignOut} className="btn btn-primary flex-1">
                      로그아웃
                    </button>
                  </div>
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
