'use client'

import { useState, useTransition } from 'react'
import { createLessonProReview, deleteLessonProReview, LessonProReview } from '@/lib/actions/lesson-pros'
import { lessonTypeOptions } from '@/lib/lesson-pro-constants'
import { formatDate } from '@/lib/utils'

interface ReviewSectionProps {
  proId: number
  reviews: LessonProReview[]
  currentUserId?: string
}

export default function ReviewSection({
  proId,
  reviews,
  currentUserId,
}: ReviewSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [lessonType, setLessonType] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  // 이미 리뷰를 작성했는지 확인
  const hasReviewed = reviews.some((review) => review.user_id === currentUserId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    startTransition(async () => {
      const result = await createLessonProReview(proId, rating, content, lessonType || undefined)
      if (result.error) {
        setError(result.error)
      } else {
        setShowForm(false)
        setContent('')
        setRating(5)
        setLessonType('')
        // 페이지 새로고침하여 리뷰 목록 갱신
        window.location.reload()
      }
    })
  }

  const handleDelete = (reviewId: number) => {
    if (!confirm('리뷰를 삭제하시겠습니까?')) return

    startTransition(async () => {
      const result = await deleteLessonProReview(reviewId, proId)
      if (result.error) {
        alert(result.error)
      } else {
        window.location.reload()
      }
    })
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">리뷰 ({reviews.length})</h2>
        {currentUserId && !hasReviewed && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary btn-sm"
          >
            리뷰 작성
          </button>
        )}
      </div>

      {/* 리뷰 작성 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">평점</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <svg
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">레슨 유형 (선택)</label>
            <select
              value={lessonType}
              onChange={(e) => setLessonType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">선택 안함</option>
              {lessonTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">리뷰 내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="레슨 경험을 공유해주세요..."
              rows={4}
              className="w-full px-3 py-2 border rounded-lg resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary"
            >
              {isPending ? '작성 중...' : '리뷰 등록'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-outline"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {/* 리뷰 목록 */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="pb-6 border-b last:border-b-0 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {review.profiles?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={review.profiles.avatar_url}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {review.profiles?.username || review.profiles?.full_name || '익명'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <span>{formatDate(review.created_at)}</span>
                    </div>
                  </div>
                </div>
                {review.user_id === currentUserId && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={isPending}
                    className="text-sm text-muted hover:text-red-500"
                  >
                    삭제
                  </button>
                )}
              </div>
              {review.lesson_type && (
                <span className="inline-block px-2 py-0.5 bg-gray-100 text-sm rounded mb-2">
                  {lessonTypeOptions.find((o) => o.value === review.lesson_type)?.label || review.lesson_type}
                </span>
              )}
              {review.content && (
                <p className="text-muted">{review.content}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted py-8">
          아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해주세요!
        </p>
      )}
    </div>
  )
}
