'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createJoinPost } from '@/lib/actions/join'

// 시간 옵션 생성 (05:00 ~ 18:00, 30분 단위)
const timeOptions: string[] = []
for (let h = 5; h <= 18; h++) {
  timeOptions.push(`${h.toString().padStart(2, '0')}:00`)
  if (h < 18) {
    timeOptions.push(`${h.toString().padStart(2, '0')}:30`)
  }
}

export default function CreateJoinPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    round_date: '',
    round_time: '07:00',
    golf_course_name: '',
    golf_course_address: '',
    total_slots: '4',
    min_score: '',
    max_score: '',
    green_fee: '',
    cart_fee: '',
    caddie_fee: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const form = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value) form.append(key, value)
      })

      const result = await createJoinPost(form)

      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        router.push(`/join/${result.data.id}`)
      }
    } catch (err) {
      console.error('Error creating join:', err)
      setError('모집글 등록에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 오늘 날짜 (최소값)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="py-12">
      <div className="container max-w-2xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/join"
            className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </Link>
          <h1 className="text-3xl font-bold">조인 모집하기</h1>
          <p className="text-muted mt-2">함께 라운딩할 골린이를 모집해보세요</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* 기본 정보 */}
          <div className="card">
            <h2 className="font-semibold mb-4">기본 정보</h2>

            <div className="space-y-4">
              {/* 제목 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  모집 제목 <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="예: 1/20 토요일 골린이 조인 구합니다"
                  className="input"
                />
              </div>

              {/* 상세 설명 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  상세 설명
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="라운딩에 대한 추가 설명을 입력하세요"
                  className="input h-32 resize-none"
                />
              </div>
            </div>
          </div>

          {/* 라운딩 정보 */}
          <div className="card">
            <h2 className="font-semibold mb-4">라운딩 정보</h2>

            <div className="space-y-4">
              {/* 날짜/시간 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="round_date" className="block text-sm font-medium mb-2">
                    날짜 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="round_date"
                    name="round_date"
                    type="date"
                    required
                    min={today}
                    value={formData.round_date}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="round_time" className="block text-sm font-medium mb-2">
                    티오프 시간 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="round_time"
                    name="round_time"
                    required
                    value={formData.round_time}
                    onChange={handleChange}
                    className="input"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 골프장 */}
              <div>
                <label htmlFor="golf_course_name" className="block text-sm font-medium mb-2">
                  골프장명 <span className="text-red-500">*</span>
                </label>
                <input
                  id="golf_course_name"
                  name="golf_course_name"
                  type="text"
                  required
                  value={formData.golf_course_name}
                  onChange={handleChange}
                  placeholder="예: 레이크힐스 제주 CC"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="golf_course_address" className="block text-sm font-medium mb-2">
                  골프장 주소
                </label>
                <input
                  id="golf_course_address"
                  name="golf_course_address"
                  type="text"
                  value={formData.golf_course_address}
                  onChange={handleChange}
                  placeholder="예: 경기도 용인시 처인구"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* 모집 정보 */}
          <div className="card">
            <h2 className="font-semibold mb-4">모집 정보</h2>

            <div className="space-y-4">
              {/* 모집 인원 */}
              <div>
                <label htmlFor="total_slots" className="block text-sm font-medium mb-2">
                  모집 인원 <span className="text-red-500">*</span>
                </label>
                <select
                  id="total_slots"
                  name="total_slots"
                  required
                  value={formData.total_slots}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="2">2명 (본인 포함)</option>
                  <option value="3">3명 (본인 포함)</option>
                  <option value="4">4명 (본인 포함)</option>
                </select>
                <p className="text-xs text-muted mt-1">본인을 포함한 총 인원입니다</p>
              </div>

              {/* 실력 조건 */}
              <div>
                <label className="block text-sm font-medium mb-2">실력 조건 (선택)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      id="min_score"
                      name="min_score"
                      type="number"
                      value={formData.min_score}
                      onChange={handleChange}
                      placeholder="최소 (예: 100)"
                      className="input"
                      min="50"
                      max="200"
                    />
                    <p className="text-xs text-muted mt-1">타 이상</p>
                  </div>
                  <div>
                    <input
                      id="max_score"
                      name="max_score"
                      type="number"
                      value={formData.max_score}
                      onChange={handleChange}
                      placeholder="최대 (예: 130)"
                      className="input"
                      min="50"
                      max="200"
                    />
                    <p className="text-xs text-muted mt-1">타 이하</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  비워두면 실력 제한 없이 누구나 신청할 수 있습니다
                </p>
              </div>
            </div>
          </div>

          {/* 비용 정보 */}
          <div className="card">
            <h2 className="font-semibold mb-4">비용 정보 (선택)</h2>
            <p className="text-sm text-muted mb-4">1인 기준 예상 비용을 입력하세요</p>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="green_fee" className="block text-sm font-medium mb-2">
                  그린피
                </label>
                <input
                  id="green_fee"
                  name="green_fee"
                  type="number"
                  value={formData.green_fee}
                  onChange={handleChange}
                  placeholder="0"
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label htmlFor="cart_fee" className="block text-sm font-medium mb-2">
                  카트비
                </label>
                <input
                  id="cart_fee"
                  name="cart_fee"
                  type="number"
                  value={formData.cart_fee}
                  onChange={handleChange}
                  placeholder="0"
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label htmlFor="caddie_fee" className="block text-sm font-medium mb-2">
                  캐디피
                </label>
                <input
                  id="caddie_fee"
                  name="caddie_fee"
                  type="number"
                  value={formData.caddie_fee}
                  onChange={handleChange}
                  placeholder="0"
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-3">
            <Link href="/join" className="btn btn-outline">
              취소
            </Link>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? '등록 중...' : '모집하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
