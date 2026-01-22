'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getClubRecommendations } from '@/lib/actions/club-recommendation'
import ClubCard from '@/components/club/ClubCard'
import LowestPriceSection from '@/components/club/LowestPriceSection'
import type {
  ClubRecommendationInput,
  ClubRecommendation,
  ClubType,
  MissTendency,
} from '@/types/club'
import { CLUB_TYPE_LABELS, MISS_TENDENCY_LABELS } from '@/types/club'

type Step = 'height' | 'skill' | 'miss' | 'budget' | 'result'

const STEPS: Step[] = ['height', 'skill', 'miss', 'budget', 'result']

export default function ClubRecommendPage() {
  const [currentStep, setCurrentStep] = useState<Step>('height')
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState<ClubRecommendationInput>({})
  const [results, setResults] = useState<Record<ClubType, ClubRecommendation[]> | null>(null)

  const currentStepIndex = STEPS.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  const goNext = () => {
    const nextIndex = Math.min(currentStepIndex + 1, STEPS.length - 1)
    setCurrentStep(STEPS[nextIndex])
  }

  const goPrev = () => {
    const prevIndex = Math.max(currentStepIndex - 1, 0)
    setCurrentStep(STEPS[prevIndex])
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const recommendations = await getClubRecommendations(input)
      setResults(recommendations)
      setCurrentStep('result')
    } catch (error) {
      console.error('Failed to get recommendations:', error)
      alert('추천을 불러오는데 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleRestart = () => {
    setInput({})
    setResults(null)
    setCurrentStep('height')
  }

  // 렌더링 헬퍼
  const renderStepContent = () => {
    switch (currentStep) {
      case 'height':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">키를 알려주세요</h2>
              <p className="text-muted">클럽 길이 추천에 참고합니다</p>
            </div>

            <div className="max-w-xs mx-auto">
              <label className="block text-sm font-medium mb-2">키 (cm)</label>
              <input
                type="number"
                value={input.height || ''}
                onChange={(e) =>
                  setInput({ ...input, height: parseInt(e.target.value) || undefined })
                }
                placeholder="예: 175"
                className="input w-full text-center text-2xl"
                min={140}
                max={210}
              />
            </div>

            <div className="flex justify-center gap-2 mt-8">
              {[160, 165, 170, 175, 180, 185].map((h) => (
                <button
                  key={h}
                  onClick={() => setInput({ ...input, height: h })}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    input.height === h
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {h}cm
                </button>
              ))}
            </div>
          </div>
        )

      case 'skill':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">골프 실력을 알려주세요</h2>
              <p className="text-muted">적합한 관용성의 클럽을 추천합니다</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  평균 타수 (18홀 기준)
                </label>
                <input
                  type="number"
                  value={input.average_score || ''}
                  onChange={(e) =>
                    setInput({
                      ...input,
                      average_score: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="예: 100"
                  className="input w-full text-center"
                  min={60}
                  max={150}
                />
              </div>

              <div className="flex justify-center gap-2">
                {[
                  { label: '초보 (110+)', value: 110 },
                  { label: '중급 (90-110)', value: 100 },
                  { label: '상급 (80-90)', value: 85 },
                  { label: '싱글 (80 이하)', value: 75 },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setInput({ ...input, average_score: option.value })}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      input.average_score === option.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">
                  드라이버 스윙 스피드 (선택사항)
                </label>
                <input
                  type="number"
                  value={input.swing_speed || ''}
                  onChange={(e) =>
                    setInput({
                      ...input,
                      swing_speed: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="모르면 비워두세요 (mph)"
                  className="input w-full text-center"
                  min={50}
                  max={130}
                />
                <p className="text-xs text-muted mt-1 text-center">
                  모르시면 비워두세요. 키와 실력으로 추정합니다.
                </p>
              </div>
            </div>
          </div>
        )

      case 'miss':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">자주 발생하는 미스샷이 있나요?</h2>
              <p className="text-muted">미스샷 보정에 도움이 되는 클럽을 추천합니다</p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(MISS_TENDENCY_LABELS).map(([key, label]) => {
                  const isSelected = input.miss_tendency?.includes(key as MissTendency)
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        const current = input.miss_tendency || []
                        const updated = isSelected
                          ? current.filter((m) => m !== key)
                          : [...current, key as MissTendency]
                        setInput({ ...input, miss_tendency: updated })
                      }}
                      className={`p-4 rounded-xl border-2 transition-colors text-left ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{label}</div>
                      <div className="text-sm text-muted">
                        {key === 'slice' && '공이 오른쪽으로 휘어짐'}
                        {key === 'hook' && '공이 왼쪽으로 휘어짐'}
                        {key === 'thin' && '공 윗부분을 맞힘'}
                        {key === 'fat' && '공 뒤 땅을 먼저 침'}
                      </div>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setInput({ ...input, miss_tendency: [] })}
                className={`mt-4 w-full p-3 rounded-xl border transition-colors ${
                  !input.miss_tendency || input.miss_tendency.length === 0
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                딱히 없어요
              </button>
            </div>
          </div>
        )

      case 'budget':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">예산을 알려주세요</h2>
              <p className="text-muted">예산에 맞는 클럽을 추천합니다</p>
            </div>

            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium mb-2">
                클럽 1개당 예산 (원)
              </label>
              <input
                type="number"
                value={input.budget || ''}
                onChange={(e) =>
                  setInput({ ...input, budget: parseInt(e.target.value) || undefined })
                }
                placeholder="예: 500000"
                className="input w-full text-center"
                min={100000}
                max={2000000}
                step={50000}
              />

              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {[
                  { label: '30만원', value: 300000 },
                  { label: '50만원', value: 500000 },
                  { label: '70만원', value: 700000 },
                  { label: '100만원', value: 1000000 },
                  { label: '150만원', value: 1500000 },
                  { label: '상관없음', value: undefined },
                ].map((option) => (
                  <button
                    key={option.label}
                    onClick={() => setInput({ ...input, budget: option.value })}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      input.budget === option.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'result':
        return (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">추천 클럽</h2>
              <p className="text-muted">
                입력하신 정보를 바탕으로 맞춤 추천해드립니다
              </p>
            </div>

            {results && (
              <div className="space-y-12">
                {Object.entries(results).map(([type, recommendations]) => {
                  if (recommendations.length === 0) return null

                  return (
                    <div key={type}>
                      <h3 className="text-xl font-bold mb-4">
                        {CLUB_TYPE_LABELS[type as ClubType]} 추천
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {recommendations.map((rec) => (
                          <div key={rec.club.id} className="relative bg-white rounded-xl border border-gray-200 overflow-hidden">
                            {/* 추천 점수 배지 */}
                            <div className="absolute top-3 right-3 z-10 bg-primary text-white text-sm font-bold w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                              {Math.round(rec.score)}점
                            </div>

                            <div className="p-4">
                              <ClubCard club={rec.club} compact />

                              {/* 추천 이유 */}
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium mb-2">추천 이유</p>
                                <ul className="text-xs text-muted space-y-1">
                                  {rec.reasons.slice(0, 3).map((reason, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <svg
                                        className="w-4 h-4 text-primary flex-shrink-0 mt-0.5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      {reason}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* 최저가 비교 섹션 */}
                              <LowestPriceSection
                                clubName={rec.club.name}
                                brandName={rec.club.brand?.name}
                                clubType={type as 'driver' | 'wood' | 'hybrid' | 'iron' | 'wedge' | 'putter'}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* 결과가 없을 때 */}
                {Object.values(results).every((r) => r.length === 0) && (
                  <div className="text-center py-12">
                    <p className="text-muted">
                      입력하신 조건에 맞는 클럽을 찾지 못했습니다.
                      <br />
                      조건을 조금 완화해서 다시 시도해보세요.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="py-12 min-h-screen">
      <div className="container max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/club-catalog"
            className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            클럽 카탈로그
          </Link>
          <h1 className="text-3xl font-bold">AI 클럽 추천</h1>
        </div>

        {/* 진행 상태 바 */}
        {currentStep !== 'result' && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted mb-2">
              <span>
                {currentStepIndex + 1} / {STEPS.length - 1}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* 스텝 콘텐츠 */}
        <div className="card p-8 min-h-[400px]">{renderStepContent()}</div>

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between mt-8">
          {currentStep === 'result' ? (
            <>
              <button onClick={handleRestart} className="btn btn-outline">
                다시 추천받기
              </button>
              <Link href="/club-catalog" className="btn btn-primary">
                클럽 카탈로그 보기
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={goPrev}
                disabled={currentStepIndex === 0}
                className="btn btn-outline disabled:opacity-50"
              >
                이전
              </button>

              {currentStep === 'budget' ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      분석 중...
                    </span>
                  ) : (
                    '추천받기'
                  )}
                </button>
              ) : (
                <button onClick={goNext} className="btn btn-primary">
                  다음
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
