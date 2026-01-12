'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createProduct } from '@/lib/actions/products'
import ImageUpload from '@/components/ImageUpload'
import LocationPicker, { Location } from '@/components/LocationPicker'

const categories = [
  { id: 'driver', name: '드라이버' },
  { id: 'iron', name: '아이언' },
  { id: 'putter', name: '퍼터' },
  { id: 'wedge', name: '웨지' },
  { id: 'set', name: '풀세트' },
  { id: 'etc', name: '기타' },
]

const conditions = [
  { id: 'S', name: 'S급', description: '거의 새것' },
  { id: 'A', name: 'A급', description: '상태 좋음' },
  { id: 'B', name: 'B급', description: '사용감 있음' },
  { id: 'C', name: 'C급', description: '사용감 많음' },
]

export default function SellPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [location, setLocation] = useState<Location | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('images', JSON.stringify(images))

    // 위치 정보 추가
    if (location) {
      formData.set('location', location.address)
      formData.set('latitude', location.lat.toString())
      formData.set('longitude', location.lng.toString())
    }

    const result = await createProduct(formData)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else if (result.data) {
      router.push(`/market/${result.data.id}`)
    }
  }

  return (
    <div className="py-12">
      <div className="container max-w-2xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/market"
            className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </Link>
          <h1 className="text-3xl font-bold">상품 등록</h1>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="card">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* 이미지 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              상품 이미지 (최대 5장)
            </label>
            <ImageUpload
              images={images}
              onChange={setImages}
              maxImages={5}
              bucket="products"
            />
          </div>

          {/* 카테고리 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">카테고리</label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="relative flex items-center justify-center p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.id}
                    className="sr-only"
                    required
                  />
                  <span className="font-medium">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              제목
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="상품명을 입력하세요"
              className="input"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 가격 */}
          <div className="mb-6">
            <label htmlFor="price" className="block text-sm font-medium mb-2">
              가격
            </label>
            <div className="relative">
              <input
                id="price"
                name="price"
                type="number"
                placeholder="0"
                className="input pr-12"
                required
                min="0"
                disabled={isSubmitting}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">원</span>
            </div>
          </div>

          {/* 상태 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">상태</label>
            <div className="grid grid-cols-4 gap-3">
              {conditions.map((cond) => (
                <label
                  key={cond.id}
                  className="relative flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="condition"
                    value={cond.id}
                    className="sr-only"
                    required
                  />
                  <span className="font-medium">{cond.name}</span>
                  <span className="text-xs text-muted">{cond.description}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 거래 희망 장소 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              거래 희망 장소
            </label>
            <LocationPicker
              value={location}
              onChange={setLocation}
              placeholder="지도에서 거래 장소를 선택하세요"
            />
            <p className="mt-2 text-xs text-muted">
              정확한 주소는 구매자와 채팅 시 공유됩니다
            </p>
          </div>

          {/* 설명 */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              상품 설명
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="상품에 대한 자세한 설명을 입력하세요"
              className="input min-h-[200px] resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3">
            <Link href="/market" className="btn btn-outline">
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
