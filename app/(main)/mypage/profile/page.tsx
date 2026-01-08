'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProfile, updateProfile } from '@/lib/actions/profile'

export default function ProfileEditPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
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

          {/* 지역 */}
          <div className="mb-6">
            <label htmlFor="location" className="block text-sm font-medium mb-2">
              지역
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="예: 서울 강남"
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
      </div>
    </div>
  )
}
