'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'

export default function LocaleHeader() {
  const t = useTranslations()
  const params = useParams()
  const pathname = usePathname()
  const locale = params.locale as string

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', user.id)
          .single() as { data: { full_name: string | null; username: string | null } | null, error: unknown }
        if (profile) {
          setUserName(profile.full_name || profile.username || '')
        }
      }
    }
    checkAuth()
  }, [])

  const navItems = [
    { href: `/${locale}/analysis`, label: t('nav.analysis') },
    { href: `/${locale}/pricing`, label: t('nav.pricing') },
    { href: '/community', label: locale === 'ko' ? '커뮤니티' : 'Community' },
    { href: '/market', label: locale === 'ko' ? '중고거래' : 'Market' },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <span className="text-2xl">&#x26F3;</span>
            <span className="text-xl font-bold text-gray-900">Golfearn</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition ${
                  isActive(item.href)
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {isLoggedIn ? (
              <Link href="/mypage" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {userName ? userName[0]?.toUpperCase() : 'G'}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 transition text-sm font-medium px-3 py-2"
                >
                  {t('common.signIn')}
                </Link>
                <Link
                  href={`/${locale}/analysis/new`}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
                >
                  {locale === 'ko' ? '분석 시작' : 'Start Analysis'}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(item.href)
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <div className="pt-2 border-t border-gray-100 mt-2 space-y-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-gray-600"
                >
                  {t('common.signIn')}
                </Link>
                <Link
                  href={`/${locale}/analysis/new`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium bg-green-600 text-white rounded-lg text-center"
                >
                  {locale === 'ko' ? '무료 분석 시작' : 'Start Free Analysis'}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
