'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { getBrands, searchClubs, getClubsByType } from '@/lib/actions/club-catalog'
import { getClubPriceGuide } from '@/lib/actions/club-price'
import type { GolfClubBrand, GolfClubWithBrand, ClubType, UsedPriceGuide, ProductCondition } from '@/types/club'
import { CLUB_TYPE_LABELS, CONDITION_LABELS } from '@/types/club'

interface ClubSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (club: GolfClubWithBrand, priceGuide: UsedPriceGuide | null) => void
  initialType?: ClubType
}

export default function ClubSelector({ isOpen, onClose, onSelect, initialType }: ClubSelectorProps) {
  const [brands, setBrands] = useState<GolfClubBrand[]>([])
  const [clubs, setClubs] = useState<GolfClubWithBrand[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<ClubType | undefined>(initialType)
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>()

  // 브랜드 목록 로드
  useEffect(() => {
    if (isOpen) {
      getBrands().then(setBrands)
    }
  }, [isOpen])

  // 클럽 타입별 목록 로드
  useEffect(() => {
    if (isOpen && selectedType) {
      setLoading(true)
      getClubsByType(selectedType, 20).then((data) => {
        setClubs(data)
        setLoading(false)
      })
    }
  }, [isOpen, selectedType])

  // 검색 핸들러
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    if (query.length >= 2) {
      setLoading(true)
      const results = await searchClubs(query, 20)
      setClubs(results)
      setLoading(false)
    } else if (selectedType) {
      setLoading(true)
      const data = await getClubsByType(selectedType, 20)
      setClubs(data)
      setLoading(false)
    }
  }, [selectedType])

  // 클럽 선택 핸들러
  const handleSelectClub = async (club: GolfClubWithBrand) => {
    const priceGuide = await getClubPriceGuide(club.id)
    onSelect(club, priceGuide)
    onClose()
  }

  // 필터링된 클럽
  const filteredClubs = clubs.filter((club) => {
    if (selectedBrand && club.brand_id !== selectedBrand) return false
    return true
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">클럽 선택</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 검색 & 필터 */}
        <div className="p-4 border-b space-y-4">
          {/* 검색 */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="클럽명, 브랜드로 검색"
              className="input w-full pl-10"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* 클럽 타입 필터 */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(CLUB_TYPE_LABELS).map(([type, label]) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type as ClubType)
                  setSearchQuery('')
                }}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedType === type
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 브랜드 필터 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBrand(undefined)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                !selectedBrand
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              전체 브랜드
            </button>
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(brand.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedBrand === brand.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {brand.name_ko || brand.name}
              </button>
            ))}
          </div>
        </div>

        {/* 클럽 목록 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-5 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredClubs.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-muted">
                {searchQuery
                  ? '검색 결과가 없습니다'
                  : '클럽 종류를 선택하거나 검색해주세요'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredClubs.map((club) => {
                const name = club.name_ko || club.name
                const brand = club.brand?.name_ko || club.brand?.name || ''
                const imageUrl = club.image_urls?.[0] || '/images/club-placeholder.png'

                return (
                  <button
                    key={club.id}
                    onClick={() => handleSelectClub(club)}
                    className="w-full flex items-center gap-4 p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-contain"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted">{brand}</p>
                      <h3 className="font-medium truncate">{name}</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted">
                          {CLUB_TYPE_LABELS[club.club_type]}
                        </span>
                        {club.model_year && (
                          <span className="text-muted">· {club.model_year}년</span>
                        )}
                        {club.rating > 0 && (
                          <span className="text-yellow-600">
                            ★ {club.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    {club.current_price && (
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-primary">
                          {club.current_price.toLocaleString()}원
                        </p>
                        {club.used_price_guide?.A && (
                          <p className="text-xs text-muted">
                            중고 A급 ~{club.used_price_guide.A.toLocaleString()}원
                          </p>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 직접 입력 옵션 */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full text-center text-muted hover:text-primary text-sm"
          >
            목록에 없는 클럽은 직접 입력하기
          </button>
        </div>
      </div>
    </div>
  )
}

// 선택된 클럽 표시 컴포넌트
interface SelectedClubDisplayProps {
  club: GolfClubWithBrand
  priceGuide: UsedPriceGuide | null
  condition?: ProductCondition
  onRemove: () => void
}

export function SelectedClubDisplay({ club, priceGuide, condition, onRemove }: SelectedClubDisplayProps) {
  const name = club.name_ko || club.name
  const brand = club.brand?.name_ko || club.brand?.name || ''
  const imageUrl = club.image_urls?.[0] || '/images/club-placeholder.png'

  // 선택한 상태에 따른 추천 가격
  const suggestedPrice = condition && priceGuide ? priceGuide[condition] : null

  return (
    <div className="border rounded-lg p-4 bg-primary/5 border-primary">
      <div className="flex items-start gap-4">
        <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain"
            sizes="80px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-primary font-medium">선택된 클럽</p>
          <p className="text-xs text-muted">{brand}</p>
          <h3 className="font-bold truncate">{name}</h3>
          <p className="text-sm text-muted">
            {CLUB_TYPE_LABELS[club.club_type]}
            {club.model_year && ` · ${club.model_year}년`}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="p-1 hover:bg-white rounded transition-colors"
          title="선택 해제"
        >
          <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 시세 가이드 */}
      {priceGuide && Object.keys(priceGuide).length > 0 && (
        <div className="mt-4 pt-4 border-t border-primary/20">
          <p className="text-sm font-medium mb-2">중고 시세 가이드</p>
          <div className="grid grid-cols-4 gap-2">
            {(['S', 'A', 'B', 'C'] as const).map((cond) => {
              const price = priceGuide[cond]
              if (!price) return null

              const isSelected = condition === cond

              return (
                <div
                  key={cond}
                  className={`text-center p-2 rounded ${
                    isSelected ? 'bg-primary text-white' : 'bg-white'
                  }`}
                >
                  <div className="font-bold text-xs">{CONDITION_LABELS[cond].name}</div>
                  <div className={`text-sm ${isSelected ? 'text-white' : 'text-primary'}`}>
                    {(price / 10000).toFixed(0)}만원
                  </div>
                </div>
              )
            })}
          </div>
          {suggestedPrice && (
            <p className="text-xs text-center mt-2 text-muted">
              선택하신 상태({CONDITION_LABELS[condition!].name}) 기준 추천가: {suggestedPrice.toLocaleString()}원
            </p>
          )}
        </div>
      )}
    </div>
  )
}
