'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface FilterOption {
  value: string
  label: string
}

interface PracticeRangeFiltersProps {
  regions: FilterOption[]
  facilities: FilterOption[]
}

export default function PracticeRangeFilters({
  regions,
  facilities,
}: PracticeRangeFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/practice-range?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('search', search)
  }

  const clearFilters = () => {
    setSearch('')
    router.push('/practice-range')
  }

  const hasFilters = searchParams.get('region') || searchParams.get('facility') || searchParams.get('search')

  return (
    <div className="mb-8">
      {/* 검색 */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="연습장 이름 또는 지역으로 검색"
            className="w-full px-4 py-3 pr-12 border rounded-lg"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* 필터 */}
      <div className="flex flex-wrap gap-3">
        {/* 지역 필터 */}
        <select
          value={searchParams.get('region') || ''}
          onChange={(e) => updateFilter('region', e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="">전체 지역</option>
          {regions.map((region) => (
            <option key={region.value} value={region.value}>
              {region.label}
            </option>
          ))}
        </select>

        {/* 시설 필터 */}
        <select
          value={searchParams.get('facility') || ''}
          onChange={(e) => updateFilter('facility', e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="">시설 전체</option>
          {facilities.map((facility) => (
            <option key={facility.value} value={facility.value}>
              {facility.label}
            </option>
          ))}
        </select>

        {/* 필터 초기화 */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-muted hover:text-foreground"
          >
            필터 초기화
          </button>
        )}
      </div>
    </div>
  )
}
