'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { getSessions, getClubStatistics } from '@/lib/actions/golf-analysis'

const ClubDistanceChart = dynamic(
  () => import('@/components/analysis/ClubDistanceChart'),
  { ssr: false, loading: () => <div className="h-72 bg-gray-50 rounded-xl animate-pulse" /> }
)
const ProgressChart = dynamic(
  () => import('@/components/analysis/ProgressChart'),
  { ssr: false, loading: () => <div className="h-72 bg-gray-50 rounded-xl animate-pulse" /> }
)

type SessionFilter = 'all' | 'practice' | 'round' | 'fitting'
type ChartMetric = 'carry' | 'ballSpeed' | 'spinRate'

interface Session {
  id: string
  session_date: string
  session_type: string
  data_source: string
  location?: string
  notes?: string
  shot_data?: Array<{
    club_type: string
    carry: number
    ball_speed?: number
    spin_rate?: number
  }>
  swing_analyses?: Array<{
    id: string
    summary?: string
    analysis_type: string
  }>
}

interface ClubStat {
  club_type: string
  avg_carry: number
  avg_total: number
  avg_ball_speed: number
  avg_spin_rate: number
  total_shots: number
}

export default function HistoryPage() {
  const t = useTranslations()
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string

  const [sessions, setSessions] = useState<Session[]>([])
  const [clubStats, setClubStats] = useState<ClubStat[]>([])
  const [filter, setFilter] = useState<SessionFilter>('all')
  const [chartMetric, setChartMetric] = useState<ChartMetric>('carry')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'sessions' | 'charts'>('sessions')

  useEffect(() => {
    async function loadData() {
      try {
        const [sessionsRes, statsRes] = await Promise.all([
          getSessions(50, 0),
          getClubStatistics(),
        ])
        setSessions((sessionsRes.sessions || []) as Session[])
        setClubStats((statsRes.statistics || []) as ClubStat[])
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredSessions = filter === 'all'
    ? sessions
    : sessions.filter((s) => s.session_type === filter)

  const filters: { value: SessionFilter; label: string }[] = [
    { value: 'all', label: t('analysis.history.filter.all') },
    { value: 'practice', label: t('analysis.history.filter.practice') },
    { value: 'round', label: t('analysis.history.filter.round') },
  ]

  const metrics: { value: ChartMetric; label: string }[] = [
    { value: 'carry', label: locale === 'ko' ? '캐리 거리' : 'Carry Distance' },
    { value: 'ballSpeed', label: locale === 'ko' ? '볼스피드' : 'Ball Speed' },
    { value: 'spinRate', label: locale === 'ko' ? '스핀량' : 'Spin Rate' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-72 bg-gray-200 rounded-xl" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('analysis.history.title')}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {locale === 'ko'
                ? `총 ${sessions.length}개 세션`
                : `${sessions.length} total sessions`}
            </p>
          </div>
          <Link
            href={`/${locale}/analysis/new`}
            className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('analysis.dashboard.newAnalysis')}
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'sessions'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {locale === 'ko' ? '세션 목록' : 'Sessions'}
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'charts'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {locale === 'ko' ? '차트 분석' : 'Charts'}
          </button>
        </div>

        {activeTab === 'charts' && (
          <div className="space-y-6 mb-8">
            {/* Club Distance Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {locale === 'ko' ? '클럽별 평균 거리' : 'Average Distance by Club'}
              </h3>
              <ClubDistanceChart statistics={clubStats} locale={locale} />
            </div>

            {/* Progress Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {locale === 'ko' ? '드라이버 발전 추이' : 'Driver Progress'}
                </h3>
                <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                  {metrics.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setChartMetric(m.value)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                        chartMetric === m.value
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <ProgressChart
                sessions={sessions as any}
                metric={chartMetric}
                clubFilter="driver"
                locale={locale}
              />
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <>
            {/* Filter */}
            <div className="flex gap-2 mb-6">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === f.value
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Session List */}
            {filteredSessions.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-gray-500 mb-4">{t('analysis.history.empty')}</p>
                <Link
                  href={`/${locale}/analysis/new`}
                  className="inline-flex items-center text-green-600 font-medium text-sm hover:text-green-700"
                >
                  {t('analysis.dashboard.newAnalysis')}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSessions.map((session) => {
                  const hasAnalysis = session.swing_analyses && session.swing_analyses.length > 0
                  const date = new Date(session.session_date)
                  const dateStr = date.toLocaleDateString(
                    locale === 'ko' ? 'ko-KR' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )
                  const typeLabels: Record<string, Record<string, string>> = {
                    practice: { en: 'Practice', ko: '연습' },
                    round: { en: 'Round', ko: '라운드' },
                    fitting: { en: 'Fitting', ko: '피팅' },
                  }
                  const typeLabel = typeLabels[session.session_type]?.[locale] || session.session_type
                  const typeColors: Record<string, string> = {
                    practice: 'bg-blue-100 text-blue-700',
                    round: 'bg-green-100 text-green-700',
                    fitting: 'bg-purple-100 text-purple-700',
                  }

                  return (
                    <button
                      key={session.id}
                      onClick={() => router.push(`/${locale}/analysis/${session.id}`)}
                      className="w-full bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-green-50 transition-colors">
                            <span className="text-lg">
                              {session.session_type === 'round' ? '⛳' : '🏌️'}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 text-sm">{dateStr}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[session.session_type] || 'bg-gray-100 text-gray-600'}`}>
                                {typeLabel}
                              </span>
                              {hasAnalysis && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                  AI
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              {session.location && (
                                <span className="text-xs text-gray-400">{session.location}</span>
                              )}
                              <span className="text-xs text-gray-400">
                                {session.data_source}
                              </span>
                            </div>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
