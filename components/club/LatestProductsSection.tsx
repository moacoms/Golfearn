'use client'

import { useState, useEffect } from 'react'

interface ShoppingItem {
  title: string
  link: string
  image: string
  lprice: number
  hprice: number
  mallName: string
  productId: string
  brand: string
}

interface LatestProductsSectionProps {
  clubType: 'driver' | 'wood' | 'hybrid' | 'iron' | 'wedge' | 'putter'
  budget?: number
}

// 클럽 타입별 한글명
const CLUB_TYPE_KOREAN: Record<string, string> = {
  driver: '드라이버',
  wood: '페어웨이우드',
  hybrid: '하이브리드',
  iron: '아이언세트',
  wedge: '웨지',
  putter: '퍼터',
}

// 주요 골프 브랜드
const MAJOR_BRANDS = [
  'TaylorMade',
  'Callaway',
  'Titleist',
  'Ping',
  'Cobra',
  'Mizuno',
  'Srixon',
  'Cleveland',
]

export default function LatestProductsSection({ clubType, budget }: LatestProductsSectionProps) {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<'2025' | '2026'>('2025')

  useEffect(() => {
    const fetchLatestProducts = async () => {
      setLoading(true)

      try {
        // 최신 연도 + 클럽 타입으로 검색
        const clubTypeKorean = CLUB_TYPE_KOREAN[clubType]
        const searchQuery = `${selectedYear} ${clubTypeKorean} 골프`

        const params = new URLSearchParams({
          query: searchQuery,
          display: '12',
          sort: 'sim', // 정확도순
          clubType: clubType,
        })

        const response = await fetch(`/api/naver-shopping?${params}`)

        if (!response.ok) {
          throw new Error('상품 정보를 불러오는데 실패했습니다.')
        }

        const data = await response.json()

        // 예산 필터링 (있는 경우)
        let filteredItems = data.items || []
        if (budget) {
          filteredItems = filteredItems.filter((item: ShoppingItem) =>
            item.lprice <= budget * 1.2 // 예산의 120%까지 허용
          )
        }

        setItems(filteredItems)
      } catch (err) {
        console.error('Latest products fetch error:', err)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchLatestProducts()
  }, [clubType, budget, selectedYear])

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2 text-muted">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>최신 상품 검색 중...</span>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🆕</span>
          <h3 className="text-lg font-bold text-gray-800">
            {selectedYear}년 신상품 {CLUB_TYPE_KOREAN[clubType]}
          </h3>
        </div>

        {/* 연도 선택 탭 */}
        <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
          {(['2025', '2026'] as const).map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedYear === year
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {year}년
            </button>
          ))}
        </div>
      </div>

      {/* 상품 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.slice(0, 8).map((item, index) => (
          <a
            key={item.productId || index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
          >
            {/* 이미지 */}
            <div className="relative aspect-square bg-gray-100">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              )}
              {/* 순위 배지 */}
              {index < 3 && (
                <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-400 text-yellow-900' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  'bg-orange-300 text-orange-800'
                }`}>
                  {index + 1}
                </div>
              )}
            </div>

            {/* 정보 */}
            <div className="p-3">
              <p className="text-xs text-muted mb-1 truncate">{item.mallName}</p>
              <h4 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <p className="text-primary font-bold">
                {formatPrice(item.lprice)}원
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* 더보기 링크 */}
      <a
        href={`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(
          `${selectedYear} ${CLUB_TYPE_KOREAN[clubType]} 골프`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-4 pt-4 border-t border-blue-100"
      >
        네이버 쇼핑에서 더 많은 {selectedYear}년 {CLUB_TYPE_KOREAN[clubType]} 보기 →
      </a>
    </div>
  )
}
