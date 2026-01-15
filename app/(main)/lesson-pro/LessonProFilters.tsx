'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface Option {
  value: string
  label: string
}

interface LessonProFiltersProps {
  regions: Option[]
  specialties: Option[]
  lessonTypes: Option[]
}

export default function LessonProFilters({
  regions,
  specialties,
  lessonTypes,
}: LessonProFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/lesson-pro?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters('search', search)
  }

  const sortOptions = [
    { value: 'rating', label: '평점순' },
    { value: 'review_count', label: '리뷰많은순' },
    { value: 'price_low', label: '가격낮은순' },
    { value: 'price_high', label: '가격높은순' },
  ]

  return (
    <div className="mb-8 space-y-4">
      {/* 검색 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="프로 이름 또는 키워드로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <svg
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button type="submit" className="btn btn-primary">
          검색
        </button>
      </form>

      {/* 필터 */}
      <div className="flex flex-wrap gap-3">
        {/* 지역 */}
        <select
          value={searchParams.get('region') || ''}
          onChange={(e) => updateFilters('region', e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">지역 전체</option>
          {regions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* 전문 분야 */}
        <select
          value={searchParams.get('specialty') || ''}
          onChange={(e) => updateFilters('specialty', e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">전문 분야 전체</option>
          {specialties.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* 레슨 유형 */}
        <select
          value={searchParams.get('lessonType') || ''}
          onChange={(e) => updateFilters('lessonType', e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">레슨 유형 전체</option>
          {lessonTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* 정렬 */}
        <select
          value={searchParams.get('sortBy') || 'rating'}
          onChange={(e) => updateFilters('sortBy', e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 현재 적용된 필터 태그 */}
      {(searchParams.get('region') || searchParams.get('specialty') || searchParams.get('lessonType') || searchParams.get('search')) && (
        <div className="flex flex-wrap gap-2">
          {searchParams.get('search') && (
            <FilterTag
              label={`검색: ${searchParams.get('search')}`}
              onRemove={() => {
                setSearch('')
                updateFilters('search', '')
              }}
            />
          )}
          {searchParams.get('region') && (
            <FilterTag
              label={regions.find((r) => r.value === searchParams.get('region'))?.label || ''}
              onRemove={() => updateFilters('region', '')}
            />
          )}
          {searchParams.get('specialty') && (
            <FilterTag
              label={specialties.find((s) => s.value === searchParams.get('specialty'))?.label || ''}
              onRemove={() => updateFilters('specialty', '')}
            />
          )}
          {searchParams.get('lessonType') && (
            <FilterTag
              label={lessonTypes.find((l) => l.value === searchParams.get('lessonType'))?.label || ''}
              onRemove={() => updateFilters('lessonType', '')}
            />
          )}
          <button
            onClick={() => router.push('/lesson-pro')}
            className="text-sm text-muted hover:text-foreground"
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  )
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-primary-dark">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  )
}
