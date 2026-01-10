'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProfile, updateProfile } from '@/lib/actions/profile'
import { LocationSettingModal } from '@/components/location'

export default function ProfileEditPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [locationInfo, setLocationInfo] = useState<{
    dong: string | null
    gu: string | null
    city: string | null
    range: number
  } | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    height: '',
    golf_started_at: '',
    average_score: '',
    location: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getProfile()

      if (profile) {
        setFormData({
          username: profile.username || '',
          full_name: profile.full_name || '',
          height: profile.height?.toString() || '',
          golf_started_at: profile.golf_started_at || '',
          average_score: profile.average_score?.toString() || '',
          location: profile.location || '',
        })
        // 위치 정보 설정
        setLocationInfo({
          dong: profile.location_dong || null,
          gu: profile.location_gu || null,
          city: profile.location_city || null,
          range: profile.location_range || 3,
        })
      }
      setIsLoading(false)
    }

    loadProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const form = new FormData()
    form.append('username', formData.username)
    form.append('full_name', formData.full_name)
    form.append('height', formData.height)
    form.append('golf_started_at', formData.golf_started_at)
    form.append('average_score', formData.average_score)
    form.append('location', formData.location)

    const result = await updateProfile(form)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/mypage'), 1500)
    }

    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="container max-w-2xl">
          <div className="text-center text-muted">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="container max-w-2xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/mypage"
            className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            마이페이지
          </Link>
          <h1 className="text-3xl font-bold">프로필 수정</h1>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="card">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              프로필이 수정되었습니다. 잠시 후 이동합니다...
            </div>
          )}

          {/* 닉네임 */}
          <div className="mb-6">
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              닉네임
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="닉네임을 입력하세요"
              className="input"
              disabled={isSubmitting}
            />
          </div>

          {/* 이름 */}
          <div className="mb-6">
            <label htmlFor="full_name" className="block text-sm font-medium mb-2">
              이름
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="이름을 입력하세요"
              className="input"
              disabled={isSubmitting}
            />
          </div>

          {/* 키 */}
          <div className="mb-6">
            <label htmlFor="height" className="block text-sm font-medium mb-2">
              키 (cm)
            </label>
            <input
              id="height"
              name="height"
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              placeholder="170"
              className="input"
              min="100"
              max="250"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted mt-1">체형에 맞는 클럽 추천을 위해 사용됩니다</p>
          </div>

          {/* 골프 시작일 */}
          <div className="mb-6">
            <label htmlFor="golf_started_at" className="block text-sm font-medium mb-2">
              골프 시작일
            </label>
            <input
              id="golf_started_at"
              name="golf_started_at"
              type="date"
              value={formData.golf_started_at}
              onChange={(e) => setFormData({ ...formData, golf_started_at: e.target.value })}
              className="input"
              disabled={isSubmitting}
            />
          </div>

          {/* 평균 스코어 */}
          <div className="mb-6">
            <label htmlFor="average_score" className="block text-sm font-medium mb-2">
              평균 스코어
            </label>
            <input
              id="average_score"
              name="average_score"
              type="number"
              value={formData.average_score}
              onChange={(e) => setFormData({ ...formData, average_score: e.target.value })}
              placeholder="100"
              className="input"
              min="50"
              max="200"
              disabled={isSubmitting}
            />
          </div>

          {/* 동네 설정 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              동네 설정
            </label>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {locationInfo?.dong || locationInfo?.gu ? (
                    <div>
                      <p className="font-medium text-gray-900">
                        {locationInfo.dong || locationInfo.gu}
                      </p>
                      <p className="text-sm text-gray-500">
                        {locationInfo.city} {locationInfo.gu !== locationInfo.dong && locationInfo.gu}
                      </p>
                    </div>
                  ) : (
                    <span className="text-gray-400">위치가 설정되지 않았습니다</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  {locationInfo?.dong ? '변경' : '설정하기'}
                </button>
              </div>
              {locationInfo?.dong && (
                <p className="mt-2 text-xs text-gray-500">
                  검색 범위: {locationInfo.range}km 이내
                </p>
              )}
            </div>
            <p className="text-xs text-muted mt-1">
              중고거래에서 내 위치 기반으로 가까운 매물을 볼 수 있습니다
            </p>
          </div>

          {/* 기존 지역 (텍스트) - 호환성 유지 */}
          <div className="mb-6">
            <label htmlFor="location" className="block text-sm font-medium mb-2">
              지역 (선택)
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="예: 서울 강남 (텍스트로 추가 입력)"
              className="input"
              disabled={isSubmitting}
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3">
            <Link href="/mypage" className="btn btn-outline">
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>

        {/* 위치 설정 모달 */}
        <LocationSettingModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          currentLocation={locationInfo}
          onSuccess={() => {
            // 프로필 다시 로드
            getProfile().then((profile) => {
              if (profile) {
                setLocationInfo({
                  dong: profile.location_dong || null,
                  gu: profile.location_gu || null,
                  city: profile.location_city || null,
                  range: profile.location_range || 3,
                })
                setFormData((prev) => ({
                  ...prev,
                  location: profile.location || '',
                }))
              }
            })
          }}
        />
      </div>
    </div>
  )
}
