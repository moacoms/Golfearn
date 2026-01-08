'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const statusOptions = [
  { id: 'all', name: '전체' },
  { id: 'selling', name: '판매중' },
  { id: 'reserved', name: '예약중' },
  { id: 'sold', name: '판매완료' },
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

  const [search, setSearch] = useState(currentSearch)

  // URL 검색어가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    setSearch(currentSearch)
  }, [currentSearch])

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value === 'all' || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/market?${params.toString()}`)
  }

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
        </div>

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
