'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createProduct } from '@/lib/actions/products'
import { getUserLocation } from '@/lib/actions/location'
import { getClub } from '@/lib/actions/club-catalog'
import { getClubPriceGuide } from '@/lib/actions/club-price'
import ImageUpload from '@/components/ImageUpload'
import { ProductLocationSelector } from '@/components/location'
import ClubSelector, { SelectedClubDisplay } from '@/components/club/ClubSelector'
import type { GolfClubWithBrand, UsedPriceGuide, ClubType, ProductCondition } from '@/types/club'
import { CLUB_TYPE_LABELS } from '@/types/club'

const categories = [
  { id: 'driver', name: '드라이버' },
  { id: 'wood', name: '우드' },
  { id: 'iron', name: '아이언' },
  { id: 'putter', name: '퍼터' },
  { id: 'wedge', name: '웨지' },
  { id: 'set', name: '풀세트' },
  { id: 'bag', name: '골프백' },
  { id: 'wear', name: '골프웨어' },
  { id: 'etc', name: '기타' },
]

const conditions = [
  { id: 'S', name: 'S급', description: '거의 새것' },
  { id: 'A', name: 'A급', description: '상태 좋음' },
  { id: 'B', name: 'B급', description: '사용감 있음' },
  { id: 'C', name: 'C급', description: '사용감 많음' },
]

// 클럽 카탈로그 연동 가능한 카테고리
const catalogCategories: ClubType[] = ['driver', 'wood', 'iron', 'putter', 'wedge']

interface LocationData {
  address: string | null
  dong: string | null
  gu: string | null
  city: string | null
  lat: number | null
  lng: number | null
  useSellerLocation: boolean
}

function SellPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [sellerLocation, setSellerLocation] = useState<{
    address: string | null
    dong: string | null
    gu: string | null
    city: string | null
    lat: number | null
    lng: number | null
  } | null>(null)
  const [productLocation, setProductLocation] = useState<LocationData | null>(null)

  // 클럽 카탈로그 연동
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedCondition, setSelectedCondition] = useState<ProductCondition | ''>('')
  const [showClubSelector, setShowClubSelector] = useState(false)
  const [selectedClub, setSelectedClub] = useState<GolfClubWithBrand | null>(null)
  const [clubPriceGuide, setClubPriceGuide] = useState<UsedPriceGuide | null>(null)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')

  // 사용자 위치 정보 로드
  useEffect(() => {
    const loadLocation = async () => {
      const result = await getUserLocation()
      if (result.success && result.location) {
        setSellerLocation({
          address: result.location.address,
          dong: result.location.dong,
          gu: result.location.gu,
          city: result.location.city,
          lat: result.location.lat,
          lng: result.location.lng,
        })
      }
    }
    loadLocation()
  }, [])

  // URL 파라미터로 클럽 ID가 전달된 경우 해당 클럽 자동 선택
  useEffect(() => {
    const clubId = searchParams.get('club_id')
    if (clubId) {
      const loadClub = async () => {
        const club = await getClub(parseInt(clubId))
        if (club) {
          setSelectedClub(club)
          setSelectedCategory(club.club_type)
          const priceGuide = await getClubPriceGuide(club.id)
          setClubPriceGuide(priceGuide)

          // 자동으로 제목 설정
          const brandName = club.brand?.name_ko || club.brand?.name || ''
          const clubName = club.name_ko || club.name
          setTitle(`${brandName} ${clubName}`)
        }
      }
      loadClub()
    }
  }, [searchParams])

  // 클럽 선택 핸들러
  const handleClubSelect = (club: GolfClubWithBrand, priceGuide: UsedPriceGuide | null) => {
    setSelectedClub(club)
    setClubPriceGuide(priceGuide)

    // 제목 자동 설정
    const brandName = club.brand?.name_ko || club.brand?.name || ''
    const clubName = club.name_ko || club.name
    setTitle(`${brandName} ${clubName}`)

    // 상태에 따른 추천 가격 설정
    if (selectedCondition && priceGuide && priceGuide[selectedCondition]) {
      setPrice(priceGuide[selectedCondition]!.toString())
    }
  }

  // 상태 선택 시 추천 가격 업데이트
  const handleConditionChange = (conditionId: string) => {
    setSelectedCondition(conditionId as ProductCondition)
    if (clubPriceGuide && clubPriceGuide[conditionId as ProductCondition]) {
      setPrice(clubPriceGuide[conditionId as ProductCondition]!.toString())
    }
  }

  // 클럽 선택 해제
  const handleRemoveClub = () => {
    setSelectedClub(null)
    setClubPriceGuide(null)
    setTitle('')
    setPrice('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('images', JSON.stringify(images))

    // 클럽 카탈로그 연동 정보
    if (selectedClub) {
      formData.set('club_id', selectedClub.id.toString())
      formData.set('club_specs', JSON.stringify({
        brand: selectedClub.brand?.name || '',
        model_year: selectedClub.model_year,
        club_type: selectedClub.club_type,
        loft: selectedClub.loft,
        shaft_flex: selectedClub.shaft_flex,
      }))
    }

    // 위치 정보 추가
    if (productLocation) {
      formData.set('location_address', productLocation.address || '')
      formData.set('location_dong', productLocation.dong || '')
      formData.set('location_gu', productLocation.gu || '')
      formData.set('location_city', productLocation.city || '')
      formData.set('location_lat', productLocation.lat?.toString() || '')
      formData.set('location_lng', productLocation.lng?.toString() || '')
      formData.set('use_seller_location', productLocation.useSellerLocation ? 'true' : 'false')
      // 기존 location 필드도 동네 이름으로 설정 (호환성)
      formData.set('location', productLocation.dong || productLocation.gu || '')
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
                    checked={selectedCategory === cat.id}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                      // 카테고리 변경 시 선택된 클럽 초기화
                      if (selectedClub && selectedClub.club_type !== e.target.value) {
                        handleRemoveClub()
                      }
                    }}
                  />
                  <span className="font-medium">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 클럽 카탈로그 선택 (카탈로그 연동 가능한 카테고리인 경우) */}
          {selectedCategory && catalogCategories.includes(selectedCategory as ClubType) && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                클럽 선택 <span className="text-muted font-normal">(선택사항)</span>
              </label>

              {selectedClub ? (
                <SelectedClubDisplay
                  club={selectedClub}
                  priceGuide={clubPriceGuide}
                  condition={selectedCondition || undefined}
                  onRemove={handleRemoveClub}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClubSelector(true)}
                  className="w-full p-4 border-2 border-dashed rounded-lg text-muted hover:border-primary hover:text-primary transition-colors"
                >
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  클럽 카탈로그에서 선택하기
                  <br />
                  <span className="text-xs">스펙과 시세 정보가 자동으로 입력됩니다</span>
                </button>
              )}
            </div>
          )}

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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
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
                    checked={selectedCondition === cond.id}
                    onChange={() => handleConditionChange(cond.id)}
                  />
                  <span className="font-medium">{cond.name}</span>
                  <span className="text-xs text-muted">{cond.description}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 가격 */}
          <div className="mb-6">
            <label htmlFor="price" className="block text-sm font-medium mb-2">
              가격
              {clubPriceGuide && selectedCondition && clubPriceGuide[selectedCondition] && (
                <span className="text-primary font-normal ml-2">
                  (추천: {clubPriceGuide[selectedCondition]?.toLocaleString()}원)
                </span>
              )}
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
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">원</span>
            </div>
            {clubPriceGuide && selectedCondition && (
              <p className="text-xs text-muted mt-1">
                시세 기준 가격입니다. 상품 상태에 따라 조정하세요.
              </p>
            )}
          </div>

          {/* 거래 위치 */}
          <div className="mb-6">
            <ProductLocationSelector
              sellerLocation={sellerLocation}
              onChange={setProductLocation}
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

      {/* 클럽 선택 모달 */}
      <ClubSelector
        isOpen={showClubSelector}
        onClose={() => setShowClubSelector(false)}
        onSelect={handleClubSelect}
        initialType={selectedCategory as ClubType}
      />
    </div>
  )
}

export default function SellPage() {
  return (
    <Suspense fallback={<div className="py-12"><div className="container max-w-2xl"><div className="text-center">로딩 중...</div></div></div>}>
      <SellPageContent />
    </Suspense>
  )
}
