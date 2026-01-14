'use client'

import { useState } from 'react'
import { createGolfCourseReview } from '@/lib/actions/golf-course-reviews'

interface ReviewFormProps {
  placeId: string
  golfCourseName: string
  onSuccess?: () => void
}

export default function ReviewForm({ placeId, golfCourseName, onSuccess }: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [visitDate, setVisitDate] = useState('')
  const [courseCondition, setCourseCondition] = useState<number | null>(null)
  const [facilities, setFacilities] = useState<number | null>(null)
  const [service, setService] = useState<number | null>(null)
  const [valueForMoney, setValueForMoney] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.append('place_id', placeId)
    formData.append('golf_course_name', golfCourseName)
    formData.append('rating', rating.toString())
    if (title) formData.append('title', title)
    formData.append('content', content)
    if (visitDate) formData.append('visit_date', visitDate)
    if (courseCondition) formData.append('course_condition', courseCondition.toString())
    if (facilities) formData.append('facilities', facilities.toString())
    if (service) formData.append('service', service.toString())
    if (valueForMoney) formData.append('value_for_money', valueForMoney.toString())

    const result = await createGolfCourseReview(formData)

    if (result.error) {
      setError(result.error)
    } else {
      // 초기화
      setRating(5)
      setTitle('')
      setContent('')
      setVisitDate('')
      setCourseCondition(null)
      setFacilities(null)
      setService(null)
      setValueForMoney(null)
      setIsOpen(false)
      onSuccess?.()
    }

    setIsSubmitting(false)
  }

  const DetailRating = ({
    label,
    value,
    onChange,
  }: {
    label: string
    value: number | null
    onChange: (v: number | null) => void
  }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(value === v ? null : v)}
            className={`w-8 h-8 rounded ${
              value === v
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary w-full"
      >
        리뷰 작성하기
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 총점 */}
      <div>
        <label className="block text-sm font-medium mb-2">총점 *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setRating(v)}
              onMouseEnter={() => setHoverRating(v)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <svg
                className={`w-8 h-8 ${
                  v <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-lg font-medium">{rating}점</span>
        </div>
      </div>

      {/* 세부 평점 */}
      <div>
        <p className="text-sm font-medium mb-2">세부 평점 (선택)</p>
        <div className="grid grid-cols-2 gap-4">
          <DetailRating label="코스 상태" value={courseCondition} onChange={setCourseCondition} />
          <DetailRating label="시설" value={facilities} onChange={setFacilities} />
          <DetailRating label="서비스" value={service} onChange={setService} />
          <DetailRating label="가성비" value={valueForMoney} onChange={setValueForMoney} />
        </div>
      </div>

      {/* 방문 날짜 */}
      <div>
        <label htmlFor="visit_date" className="block text-sm font-medium mb-1">
          방문 날짜 (선택)
        </label>
        <input
          id="visit_date"
          type="date"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="input"
        />
      </div>

      {/* 제목 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          리뷰 제목 (선택)
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="한줄 요약"
          className="input"
          maxLength={50}
        />
      </div>

      {/* 내용 */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1">
          리뷰 내용 *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="골프장 이용 경험을 자세히 공유해주세요"
          className="input h-32 resize-none"
          required
          minLength={10}
        />
        <p className="text-xs text-muted mt-1">{content.length}/500자</p>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="btn btn-outline flex-1"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="btn btn-primary flex-1"
        >
          {isSubmitting ? '등록 중...' : '리뷰 등록'}
        </button>
      </div>
    </form>
  )
}
