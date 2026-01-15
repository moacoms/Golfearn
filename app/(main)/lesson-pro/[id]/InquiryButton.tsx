'use client'

import { useState, useTransition } from 'react'
import { createLessonInquiry } from '@/lib/actions/lesson-pros'
import { lessonTypeOptions } from '@/lib/lesson-pro-constants'

interface InquiryButtonProps {
  proId: number
  proName: string
  isLoggedIn: boolean
}

export default function InquiryButton({ proId, proName, isLoggedIn }: InquiryButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [lessonType, setLessonType] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    startTransition(async () => {
      const result = await createLessonInquiry(
        proId,
        message,
        preferredTime || undefined,
        lessonType || undefined
      )
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setMessage('')
        setPreferredTime('')
        setLessonType('')
        setTimeout(() => {
          setShowModal(false)
          setSuccess(false)
        }, 2000)
      }
    })
  }

  const handleClick = () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.')
      return
    }
    setShowModal(true)
  }

  return (
    <>
      <button onClick={handleClick} className="btn btn-primary">
        레슨 문의하기
      </button>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 배경 */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />

          {/* 모달 콘텐츠 */}
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">문의가 전송되었습니다</h3>
                <p className="text-muted">프로님이 확인 후 답변 드릴 예정입니다.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">{proName} 프로에게 문의하기</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-muted hover:text-foreground"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      관심 있는 레슨 유형 (선택)
                    </label>
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
                    <label className="block text-sm font-medium mb-2">
                      선호하는 시간대 (선택)
                    </label>
                    <input
                      type="text"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      placeholder="예: 평일 저녁, 주말 오전"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      문의 내용 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="궁금한 점이나 요청사항을 작성해주세요..."
                      rows={4}
                      required
                      className="w-full px-3 py-2 border rounded-lg resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="btn btn-primary flex-1"
                    >
                      {isPending ? '전송 중...' : '문의 전송'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn btn-outline"
                    >
                      취소
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
