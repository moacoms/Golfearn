'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const statusOptions = [
  { id: 'all', name: '전체' },
  { id: 'selling', name: '판매중' },
  { id: 'reserved', name: '예약중' },
  { id: 'sold', name: '판매완료' },
]

const sortOptions = [
  { id: 'latest', name: '최신순' },
  { id: 'price_low', name: '가격 낮은순' },
  { id: 'price_high', name: '가격 높은순' },
  { id: 'distance', name: '가까운순' },
]

function MarketFiltersInner({
  categories,
}: {
  categories: { id: string; name: string }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') || 'all'
  const currentStatus = searchParams.get('status') || 'all'
  const currentSearch = searchParams.get('search') || ''
  const currentSort = searchParams.get('sort') || 'latest'
  const currentLat = searchParams.get('lat')
  const currentLng = searchParams.get('lng')

  const [search, setSearch] = useState(currentSearch)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // URL 검색어가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    setSearch(currentSearch)
  }, [currentSearch])

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value === 'all' || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/market?${params.toString()}`)
  }, [searchParams, router])

  // 현재 위치 가져오기
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('이 브라우저에서는 위치 서비스를 지원하지 않습니다.')
      return
    }

    setIsLoadingLocation(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const params = new URLSearchParams(searchParams)
        params.set('lat', latitude.toString())
        params.set('lng', longitude.toString())
        params.set('sort', 'distance')
        router.push(`/market?${params.toString()}`)
        setIsLoadingLocation(false)
      },
      (error) => {
        console.error('위치 가져오기 실패:', error)
        setLocationError('위치를 가져올 수 없습니다.')
        setIsLoadingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [searchParams, router])

  // 가까운순 선택 시 위치 권한 요청
  const handleSortChange = useCallback((value: string) => {
    if (value === 'distance' && !currentLat) {
      getCurrentLocation()
    } else {
      updateFilter('sort', value)
    }
  }, [currentLat, getCurrentLocation, updateFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('search', search.trim())
  }

  const clearSearch = () => {
    setSearch('')
    updateFilter('search', '')
  }

  return (
    <div className="card mb-8">
      <div className="flex flex-col gap-4">
        {/* 검색 */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="상품명, 설명으로 검색"
            className="input pl-10 pr-20"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 text-muted hover:text-foreground"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark"
            >
              검색
            </button>
          </div>
        </form>

        {/* 필터 */}
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">카테고리</label>
            <select
              className="input"
              value={currentCategory}
              onChange={(e) => updateFilter('category', e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">판매 상태</label>
            <select
              className="input"
              value={currentStatus}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">정렬</label>
            <select
              className="input"
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              disabled={isLoadingLocation}
            >
              {sortOptions.map((sort) => (
                <option key={sort.id} value={sort.id}>
                  {sort.name}
                  {sort.id === 'distance' && isLoadingLocation ? ' (위치 확인중...)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 위치 오류 메시지 */}
        {locationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {locationError}
          </div>
        )}

        {/* 현재 위치로 검색 버튼 */}
        {!currentLat && (
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            className="btn btn-outline text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {isLoadingLocation ? '위치 확인중...' : '내 위치 근처 상품 보기'}
          </button>
        )}

        {/* 활성 필터 표시 */}
        {(currentSearch || currentCategory !== 'all' || currentStatus !== 'all') && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {currentSearch && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                &quot;{currentSearch}&quot;
                <button onClick={clearSearch} className="hover:text-primary-dark">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {currentCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                {categories.find(c => c.id === currentCategory)?.name}
                <button onClick={() => updateFilter('category', 'all')} className="hover:text-gray-900">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {currentStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                {statusOptions.find(s => s.id === currentStatus)?.name}
                <button onClick={() => updateFilter('status', 'all')} className="hover:text-gray-900">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            <button
              onClick={() => router.push('/market')}
              className="text-sm text-muted hover:text-foreground underline"
            >
              전체 초기화
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MarketFilters({
  categories,
}: {
  categories: { id: string; name: string }[]
}) {
  return (
    <Suspense fallback={<div className="card mb-8 h-32 animate-pulse bg-gray-100" />}>
      <MarketFiltersInner categories={categories} />
    </Suspense>
  )
}
