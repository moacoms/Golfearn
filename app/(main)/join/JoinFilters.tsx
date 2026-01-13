'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LocationFilterChip } from '@/components/location'

interface UserLocation {
  dong: string | null
  gu: string | null
  city: string | null
  lat: number | null
  lng: number | null
  range: number
}

const dateOptions = [
  { id: 'all', name: '전체' },
  { id: 'today', name: '오늘' },
  { id: 'week', name: '이번주' },
  { id: 'nextweek', name: '다음주' },
]

const scoreOptions = [
  { id: 'all', name: '전체' },
  { id: '100', name: '100타+' },
  { id: '110', name: '110타+' },
  { id: '120', name: '120타+' },
]

const statusOptions = [
  { id: 'all', name: '전체' },
  { id: 'recruiting', name: '모집중' },
]

function JoinFiltersInner({
  userLocation,
  onLocationChange,
}: {
  userLocation?: UserLocation | null
  onLocationChange?: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentDate = searchParams.get('date') || 'all'
  const currentScore = searchParams.get('score') || 'all'
  const currentStatus = searchParams.get('status') || 'all'
  const currentSearch = searchParams.get('search') || ''

  const [search, setSearch] = useState(currentSearch)

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
    router.push(`/join?${params.toString()}`)
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
        {/* 위치 필터 */}
        <div className="flex items-center gap-3">
          <LocationFilterChip
            userLocation={userLocation}
            onLocationChange={onLocationChange}
          />
          <span className="text-sm text-muted">
            {userLocation?.dong ? `${userLocation.dong} 주변 조인` : '전국 조인'}
          </span>
        </div>

        {/* 검색 */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="골프장명, 제목으로 검색"
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
          {/* 날짜 필터 */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-2">날짜</label>
            <select
              className="input"
              value={currentDate}
              onChange={(e) => updateFilter('date', e.target.value)}
            >
              {dateOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          {/* 실력 필터 */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-2">실력</label>
            <select
              className="input"
              value={currentScore}
              onChange={(e) => updateFilter('score', e.target.value)}
            >
              {scoreOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          {/* 상태 필터 */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-2">상태</label>
            <select
              className="input"
              value={currentStatus}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              {statusOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 활성 필터 표시 */}
        {(currentSearch || currentDate !== 'all' || currentScore !== 'all' || currentStatus !== 'all') && (
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
            {currentDate !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                {dateOptions.find((d) => d.id === currentDate)?.name}
                <button onClick={() => updateFilter('date', 'all')} className="hover:text-gray-900">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {currentScore !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                {scoreOptions.find((s) => s.id === currentScore)?.name}
                <button onClick={() => updateFilter('score', 'all')} className="hover:text-gray-900">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            <button
              onClick={() => router.push('/join')}
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

export default function JoinFilters({
  userLocation,
  onLocationChange,
}: {
  userLocation?: UserLocation | null
  onLocationChange?: () => void
}) {
  return (
    <Suspense fallback={<div className="card mb-8 h-32 animate-pulse bg-gray-100" />}>
      <JoinFiltersInner userLocation={userLocation} onLocationChange={onLocationChange} />
    </Suspense>
  )
}
