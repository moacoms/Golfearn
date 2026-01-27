'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'


interface SessionData {
  id: string
  session_date: string
  session_type: string
  location_name: string | null
  data_source: string
  created_at: string
}

interface AnalysisData {
  id: string
  summary: string
  analysis_type: string
  analysis_language: string
  created_at: string
}

interface ShotData {
  id: string
  club_type: string
  ball_speed_mph: number | null
  club_speed_mph: number | null
  launch_angle: number | null
  back_spin_rpm: number | null
  carry_distance: number
  total_distance: number | null
}

export default function AnalysisResultPage() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string
  const sessionId = params.sessionId as string

  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<SessionData | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [shots, setShots] = useState<ShotData[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      try {
        // 세션 데이터
        const { data: sessionData, error: sessionError } = await supabase
          .from('swing_sessions' as any)
          .select('*')
          .eq('id', sessionId)
          .single() as { data: SessionData | null, error: unknown }

        if (sessionError) throw sessionError
        setSession(sessionData)

        // 분석 결과
        const { data: analysisData, error: analysisError } = await supabase
          .from('swing_analyses' as any)
          .select('*')
          .eq('session_id', sessionId)
          .single() as { data: AnalysisData | null, error: unknown }

        if (analysisError) throw analysisError
        setAnalysis(analysisData)

        // 샷 데이터
        const { data: shotData, error: shotError } = await supabase
          .from('shot_data' as any)
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true }) as { data: ShotData[] | null, error: unknown }

        if (shotError) throw shotError
        setShots(shotData || [])

      } catch (err) {
        console.error('Fetch error:', err)
        setError('Failed to load analysis data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sessionId])

  // 클럽별 통계
  const clubStats = shots.reduce((acc, shot) => {
    if (!acc[shot.club_type]) {
      acc[shot.club_type] = {
        count: 0,
        totalCarry: 0,
        totalBallSpeed: 0,
        ballSpeedCount: 0,
      }
    }
    acc[shot.club_type].count++
    acc[shot.club_type].totalCarry += shot.carry_distance
    if (shot.ball_speed_mph) {
      acc[shot.club_type].totalBallSpeed += shot.ball_speed_mph
      acc[shot.club_type].ballSpeedCount++
    }
    return acc
  }, {} as Record<string, { count: number; totalCarry: number; totalBallSpeed: number; ballSpeedCount: number }>)

  const clubStatsList = Object.entries(clubStats).map(([club, stats]) => ({
    club,
    avgCarry: Math.round(stats.totalCarry / stats.count),
    avgBallSpeed: stats.ballSpeedCount > 0 ? Math.round(stats.totalBallSpeed / stats.ballSpeedCount * 10) / 10 : null,
    shotCount: stats.count,
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !session || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Analysis not found'}</p>
          <Link href={`/${locale}/analysis`} className="text-green-600 hover:underline">
            {t('common.back')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Session Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(session.session_date).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {session.session_type === 'practice' ? t('analysis.new.step3.practice') :
               session.session_type === 'round' ? t('analysis.new.step3.round') :
               t('analysis.new.step3.fitting')}
            </span>
            <span>{session.data_source}</span>
            {session.location_name && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {session.location_name}
              </span>
            )}
          </div>
        </div>

        {/* Shot Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('analysis.clubs.title')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {clubStatsList.map((stat) => (
              <div key={stat.club} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{t(`clubs.${stat.club}`)}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.avgCarry} <span className="text-sm font-normal text-gray-500">yds</span></p>
                {stat.avgBallSpeed && (
                  <p className="text-sm text-gray-600">{stat.avgBallSpeed} mph</p>
                )}
                <p className="text-xs text-gray-400">{stat.shotCount} shots</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Coach Analysis</h2>
              <p className="text-sm text-gray-500">Powered by Golfearn AI</p>
            </div>
          </div>

          <div className="prose prose-green max-w-none">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3 pb-2 border-b border-gray-200">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-md font-medium text-gray-800 mt-4 mb-2">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 mb-3 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900">{children}</strong>
                ),
              }}
            >
              {analysis.summary}
            </ReactMarkdown>
          </div>
        </div>

        {/* Shot Details Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Shot Details
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase">{t('analysis.new.step4.club')}</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 uppercase">{t('shotData.carry')}</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 uppercase">{t('shotData.ballSpeed')}</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 uppercase">{t('shotData.launchAngle')}</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 uppercase">{t('shotData.spinRate')}</th>
                </tr>
              </thead>
              <tbody>
                {shots.map((shot, index) => (
                  <tr key={shot.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 text-sm text-gray-400">{index + 1}</td>
                    <td className="py-2 px-2 text-sm font-medium text-gray-900">{t(`clubs.${shot.club_type}`)}</td>
                    <td className="py-2 px-2 text-sm text-right text-gray-700">{shot.carry_distance} yds</td>
                    <td className="py-2 px-2 text-sm text-right text-gray-600">{shot.ball_speed_mph || '-'} mph</td>
                    <td className="py-2 px-2 text-sm text-right text-gray-600">{shot.launch_angle || '-'}°</td>
                    <td className="py-2 px-2 text-sm text-right text-gray-600">{shot.back_spin_rpm || '-'} rpm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/${locale}/analysis/new`}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg text-center font-medium hover:bg-green-700 transition"
          >
            {t('analysis.result.newAnalysis')}
          </Link>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'My Golf Analysis - Golfearn',
                  url: window.location.href,
                })
              } else {
                navigator.clipboard.writeText(window.location.href)
                alert('Link copied to clipboard!')
              }
            }}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg text-center font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {t('analysis.result.shareResult')}
          </button>
        </div>
      </main>
    </div>
  )
}
