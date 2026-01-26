'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'

export default function AnalysisDashboard() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string

  // TODO: 실제 데이터는 DB에서 가져오기
  const mockStats = {
    driverAvg: 245,
    driverImprovement: 8,
    monthSessions: 12,
    monthDiff: 3,
    goalProgress: 58,
  }

  const mockSessions = [
    {
      id: '1',
      date: '2026-01-25',
      type: 'practice',
      source: 'TrackMan',
      shots: 45,
      driverAvg: 248,
      analyzed: true,
    },
    {
      id: '2',
      date: '2026-01-22',
      type: 'round',
      source: 'GolfZon',
      shots: 32,
      driverAvg: 241,
      analyzed: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <span className="text-2xl">⛳</span>
              <span className="text-xl font-bold text-gray-900">Golfearn</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href={`/${locale}/analysis`} className="text-green-600 font-medium">
                {t('nav.analysis')}
              </Link>
              <Link href={`/${locale}/analysis/history`} className="text-gray-600 hover:text-gray-900 transition">
                History
              </Link>
              <Link href={`/${locale}/settings`} className="text-gray-600 hover:text-gray-900 transition">
                {t('nav.settings')}
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-medium text-sm">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('analysis.dashboard.welcome', { name: 'David' })}
          </h1>
          <p className="text-green-600 flex items-center gap-1 mt-1">
            <span>📈</span> {t('analysis.dashboard.improving')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Driver Avg */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">{t('analysis.stats.driverAvg')}</p>
            <p className="text-3xl font-bold text-gray-900">
              {mockStats.driverAvg} <span className="text-lg font-normal text-gray-500">{t('units.yards')}</span>
            </p>
            <p className="text-sm text-green-600 mt-2">
              ↑ {mockStats.driverImprovement} {t('units.yards')}
            </p>
          </div>

          {/* This Month */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">{t('analysis.stats.thisMonth')}</p>
            <p className="text-3xl font-bold text-gray-900">
              {mockStats.monthSessions} <span className="text-lg font-normal text-gray-500">{t('analysis.stats.sessions')}</span>
            </p>
            <p className="text-sm text-green-600 mt-2">
              ↑ {mockStats.monthDiff} vs last month
            </p>
          </div>

          {/* Goal Progress */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">{t('analysis.stats.goal')}</p>
            <p className="text-3xl font-bold text-gray-900">{mockStats.goalProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${mockStats.goalProgress}%` }}
              ></div>
            </div>
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
            <Link href={`/${locale}/analysis/history`} className="text-green-600 text-sm hover:underline">
              {t('analysis.dashboard.viewAll')}
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {mockSessions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {t('analysis.dashboard.noSessions')}
              </div>
            ) : (
              mockSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/${locale}/analysis/${session.id}`}
                  className="block p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-gray-900 font-medium">{session.date}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {session.type === 'practice' ? t('analysis.new.step3.practice') : t('analysis.new.step3.round')}
                        </span>
                        <span className="text-gray-500 text-sm">{session.source}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {session.shots} shots • Driver avg: {session.driverAvg} {t('units.yards')}
                      </p>
                    </div>
                    <div>
                      {session.analyzed && (
                        <span className="text-green-600 text-sm flex items-center gap-1">
                          ✓ Analyzed
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
            {['Driver', '3Wood', '5Iron', '7Iron', 'PW', 'SW'].map((club) => (
              <button
                key={club}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700 transition text-sm font-medium"
              >
                {club}
              </button>
            ))}
          </div>

          {/* Mock Chart Placeholder */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            📊 Distance Chart - Coming Soon
          </div>
        </div>
      </main>
    </div>
  )
}
