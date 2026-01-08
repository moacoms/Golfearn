'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProduct, updateProduct } from '@/lib/actions/products'
import ImageUpload from '@/components/ImageUpload'

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

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productId, setProductId] = useState<number | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    condition: '',
    location: '',
  })

  useEffect(() => {
    const loadProduct = async () => {
      const { id } = await params
      const numId = parseInt(id)
      setProductId(numId)

      if (isNaN(numId)) {
        setError('잘못된 상품입니다.')
        setIsLoading(false)
        return
      }

      const product = await getProduct(numId)

      if (!product) {
        setError('상품을 찾을 수 없습니다.')
        setIsLoading(false)
        return
      }

      setFormData({
        title: product.title,
        description: product.description || '',
        category: product.category,
        price: product.price.toString(),
        condition: product.condition || '',
        location: product.location || '',
      })
      setImages(product.images || [])
      setIsLoading(false)
    }

    loadProduct()
  }, [params])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!productId) return

    setIsSubmitting(true)
    setError(null)

    const form = new FormData()
    form.append('title', formData.title)
    form.append('description', formData.description)
    form.append('category', formData.category)
    form.append('price', formData.price)
    form.append('condition', formData.condition)
    form.append('location', formData.location)
    form.append('images', JSON.stringify(images))

    const result = await updateProduct(productId, form)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      router.push(`/market/${productId}`)
    }
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

  if (error && !formData.title) {
    return (
      <div className="py-12">
        <div className="container max-w-2xl">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Link href="/market" className="btn btn-outline">
              목록으로
            </Link>
          </div>
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
            href={`/market/${productId}`}
            className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            돌아가기
          </Link>
          <h1 className="text-3xl font-bold">상품 수정</h1>
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
                  className={`relative flex items-center justify-center p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors ${
                    formData.category === cat.id ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.id}
                    checked={formData.category === cat.id}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                  className={`relative flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors ${
                    formData.condition === cond.id ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="condition"
                    value={cond.id}
                    checked={formData.condition === cond.id}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="sr-only"
                    required
                  />
                  <span className="font-medium">{cond.name}</span>
                  <span className="text-xs text-muted">{cond.description}</span>
                </label>
              ))}
            </div>
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

          {/* 설명 */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              상품 설명
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="상품에 대한 자세한 설명을 입력하세요"
              className="input min-h-[200px] resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3">
            <Link href={`/market/${productId}`} className="btn btn-outline">
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? '수정 중...' : '수정하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
