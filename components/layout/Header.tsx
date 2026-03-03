'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isGolfInfoOpen, setIsGolfInfoOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLessonPro, setIsLessonPro] = useState(false)
  const [isStudent, setIsStudent] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    // 현재 사용자 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)

      // 읽지 않은 알림 수 조회 및 관리자 확인
      if (user) {
        supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false)
          .then(({ count }) => {
            setUnreadCount(count || 0)
          })

        // 관리자 권한, 레슨 프로, 학생 확인
        supabase
          .from('profiles')
          .select('is_admin, is_lesson_pro, is_student')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            const profileData = data as { is_admin?: boolean; is_lesson_pro?: boolean; is_student?: boolean } | null
            setIsAdmin(profileData?.is_admin === true)
            setIsLessonPro(profileData?.is_lesson_pro === true)
            setIsStudent(profileData?.is_student === true)
          })
      }
    })

    // 인증 상태 변화 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setUnreadCount(0)
        setIsAdmin(false)
        setIsLessonPro(false)
        setIsStudent(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsGolfInfoOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // 메인 메뉴 (핵심 기능)
  const mainNavItems = [
    { href: '/club-recommend', label: '클럽 추천' },
    { href: '/market', label: '중고거래' },
    { href: '/join', label: '조인' },
    { href: '/community', label: '커뮤니티' },
  ]

  // 골프 정보 드롭다운 메뉴
  const golfInfoItems = [
    { href: '/practice-range', label: '연습장', icon: '📍' },
    { href: '/golf-courses', label: '골프장', icon: '⛳' },
    { href: '/lesson-pro', label: '레슨프로', icon: '👨‍🏫' },
    { href: '/guide', label: '입문 가이드', icon: '📖' },
    { href: '/club-catalog', label: '클럽 카탈로그', icon: '🏌️' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <nav className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary">
          Golfearn
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted hover:text-foreground transition-colors font-medium"
            >
              {item.label}
            </Link>
          ))}

          {/* 골프 정보 드롭다운 */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsGolfInfoOpen(!isGolfInfoOpen)}
              className="flex items-center gap-1 text-muted hover:text-foreground transition-colors font-medium"
            >
              골프 정보
              <svg
                className={`w-4 h-4 transition-transform ${isGolfInfoOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isGolfInfoOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border py-2 z-50">
                {golfInfoItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2.5 text-muted hover:text-foreground hover:bg-gray-50 transition-colors"
                    onClick={() => setIsGolfInfoOpen(false)}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
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
              <div className="flex items-center gap-2">
                <Link href="/mypage" className="text-muted hover:text-foreground transition-colors">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}님
                </Link>
                {isStudent && (
                  <Link
                    href="/student"
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    내 레슨
                  </Link>
                )}
                {isLessonPro && (
                  <Link
                    href="/pro/dashboard"
                    className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium hover:bg-emerald-200 transition-colors"
                  >
                    프로 CRM
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="p-1 text-gray-500 hover:text-primary transition-colors"
                    title="관리자 페이지"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Link>
                )}
              </div>
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
          <div className="container py-4 space-y-1">
            {/* 메인 메뉴 */}
            <div className="pb-3 border-b border-border">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 px-2">주요 기능</p>
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-2 py-2.5 text-foreground hover:bg-gray-50 rounded-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* 프로 등록 섹션 - 로그인했지만 프로가 아닌 경우 */}
            {user && !isLessonPro && (
              <div className="py-3 border-b border-border">
                <Link
                  href="/pro-register"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>레슨 프로로 등록하기</span>
                </Link>
              </div>
            )}

            {/* 골프 정보 */}
            <div className="py-3 border-b border-border">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 px-2">골프 정보</p>
              {golfInfoItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-2 py-2.5 text-muted hover:text-foreground hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* 인증 영역 */}
            <div className="pt-3 space-y-3">
              {user ? (
                <>
                  <Link
                    href="/mypage/notifications"
                    className="flex items-center justify-between px-2 py-2.5 text-muted hover:text-foreground hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>알림</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  {isStudent && (
                    <Link
                      href="/student"
                      className="flex items-center gap-2 px-2 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>내 레슨</span>
                    </Link>
                  )}
                  {isLessonPro && (
                    <Link
                      href="/pro/dashboard"
                      className="flex items-center gap-2 px-2 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <span>프로 CRM</span>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-2 py-2.5 text-muted hover:text-foreground hover:bg-gray-50 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>관리자</span>
                    </Link>
                  )}
                  <div className="flex gap-3 pt-2">
                    <Link href="/mypage" className="btn btn-outline flex-1" onClick={() => setIsMenuOpen(false)}>
                      마이페이지
                    </Link>
                    <button onClick={handleSignOut} className="btn btn-primary flex-1">
                      로그아웃
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login" className="btn btn-outline flex-1" onClick={() => setIsMenuOpen(false)}>
                    로그인
                  </Link>
                  <Link href="/signup" className="btn btn-primary flex-1" onClick={() => setIsMenuOpen(false)}>
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
