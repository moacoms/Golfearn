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
        // 사용자 확인
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setIsLoggedIn(false)
          setLoading(false)
          return
        }

        setIsLoggedIn(true)

        // 프로필에서 이름 가져오기
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single() as { data: { name: string } | null, error: unknown }

        if (profile?.name) {
          setUserName(profile.name)
        }

        // 최근 세션 가져오기
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

        // 이번 달 세션 수
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count: sessionsThisMonth } = await supabase
          .from('swing_sessions' as any)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('session_date', startOfMonth.toISOString().split('T')[0])

        // 드라이버 통계
        const { data: driverStats } = await supabase
          .from('club_statistics' as any)
          .select('avg_carry')
          .eq('user_id', user.id)
          .eq('club_type', 'driver')
          .single() as { data: { avg_carry: number } | null, error: unknown }

        // 목표 진행률
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

  // 샷 수 계산 함수
  const getShotCount = async (sessionId: string): Promise<number> => {
    const supabase = createClient()
    const { count } = await supabase
      .from('shot_data')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId)
    return count || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <span className="text-2xl">🏌️</span>
              <span className="text-xl font-bold text-gray-900">Golfearn</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href={`/${locale}/analysis`} className="text-green-600 font-medium">
                {t('nav.analysis')}
              </Link>
              <Link href={`/${locale}/pricing`} className="text-gray-600 hover:text-gray-900 transition">
                {t('nav.pricing')}
              </Link>
              <Link href={`/${locale}/settings`} className="text-gray-600 hover:text-gray-900 transition">
                {t('nav.settings')}
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {isLoggedIn ? (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-medium text-sm">{userName[0]?.toUpperCase()}</span>
                </div>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  {t('common.signIn')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isLoggedIn ? (
          // 비로그인 상태
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {locale === 'ko' ? 'AI 골프 분석을 시작하세요' : 'Start Your AI Golf Analysis'}
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {locale === 'ko'
                ? '론치모니터 데이터를 업로드하고 프로 레벨의 스윙 분석을 받아보세요.'
                : 'Upload your launch monitor data and get professional-level swing analysis.'}
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href={`/${locale}/login`}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
              >
                {t('common.signIn')}
              </Link>
              <Link
                href={`/${locale}/signup`}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                {t('common.signUp')}
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {t('analysis.dashboard.welcome', { name: userName })}
              </h1>
              {stats.improvement > 0 && (
                <p className="text-green-600 flex items-center gap-1 mt-1">
                  <span>📈</span> {t('analysis.dashboard.improving')}
                </p>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Driver Avg */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">{t('analysis.stats.driverAvg')}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.driverAvg !== null ? (
                    <>
                      {stats.driverAvg} <span className="text-lg font-normal text-gray-500">{t('units.yards')}</span>
                    </>
                  ) : (
                    <span className="text-lg font-normal text-gray-400">-</span>
                  )}
                </p>
                {stats.improvement > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    ↑ {stats.improvement} {t('units.yards')}
                  </p>
                )}
              </div>

              {/* This Month */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">{t('analysis.stats.thisMonth')}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.sessionsThisMonth} <span className="text-lg font-normal text-gray-500">{t('analysis.stats.sessions')}</span>
                </p>
              </div>

              {/* Goal Progress */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">{t('analysis.stats.goal')}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.goalProgress > 0 ? `${Math.round(stats.goalProgress)}%` : '-'}
                </p>
                {stats.goalProgress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${stats.goalProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            {/* New Analysis Button */}
            <Link
              href={`/${locale}/analysis/new`}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition mb-8"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('analysis.dashboard.newAnalysis')}
            </Link>

            {/* Recent Sessions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('analysis.dashboard.recentSessions')}
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                {sessions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {t('analysis.dashboard.noSessions')}
                  </div>
                ) : (
                  sessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/${locale}/analysis/${session.id}`}
                      className="block p-6 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-gray-900 font-medium">
                              {new Date(session.session_date).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {session.session_type === 'practice' ? t('analysis.new.step3.practice') :
                               session.session_type === 'round' ? t('analysis.new.step3.round') :
                               t('analysis.new.step3.fitting')}
                            </span>
                            <span className="text-gray-500 text-sm">{session.data_source}</span>
                          </div>
                        </div>
                        <div>
                          {session.analysis_status === 'completed' && (
                            <span className="text-green-600 text-sm flex items-center gap-1">
                              ✓ {locale === 'ko' ? '분석완료' : 'Analyzed'}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Club Performance */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('analysis.clubs.title')}
              </h2>

              <div className="flex gap-2 flex-wrap mb-6">
                {['driver', '3wood', '5iron', '7iron', 'pw', 'sw'].map((club) => (
                  <button
                    key={club}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700 transition text-sm font-medium"
                  >
                    {t(`clubs.${club}`)}
                  </button>
                ))}
              </div>

              {/* Chart Placeholder */}
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                📊 {locale === 'ko' ? '거리 차트 - 데이터 수집 중' : 'Distance Chart - Collecting Data'}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
