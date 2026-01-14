'use client'

import { useState, useEffect, useRef } from 'react'

interface GolfCourseSearchResult {
  name: string
  address: string
  place_id: string
  lat: number
  lng: number
}

interface GolfCourseSearchProps {
  value: string
  address: string
  onChange: (name: string, address: string, lat?: number, lng?: number) => void
}

export default function GolfCourseSearch({ value, address, onChange }: GolfCourseSearchProps) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<GolfCourseSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // 외부 value 변경 시 동기화
  useEffect(() => {
    setQuery(value)
  }, [value])

  // 외부 클릭 시 결과 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        resultsRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        !resultsRef.current.contains(e.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 검색
  const searchGolfCourses = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)

    try {
      // 서버 API 라우트 사용 (CORS 문제 회피)
      const response = await fetch(`/api/places/search?query=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()

      if (data.results) {
        setResults(data.results)
      }
    } catch (error) {
      console.error('Golf course search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // 디바운싱 검색
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    setShowResults(true)

    // 직접 입력 시에도 상위 컴포넌트에 알림
    onChange(newQuery, address)

    // 디바운싱
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchGolfCourses(newQuery)
    }, 300)
  }

  // 결과 선택
  const handleSelect = (result: GolfCourseSearchResult) => {
    setQuery(result.name)
    onChange(result.name, result.address, result.lat, result.lng)
    setShowResults(false)
    setResults([])
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setShowResults(true)}
        placeholder="골프장명을 입력하세요 (예: 레이크힐스)"
        className="input"
        autoComplete="off"
      />

      {/* 검색 중 표시 */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 검색 결과 */}
      {showResults && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {results.map((result) => (
            <button
              key={result.place_id}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors"
            >
              <p className="font-medium">{result.name}</p>
              <p className="text-sm text-gray-500 truncate">{result.address}</p>
            </button>
          ))}
        </div>
      )}

      {/* 검색 결과 없음 */}
      {showResults && query.length >= 2 && !isLoading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center text-gray-500">
          검색 결과가 없습니다. 직접 입력해주세요.
        </div>
      )}
    </div>
  )
}
