'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'

type DataSource = 'photo' | 'manual' | 'api'
type LaunchMonitor = 'trackman' | 'golfzon' | 'gdr' | 'kakao' | 'flightscope' | 'other'
type SessionType = 'practice' | 'round' | 'fitting'
type ClubType = 'driver' | '3wood' | '5wood' | 'hybrid' | '5iron' | '6iron' | '7iron' | '8iron' | '9iron' | 'pw' | 'gw' | 'sw' | 'lw'

interface ShotData {
  id: string
  clubType: ClubType
  ballSpeed?: number
  clubSpeed?: number
  launchAngle?: number
  spinRate?: number
  carry?: number
  total?: number
}

export default function NewAnalysisPage() {
  const t = useTranslations()
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string

  const [step, setStep] = useState(1)
  const [dataSource, setDataSource] = useState<DataSource | null>(null)
  const [launchMonitor, setLaunchMonitor] = useState<LaunchMonitor | null>(null)
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [sessionType, setSessionType] = useState<SessionType>('practice')
  const [location, setLocation] = useState('')
  const [shots, setShots] = useState<ShotData[]>([])
  const [currentClub, setCurrentClub] = useState<ClubType>('driver')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const [currentShot, setCurrentShot] = useState({
    ballSpeed: '',
    clubSpeed: '',
    launchAngle: '',
    spinRate: '',
    carry: '',
    total: '',
  })

  const freeAnalysesLeft = 2 // TODO: 실제 값 가져오기

  const addShot = () => {
    if (!currentShot.carry) return

    const newShot: ShotData = {
      id: Date.now().toString(),
      clubType: currentClub,
      ballSpeed: currentShot.ballSpeed ? parseFloat(currentShot.ballSpeed) : undefined,
      clubSpeed: currentShot.clubSpeed ? parseFloat(currentShot.clubSpeed) : undefined,
      launchAngle: currentShot.launchAngle ? parseFloat(currentShot.launchAngle) : undefined,
      spinRate: currentShot.spinRate ? parseInt(currentShot.spinRate) : undefined,
      carry: parseFloat(currentShot.carry),
      total: currentShot.total ? parseFloat(currentShot.total) : undefined,
    }

    setShots([...shots, newShot])
    setCurrentShot({
      ballSpeed: '',
      clubSpeed: '',
      launchAngle: '',
      spinRate: '',
      carry: '',
      total: '',
    })
  }

  const removeShot = (id: string) => {
    setShots(shots.filter((s) => s.id !== id))
  }

  const handleAnalyze = async () => {
    if (shots.length === 0) return

    setIsAnalyzing(true)

    try {
      const response = await fetch('/api/analysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionDate,
          sessionType,
          dataSource: launchMonitor || 'manual',
          location,
          shots,
          locale,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.code === 'LIMIT_REACHED') {
          alert(t('errors.limitReached'))
        } else {
          alert(result.error || t('errors.analysisFailed'))
        }
        setIsAnalyzing(false)
        return
      }

      // 분석 완료 후 결과 페이지로 이동
      router.push(`/${locale}/analysis/${result.sessionId}`)
    } catch (error) {
      console.error('Analysis error:', error)
      alert(t('errors.analysisFailed'))
      setIsAnalyzing(false)
    }
  }

  const clubs: { value: ClubType; label: string }[] = [
    { value: 'driver', label: t('clubs.driver') },
    { value: '3wood', label: t('clubs.3wood') },
    { value: '5wood', label: t('clubs.5wood') },
    { value: 'hybrid', label: t('clubs.hybrid') },
    { value: '5iron', label: t('clubs.5iron') },
    { value: '6iron', label: t('clubs.6iron') },
    { value: '7iron', label: t('clubs.7iron') },
    { value: '8iron', label: t('clubs.8iron') },
    { value: '9iron', label: t('clubs.9iron') },
    { value: 'pw', label: t('clubs.pw') },
    { value: 'gw', label: t('clubs.gw') },
    { value: 'sw', label: t('clubs.sw') },
    { value: 'lw', label: t('clubs.lw') },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={`/${locale}/analysis`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('common.back')}
            </Link>

            <h1 className="text-lg font-semibold text-gray-900">
              {t('analysis.new.title')}
            </h1>

            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s <= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                {s < 4 && (
                  <div className={`w-16 sm:w-24 h-1 mx-2 ${s < step ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Data Source */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t('analysis.new.step1.title')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Photo Upload */}
              <button
                onClick={() => {
                  setDataSource('photo')
                  setStep(2)
                }}
                className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-green-500 transition text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📸</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {t('analysis.new.step1.photo')}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('analysis.new.step1.photoDesc')}
                </p>
              </button>

              {/* Manual Entry */}
              <button
                onClick={() => {
                  setDataSource('manual')
                  setStep(2)
                }}
                className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-green-500 transition text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📋</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {t('analysis.new.step1.manual')}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('analysis.new.step1.manualDesc')}
                </p>
              </button>

              {/* API Connect */}
              <button
                disabled
                className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 text-center opacity-50 cursor-not-allowed"
              >
                <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔗</span>
                </div>
                <h3 className="font-semibold text-gray-400 mb-1">
                  {t('analysis.new.step1.api')}
                </h3>
                <p className="text-sm text-gray-400">
                  {t('analysis.new.step1.apiDesc')}
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Launch Monitor */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t('analysis.new.step2.title')}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { id: 'trackman', label: t('analysis.new.step2.trackman') },
                { id: 'golfzon', label: t('analysis.new.step2.golfzon') },
                { id: 'gdr', label: t('analysis.new.step2.gdr') },
                { id: 'kakao', label: t('analysis.new.step2.kakao') },
                { id: 'flightscope', label: t('analysis.new.step2.flightscope') },
                { id: 'other', label: t('analysis.new.step2.other') },
              ].map((monitor) => (
                <button
                  key={monitor.id}
                  onClick={() => {
                    setLaunchMonitor(monitor.id as LaunchMonitor)
                    setStep(3)
                  }}
                  className={`p-4 bg-white rounded-xl border-2 transition ${
                    launchMonitor === monitor.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-500'
                  }`}
                >
                  <span className="font-medium text-gray-900">{monitor.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              className="mt-6 text-gray-500 hover:text-gray-700"
            >
              ← {t('common.back')}
            </button>
          </div>
        )}

        {/* Step 3: Session Info */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t('analysis.new.step3.title')}
            </h2>

            <div className="bg-white rounded-xl p-6 space-y-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('analysis.new.step3.date')}
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('analysis.new.step3.type')}
                </label>
                <div className="flex gap-4">
                  {[
                    { id: 'practice', label: t('analysis.new.step3.practice') },
                    { id: 'round', label: t('analysis.new.step3.round') },
                    { id: 'fitting', label: t('analysis.new.step3.fitting') },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSessionType(type.id as SessionType)}
                      className={`px-4 py-2 rounded-lg border transition ${
                        sessionType === type.id
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('analysis.new.step3.location')}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., GolfZon Gangnam"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(2)}
                className="text-gray-500 hover:text-gray-700"
              >
                ← {t('common.back')}
              </button>
              <button
                onClick={() => setStep(4)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                {t('common.next')} →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Shot Data Entry */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t('analysis.new.step4.title')}
            </h2>

            <div className="bg-white rounded-xl p-6">
              {/* Club Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('analysis.new.step4.club')}
                </label>
                <select
                  value={currentClub}
                  onChange={(e) => setCurrentClub(e.target.value as ClubType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {clubs.map((club) => (
                    <option key={club.value} value={club.value}>
                      {club.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shot Data Inputs */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('shotData.ballSpeed')} (mph)
                  </label>
                  <input
                    type="number"
                    value={currentShot.ballSpeed}
                    onChange={(e) => setCurrentShot({ ...currentShot, ballSpeed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="165"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('shotData.clubSpeed')} (mph)
                  </label>
                  <input
                    type="number"
                    value={currentShot.clubSpeed}
                    onChange={(e) => setCurrentShot({ ...currentShot, clubSpeed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="110"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('shotData.launchAngle')} (°)
                  </label>
                  <input
                    type="number"
                    value={currentShot.launchAngle}
                    onChange={(e) => setCurrentShot({ ...currentShot, launchAngle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="12.5"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('shotData.spinRate')} (rpm)
                  </label>
                  <input
                    type="number"
                    value={currentShot.spinRate}
                    onChange={(e) => setCurrentShot({ ...currentShot, spinRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="2500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('shotData.carry')} (yards) *
                  </label>
                  <input
                    type="number"
                    value={currentShot.carry}
                    onChange={(e) => setCurrentShot({ ...currentShot, carry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="245"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('shotData.total')} (yards)
                  </label>
                  <input
                    type="number"
                    value={currentShot.total}
                    onChange={(e) => setCurrentShot({ ...currentShot, total: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="265"
                  />
                </div>
              </div>

              <button
                onClick={addShot}
                disabled={!currentShot.carry}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + {t('analysis.new.step4.addShot')}
              </button>

              {/* Added Shots List */}
              {shots.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-3">
                    {shots.length} {t('analysis.new.step4.shots')}
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {shots.map((shot, index) => (
                      <div
                        key={shot.id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-400">#{index + 1}</span>
                          <span className="font-medium text-sm">
                            {clubs.find((c) => c.value === shot.clubType)?.label}
                          </span>
                          <span className="text-sm text-gray-600">
                            {shot.carry} yds
                          </span>
                          {shot.ballSpeed && (
                            <span className="text-sm text-gray-400">
                              {shot.ballSpeed} mph
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeShot(shot.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setStep(3)}
                className="text-gray-500 hover:text-gray-700"
              >
                ← {t('common.back')}
              </button>

              <div className="text-right">
                <p className="text-sm text-gray-500 mb-2">
                  {t('analysis.new.freeLeft', { count: freeAnalysesLeft })}
                </p>
                <button
                  onClick={handleAnalyze}
                  disabled={shots.length === 0 || isAnalyzing}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('analysis.new.analyzing')}
                    </span>
                  ) : (
                    t('analysis.new.analyze')
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
