'use client'

import { useState } from 'react'
import { GolfCourseReview, toggleReviewHelpful, deleteGolfCourseReview } from '@/lib/actions/golf-course-reviews'

interface ReviewListProps {
  reviews: GolfCourseReview[]
  currentUserId: string | null
  onReviewDeleted?: () => void
}

export default function ReviewList({ reviews, currentUserId, onReviewDeleted }: ReviewListProps) {
  const [localReviews, setLocalReviews] = useState(reviews)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleHelpful = async (reviewId: number) => {
    if (!currentUserId) {
      alert('로그인이 필요합니다.')
      return
    }

    const result = await toggleReviewHelpful(reviewId)

    if (result.success) {
      setLocalReviews((prev) =>
        prev.map((review) => {
          if (review.id === reviewId) {
            return {
              ...review,
              user_marked_helpful: result.isHelpful,
              helpful_count: result.isHelpful
                ? review.helpful_count + 1
                : review.helpful_count - 1,
            }
          }
          return review
        })
      )
    }
  }

  const handleDelete = async (reviewId: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    setDeletingId(reviewId)
    const result = await deleteGolfCourseReview(reviewId)

    if (result.success) {
      setLocalReviews((prev) => prev.filter((r) => r.id !== reviewId))
      onReviewDeleted?.()
    } else {
      alert(result.error || '삭제에 실패했습니다.')
    }
    setDeletingId(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`
  }

  if (localReviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <p>아직 리뷰가 없습니다.</p>
        <p className="text-sm mt-1">첫 번째 리뷰를 작성해보세요!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {localReviews.map((review) => (
        <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
          {/* 작성자 정보 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {review.profiles?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.profiles.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-medium">
                  {review.profiles?.username || review.profiles?.full_name || '익명'}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <span>{formatDate(review.created_at)}</span>
                  {review.visit_date && (
                    <>
                      <span>·</span>
                      <span>방문: {formatDate(review.visit_date)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 수정/삭제 버튼 */}
            {currentUserId === review.user_id && (
              <button
                onClick={() => handleDelete(review.id)}
                disabled={deletingId === review.id}
                className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                {deletingId === review.id ? '삭제 중...' : '삭제'}
              </button>
            )}
          </div>

          {/* 평점 */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {review.title && <span className="font-medium">{review.title}</span>}
          </div>

          {/* 세부 평점 */}
          {(review.course_condition || review.facilities || review.service || review.value_for_money) && (
            <div className="flex flex-wrap gap-3 mb-3 text-sm">
              {review.course_condition && (
                <span className="px-2 py-1 bg-gray-100 rounded">
                  코스상태 {review.course_condition}점
                </span>
              )}
              {review.facilities && (
                <span className="px-2 py-1 bg-gray-100 rounded">
                  시설 {review.facilities}점
                </span>
              )}
              {review.service && (
                <span className="px-2 py-1 bg-gray-100 rounded">
                  서비스 {review.service}점
                </span>
              )}
              {review.value_for_money && (
                <span className="px-2 py-1 bg-gray-100 rounded">
                  가성비 {review.value_for_money}점
                </span>
              )}
            </div>
          )}

          {/* 리뷰 내용 */}
          <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>

          {/* 도움됨 버튼 */}
          <button
            onClick={() => handleHelpful(review.id)}
            className={`flex items-center gap-1 mt-3 text-sm ${
              review.user_marked_helpful
                ? 'text-primary'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <svg
              className="w-4 h-4"
              fill={review.user_marked_helpful ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>도움됨 {review.helpful_count > 0 && `(${review.helpful_count})`}</span>
          </button>
        </div>
      ))}
    </div>
  )
}
