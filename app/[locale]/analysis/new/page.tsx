'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type DataSource = 'photo' | 'manual' | 'api'
type LaunchMonitor = 'trackman' | 'golfzon' | 'gdr' | 'kakao' | 'flightscope' | 'other'
type SessionType = 'practice' | 'round' | 'fitting'
type ClubType = 'driver' | '3wood' | '5wood' | 'hybrid' | '5iron' | '6iron' | '7iron' | '8iron' | '9iron' | 'pw' | 'gw' | 'sw' | 'lw'

type DistanceUnit = 'yards' | 'meters'
type SpeedUnit = 'mph' | 'ms'

interface ShotData {
  id: string
  clubType: ClubType
  ballSpeed?: number
  clubSpeed?: number
  smashFactor?: number
  launchAngle?: number
  attackAngle?: number
  clubPath?: number
  faceAngle?: number
  spinRate?: number
  carry?: number
  total?: number
  offline?: number
}

export default function NewAnalysisPage() {
  const t = useTranslations()
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string

  const [authChecking, setAuthChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace(`/${locale}/login?redirect=/${locale}/analysis/new`)
        return
      }
      setAuthChecking(false)
    }
    checkAuth()
  }, [locale, router])

  const [step, setStep] = useState(1)
  const [dataSource, setDataSource] = useState<DataSource | null>(null)
  const [launchMonitor, setLaunchMonitor] = useState<LaunchMonitor | null>(null)
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [sessionType, setSessionType] = useState<SessionType>('practice')
  const [location, setLocation] = useState('')
  const [shots, setShots] = useState<ShotData[]>([])
  const [currentClub, setCurrentClub] = useState<ClubType>('driver')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('yards')
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>('mph')

  const [currentShot, setCurrentShot] = useState({
    ballSpeed: '',
    clubSpeed: '',
    smashFactor: '',
    launchAngle: '',
    attackAngle: '',
    clubPath: '',
    faceAngle: '',
    spinRate: '',
    carry: '',
    total: '',
    offline: '',
  })

  // Photo upload states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedImageName, setUploadedImageName] = useState('')
  const [imageMimeType, setImageMimeType] = useState('image/jpeg')
  const [isExtracting, setIsExtracting] = useState(false)
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null)
  const [ocrWarnings, setOcrWarnings] = useState<string[]>([])
  const [ocrError, setOcrError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const freeAnalysesLeft = 2 // TODO: 실제 값 가져오기

  const handleFileSelect = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      setOcrError(t('analysis.new.upload.invalidFileType'))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setOcrError(t('analysis.new.upload.maxFileSize'))
      return
    }
    setOcrError(null)
    setOcrWarnings([])
    setOcrConfidence(null)
    setUploadedImageName(file.name)
    setImageMimeType(file.type)

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setUploadedImage(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleExtractOCR = async () => {
    if (!uploadedImage) return
    setIsExtracting(true)
    setOcrError(null)
    setOcrWarnings([])

    try {
      const base64Data = uploadedImage.split(',')[1]

      const response = await fetch('/api/analysis/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          imageMimeType,
          launchMonitor: launchMonitor || 'other',
          locale,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.code === 'OCR_LIMIT_REACHED') {
          setOcrError(t('analysis.new.upload.ocrLimitReached'))
        } else {
          setOcrError(result.error || t('analysis.new.upload.extractFailed'))
        }
        setIsExtracting(false)
        return
      }

      if (result.shots && result.shots.length > 0) {
        const newShots: ShotData[] = result.shots.map((shot: any) => ({
          id: shot.id || Date.now().toString() + Math.random(),
          clubType: shot.clubType || 'driver',
          ballSpeed: shot.ballSpeed,
          clubSpeed: shot.clubSpeed,
          smashFactor: shot.smashFactor,
          launchAngle: shot.launchAngle,
          attackAngle: shot.attackAngle,
          clubPath: shot.clubPath,
          faceAngle: shot.faceAngle,
          spinRate: shot.spinRate,
          carry: shot.carry,
          total: shot.total,
          offline: shot.offline,
        }))
        setShots((prev) => [...prev, ...newShots])

        if (result.units) {
          if (result.units.distance === 'meters') setDistanceUnit('meters')
          if (result.units.speed === 'ms') setSpeedUnit('ms')
        }
      }

      setOcrConfidence(result.confidence ?? null)
      setOcrWarnings(result.warnings || [])

      if (!result.shots || result.shots.length === 0) {
        setOcrError(t('analysis.new.upload.extractFailed'))
      }
    } catch (error) {
      console.error('OCR error:', error)
      setOcrError(t('analysis.new.upload.extractFailed'))
    } finally {
      setIsExtracting(false)
    }
  }

  const addShot = () => {
    if (!currentShot.carry) return

    const newShot: ShotData = {
      id: Date.now().toString(),
      clubType: currentClub,
      ballSpeed: currentShot.ballSpeed ? parseFloat(currentShot.ballSpeed) : undefined,
      clubSpeed: currentShot.clubSpeed ? parseFloat(currentShot.clubSpeed) : undefined,
      smashFactor: currentShot.smashFactor ? parseFloat(currentShot.smashFactor) : undefined,
      launchAngle: currentShot.launchAngle ? parseFloat(currentShot.launchAngle) : undefined,
      attackAngle: currentShot.attackAngle ? parseFloat(currentShot.attackAngle) : undefined,
      clubPath: currentShot.clubPath ? parseFloat(currentShot.clubPath) : undefined,
      faceAngle: currentShot.faceAngle ? parseFloat(currentShot.faceAngle) : undefined,
      spinRate: currentShot.spinRate ? parseInt(currentShot.spinRate) : undefined,
      carry: parseFloat(currentShot.carry),
      total: currentShot.total ? parseFloat(currentShot.total) : undefined,
      offline: currentShot.offline ? parseFloat(currentShot.offline) : undefined,
    }

    setShots([...shots, newShot])
    setCurrentShot({
      ballSpeed: '',
      clubSpeed: '',
      smashFactor: '',
      launchAngle: '',
      attackAngle: '',
      clubPath: '',
      faceAngle: '',
      spinRate: '',
      carry: '',
      total: '',
      offline: '',
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
          units: { distance: distanceUnit, speed: speedUnit },
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

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-green-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500 text-sm">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

            {/* Photo Upload Section */}
            {dataSource === 'photo' && (
              <div className="bg-white rounded-xl p-6 mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  {t('analysis.new.upload.title')}
                </h3>

                {!uploadedImage ? (
                  /* Drop Zone */
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
                      isDragging
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                    }`}
                    onClick={() => document.getElementById('photo-input')?.click()}
                  >
                    <input
                      id="photo-input"
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileSelect(file)
                      }}
                    />
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-700 font-medium mb-1">
                      {t('analysis.new.upload.drag')}
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      {t('analysis.new.upload.or')}
                    </p>
                    <span className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {t('analysis.new.upload.browse')}
                    </span>
                    <p className="text-gray-400 text-xs mt-3">
                      {t('analysis.new.upload.supported')}
                    </p>
                  </div>
                ) : (
                  /* Image Preview + Extract */
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={uploadedImage}
                          alt="Uploaded"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{uploadedImageName}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              setUploadedImage(null)
                              setUploadedImageName('')
                              setOcrConfidence(null)
                              setOcrWarnings([])
                              setOcrError(null)
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                          >
                            {t('analysis.new.upload.changeImage')}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Extract Button */}
                    {ocrConfidence === null && !ocrError && (
                      <button
                        onClick={handleExtractOCR}
                        disabled={isExtracting}
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                      >
                        {isExtracting ? (
                          <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {t('analysis.new.upload.processing')}
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {t('analysis.new.upload.extract')}
                          </>
                        )}
                      </button>
                    )}

                    {/* OCR Success */}
                    {ocrConfidence !== null && ocrConfidence > 0 && shots.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium text-green-800">{t('analysis.new.upload.extracted')}</span>
                        </div>
                        <p className="text-sm text-green-700">
                          {t('analysis.new.upload.extractedCount', { count: shots.length })}
                          {' · '}
                          {t('analysis.new.upload.confidence', { percent: Math.round(ocrConfidence * 100) })}
                        </p>
                        {ocrWarnings.length > 0 && (
                          <p className="text-sm text-amber-700 mt-2">
                            {t('analysis.new.upload.partialWarning')}
                          </p>
                        )}
                        <p className="text-xs text-green-600 mt-2">
                          {t('analysis.new.upload.reviewDesc')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* OCR Error */}
                {ocrError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-red-700 mb-3">{ocrError}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setOcrError(null)
                          setOcrConfidence(null)
                          handleExtractOCR()
                        }}
                        className="text-sm font-medium text-red-700 hover:text-red-800 underline"
                      >
                        {t('analysis.new.upload.retry')}
                      </button>
                      <button
                        onClick={() => {
                          setDataSource('manual')
                          setOcrError(null)
                        }}
                        className="text-sm font-medium text-gray-600 hover:text-gray-800 underline"
                      >
                        {t('analysis.new.upload.manualFallback')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Divider when shots extracted or manual fallback available */}
                {(shots.length > 0 || ocrConfidence !== null) && (
                  <div className="flex items-center gap-3 mt-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-xs text-gray-400 font-medium">
                      {locale === 'ko' ? '샷을 추가하거나 수정하세요' : 'Add or edit shots below'}
                    </span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                )}
              </div>
            )}

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

              {/* Unit Settings */}
              <div className="flex flex-wrap gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    {locale === 'ko' ? '거리' : 'Distance'}:
                  </span>
                  <div className="flex rounded-lg overflow-hidden border border-gray-300">
                    <button
                      type="button"
                      onClick={() => setDistanceUnit('yards')}
                      className={`px-3 py-1 text-xs font-medium transition ${distanceUnit === 'yards' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                      Yards
                    </button>
                    <button
                      type="button"
                      onClick={() => setDistanceUnit('meters')}
                      className={`px-3 py-1 text-xs font-medium transition ${distanceUnit === 'meters' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                      Meters
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    {locale === 'ko' ? '속도' : 'Speed'}:
                  </span>
                  <div className="flex rounded-lg overflow-hidden border border-gray-300">
                    <button
                      type="button"
                      onClick={() => setSpeedUnit('mph')}
                      className={`px-3 py-1 text-xs font-medium transition ${speedUnit === 'mph' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                      mph
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpeedUnit('ms')}
                      className={`px-3 py-1 text-xs font-medium transition ${speedUnit === 'ms' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                      m/s
                    </button>
                  </div>
                </div>
              </div>

              {/* Shot Data Inputs */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('shotData.ballSpeed')} ({speedUnit === 'mph' ? 'mph' : 'm/s'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentShot.ballSpeed}
                    onChange={(e) => setCurrentShot({ ...currentShot, ballSpeed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder={speedUnit === 'mph' ? '165' : '73.8'}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('shotData.clubSpeed')} ({speedUnit === 'mph' ? 'mph' : 'm/s'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentShot.clubSpeed}
                    onChange={(e) => setCurrentShot({ ...currentShot, clubSpeed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder={speedUnit === 'mph' ? '110' : '49.2'}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('shotData.smashFactor')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentShot.smashFactor}
                    onChange={(e) => setCurrentShot({ ...currentShot, smashFactor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="1.50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('shotData.launchAngle')} ({'\u00B0'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentShot.launchAngle}
                    onChange={(e) => setCurrentShot({ ...currentShot, launchAngle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="12.5"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('shotData.attackAngle')} ({'\u00B0'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentShot.attackAngle}
                    onChange={(e) => setCurrentShot({ ...currentShot, attackAngle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="-1.5"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('shotData.clubPath')} ({'\u00B0'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentShot.clubPath}
                    onChange={(e) => setCurrentShot({ ...currentShot, clubPath: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="2.0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('shotData.faceAngle')} ({'\u00B0'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentShot.faceAngle}
                    onChange={(e) => setCurrentShot({ ...currentShot, faceAngle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="1.0"
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
                    {t('shotData.carry')} ({distanceUnit === 'yards' ? 'yds' : 'm'}) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentShot.carry}
                    onChange={(e) => setCurrentShot({ ...currentShot, carry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder={distanceUnit === 'yards' ? '245' : '224'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('shotData.total')} ({distanceUnit === 'yards' ? 'yds' : 'm'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentShot.total}
                    onChange={(e) => setCurrentShot({ ...currentShot, total: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder={distanceUnit === 'yards' ? '265' : '242'}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('shotData.offline')} ({distanceUnit === 'yards' ? 'yds' : 'm'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentShot.offline}
                    onChange={(e) => setCurrentShot({ ...currentShot, offline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="5.0"
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
                            {shot.carry} {distanceUnit === 'yards' ? 'yds' : 'm'}
                          </span>
                          {shot.ballSpeed && (
                            <span className="text-sm text-gray-400">
                              {shot.ballSpeed} {speedUnit === 'mph' ? 'mph' : 'm/s'}
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
