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

interface LowestPriceSectionProps {
  clubName: string
  brandName?: string
}

export default function LowestPriceSection({ clubName, brandName }: LowestPriceSectionProps) {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true)
      setError(null)

      try {
        // 검색어 구성: 브랜드명 + 클럽명 + "골프"
        const searchQuery = brandName
          ? `${brandName} ${clubName} 골프`
          : `${clubName} 골프`

        const response = await fetch(
          `/api/naver-shopping?query=${encodeURIComponent(searchQuery)}&display=5&sort=asc`
        )

        if (!response.ok) {
          throw new Error('가격 정보를 불러오는데 실패했습니다.')
        }

        const data = await response.json()
        setItems(data.items || [])
      } catch (err) {
        console.error('Price fetch error:', err)
        setError('가격 정보를 불러올 수 없습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (clubName) {
      fetchPrices()
    }
  }, [clubName, brandName])

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  if (loading) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-muted">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
          <span className="text-sm">최저가 검색 중...</span>
        </div>
      </div>
    )
  }

  if (error || items.length === 0) {
    return null // 에러나 결과 없으면 표시 안함
  }

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span className="font-semibold text-blue-800">최저가 비교</span>
        <span className="text-xs text-muted">(네이버 쇼핑)</span>
      </div>

      <div className="space-y-2">
        {items.slice(0, 3).map((item, index) => (
          <a
            key={item.productId || index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* 순위 배지 */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                index === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>

              {/* 상품 이미지 */}
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-12 h-12 object-cover rounded flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              )}

              {/* 상품 정보 */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-muted">{item.mallName}</p>
              </div>
            </div>

            {/* 가격 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`font-bold ${index === 0 ? 'text-red-600 text-lg' : 'text-foreground'}`}>
                {formatPrice(item.lprice)}원
              </span>
              <svg className="w-4 h-4 text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        ))}
      </div>

      {/* 더 많은 상품 보기 링크 */}
      <a
        href={`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(brandName ? `${brandName} ${clubName}` : clubName)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-3 pt-3 border-t border-blue-100"
      >
        네이버 쇼핑에서 더 보기 →
      </a>
    </div>
  )
}
