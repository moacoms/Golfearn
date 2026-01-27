'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'

interface Session {
  id: string
  session_date: string
  session_type: string
  data_source: string
  analysis_status: string
  created_at: string
  swing_analyses?: { id: string; summary: string }[]
}

interface Stats {
  driverAvg: number | null
  sessionsThisMonth: number
  improvement: number
  goalProgress: number
}

export default function AnalysisDashboard() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string

  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<Stats>({
    driverAvg: null,
    sessionsThisMonth: 0,
    improvement: 0,
    goalProgress: 0,
  })
  const [userName, setUserName] = useState('Golfer')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setIsLoggedIn(false)
          setLoading(false)
          return
        }

        setIsLoggedIn(true)

        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single() as { data: { name: string } | null, error: unknown }

        if (profile?.name) {
          setUserName(profile.name)
        }

        const { data: sessionsData } = await supabase
          .from('swing_sessions' as any)
          .select(`
            *,
            swing_analyses (id, summary)
          `)
          .eq('user_id', user.id)
          .order('session_date', { ascending: false })
          .limit(5) as { data: Session[] | null, error: unknown }

        setSessions(sessionsData || [])

        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count: sessionsThisMonth } = await supabase
          .from('swing_sessions' as any)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('session_date', startOfMonth.toISOString().split('T')[0])

        const { data: driverStats } = await supabase
          .from('club_statistics' as any)
          .select('avg_carry')
          .eq('user_id', user.id)
          .eq('club_type', 'driver')
          .single() as { data: { avg_carry: number } | null, error: unknown }

        const { data: goals } = await supabase
          .from('swing_goals' as any)
          .select('progress_percentage')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .limit(1) as { data: { progress_percentage: number }[] | null, error: unknown }

        setStats({
          driverAvg: driverStats?.avg_carry ? Math.round(driverStats.avg_carry) : null,
          sessionsThisMonth: sessionsThisMonth || 0,
          improvement: 0,
          goalProgress: goals?.[0]?.progress_percentage || 0,
        })

      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-green-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500 text-sm">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="3" />
                  <path d="M12 8c-1 0-2 .5-2.5 1.5L7 16h3l1 6h2l1-6h3l-2.5-6.5C14 8.5 13 8 12 8z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Golfearn</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href={`/${locale}/analysis`} className="text-green-600 font-semibold border-b-2 border-green-600 pb-1">
                {t('nav.analysis')}
              </Link>
              <Link href={`/${locale}/pricing`} className="text-gray-500 hover:text-gray-900 transition">
                {t('nav.pricing')}
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              {isLoggedIn ? (
                <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-semibold text-sm">{userName[0]?.toUpperCase()}</span>
                </div>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
                >
                  {t('common.signIn')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isLoggedIn ? (
          /* ===== 비로그인: 히어로 섹션 ===== */
          <div className="py-12">
            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 rounded-3xl p-8 sm:p-12 mb-12 shadow-xl">
              {/* Golf Pattern Background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-8 right-12 w-32 h-32 rounded-full border-4 border-white"></div>
                <div className="absolute bottom-8 left-8 w-20 h-20 rounded-full border-2 border-white"></div>
                <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-white rounded-full"></div>
                <svg className="absolute bottom-12 right-16 w-48 h-48 text-white opacity-20" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                  <path d="M50 10 Q60 30 50 50 Q40 70 50 90" />
                  <path d="M30 50 Q50 40 70 50 Q50 60 30 50" />
                </svg>
              </div>

              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-green-100 text-sm mb-6">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {locale === 'ko' ? 'AI 기반 골프 분석' : 'AI-Powered Golf Analysis'}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {locale === 'ko'
                    ? <>나만의 AI 골프 코치와<br />함께 성장하세요</>
                    : <>Grow Your Game<br />with AI Coaching</>}
                </h1>

                <p className="text-green-100 text-lg mb-8 leading-relaxed max-w-lg">
                  {locale === 'ko'
                    ? '론치모니터 데이터를 입력하면 프로 레벨의 스윙 분석과 맞춤 드릴을 제공합니다.'
                    : 'Upload your launch monitor data and get professional-level swing analysis with custom drills.'}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/${locale}/login`}
                    className="inline-flex items-center justify-center gap-2 bg-white text-green-700 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {locale === 'ko' ? '무료로 시작하기' : 'Start Free'}
                  </Link>
                  <Link
                    href={`/${locale}/pricing`}
                    className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition border border-white/20"
                  >
                    {locale === 'ko' ? '요금제 보기' : 'View Plans'}
                  </Link>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {locale === 'ko' ? '데이터 기반 분석' : 'Data-Driven Analysis'}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {locale === 'ko'
                    ? '볼 스피드, 런치앵글, 스핀량 등 모든 데이터를 AI가 종합 분석합니다.'
                    : 'AI analyzes ball speed, launch angle, spin rate and all your metrics.'}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {locale === 'ko' ? '맞춤 드릴 추천' : 'Custom Drill Recommendations'}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {locale === 'ko'
                    ? '문제점을 정확히 파악하고 개선을 위한 구체적인 연습 방법을 제시합니다.'
                    : 'Identifies issues and provides specific practice drills for improvement.'}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {locale === 'ko' ? '성장 추적' : 'Progress Tracking'}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {locale === 'ko'
                    ? '세션별 변화를 추적하고 목표 달성까지의 여정을 함께합니다.'
                    : 'Track your changes across sessions and follow your journey to your goals.'}
                </p>
              </div>
            </div>

            {/* Supported Monitors */}
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">
                {locale === 'ko' ? '지원하는 론치모니터' : 'Supported Launch Monitors'}
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm font-medium">
                <span className="px-4 py-2 bg-white rounded-lg border border-gray-100">TrackMan</span>
                <span className="px-4 py-2 bg-white rounded-lg border border-gray-100">GolfZon</span>
                <span className="px-4 py-2 bg-white rounded-lg border border-gray-100">FlightScope</span>
                <span className="px-4 py-2 bg-white rounded-lg border border-gray-100">GCQuad</span>
                <span className="px-4 py-2 bg-white rounded-lg border border-gray-100">Kakao VX</span>
                <span className="px-4 py-2 bg-white rounded-lg border border-gray-100">GDR</span>
              </div>
            </div>
          </div>
        ) : (
          /* ===== 로그인: 대시보드 ===== */
          <>
            {/* Welcome + CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('analysis.dashboard.welcome', { name: userName })}
                </h1>
                <p className="text-gray-500 mt-1">
                  {locale === 'ko' ? '오늘도 좋은 연습 되세요!' : 'Have a great practice today!'}
                </p>
              </div>
              <Link
                href={`/${locale}/analysis/new`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition shadow-md shadow-green-200 self-start"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('analysis.dashboard.newAnalysis')}
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Driver Avg */}
              <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500">{t('analysis.stats.driverAvg')}</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.driverAvg !== null ? (
                      <>
                        {stats.driverAvg} <span className="text-base font-normal text-gray-400">{t('units.yards')}</span>
                      </>
                    ) : (
                      <span className="text-lg font-normal text-gray-300">{locale === 'ko' ? '데이터 없음' : 'No data'}</span>
                    )}
                  </p>
                  {stats.improvement > 0 && (
                    <p className="text-sm text-green-600 mt-2 font-medium">
                      +{stats.improvement} {t('units.yards')}
                    </p>
                  )}
                </div>
              </div>

              {/* This Month */}
              <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500">{t('analysis.stats.thisMonth')}</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.sessionsThisMonth} <span className="text-base font-normal text-gray-400">{t('analysis.stats.sessions')}</span>
                  </p>
                </div>
              </div>

              {/* Goal Progress */}
              <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500">{t('analysis.stats.goal')}</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.goalProgress > 0 ? `${Math.round(stats.goalProgress)}%` : <span className="text-lg font-normal text-gray-300">{locale === 'ko' ? '목표 미설정' : 'No goal'}</span>}
                  </p>
                  {stats.goalProgress > 0 && (
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${stats.goalProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">
                  {t('analysis.dashboard.recentSessions')}
                </h2>
                {sessions.length > 0 && (
                  <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                    {locale === 'ko' ? `최근 ${sessions.length}개` : `Last ${sessions.length}`}
                  </span>
                )}
              </div>

              <div className="divide-y divide-gray-50">
                {sessions.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-400 mb-4">{t('analysis.dashboard.noSessions')}</p>
                    <Link
                      href={`/${locale}/analysis/new`}
                      className="inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {locale === 'ko' ? '첫 분석 시작하기' : 'Start Your First Analysis'}
                    </Link>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/${locale}/analysis/${session.id}`}
                      className="flex items-center justify-between p-5 hover:bg-green-50/50 transition group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-gray-900 font-medium">
                              {new Date(session.session_date).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                              session.session_type === 'practice'
                                ? 'bg-blue-50 text-blue-600'
                                : session.session_type === 'round'
                                ? 'bg-green-50 text-green-600'
                                : 'bg-purple-50 text-purple-600'
                            }`}>
                              {session.session_type === 'practice' ? t('analysis.new.step3.practice') :
                               session.session_type === 'round' ? t('analysis.new.step3.round') :
                               t('analysis.new.step3.fitting')}
                            </span>
                          </div>
                          <span className="text-gray-400 text-sm">{session.data_source}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.analysis_status === 'completed' && (
                          <span className="text-green-600 text-sm font-medium flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {locale === 'ko' ? '분석완료' : 'Analyzed'}
                          </span>
                        )}
                        <svg className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Club Performance */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {t('analysis.clubs.title')}
              </h2>

              <div className="flex gap-2 flex-wrap mb-6">
                {['driver', '3wood', '5iron', '7iron', 'pw', 'sw'].map((club) => (
                  <button
                    key={club}
                    className="px-4 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700 transition text-sm font-medium border border-gray-100 hover:border-green-200"
                  >
                    {t(`clubs.${club}`)}
                  </button>
                ))}
              </div>

              <div className="h-64 bg-gradient-to-br from-gray-50 to-green-50/30 rounded-xl flex flex-col items-center justify-center border border-dashed border-gray-200">
                <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-400 text-sm">{locale === 'ko' ? '분석 데이터가 쌓이면 차트가 표시됩니다' : 'Charts will appear as you add analysis data'}</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
