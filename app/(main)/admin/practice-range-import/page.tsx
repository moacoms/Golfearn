'use client'

import { useState, useTransition } from 'react'
import { importPracticeRangeFromPlace, ImportPracticeRangeData } from '@/lib/actions/practice-ranges'
import { practiceRangeRegionOptions } from '@/lib/practice-range-constants'

interface PlaceResult {
  name: string
  address: string
  place_id: string
  lat: number
  lng: number
  rating: number
  review_count: number
  types: string[]
  photo_reference: string | null
}

export default function PracticeRangeImportPage() {
  const [query, setQuery] = useState('골프 연습장')
  const [region, setRegion] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [importedIds, setImportedIds] = useState<string[]>([])

  const handleSearch = async () => {
    setIsSearching(true)
    setMessage('')

    try {
      const params = new URLSearchParams()
      params.set('query', query)
      if (region) params.set('region', region)

      const response = await fetch(`/api/places/lesson-search?${params}`)
      const data = await response.json()

      if (data.error) {
        setMessage(`검색 오류: ${data.error}`)
        setResults([])
      } else {
        setResults(data.results || [])
        if (data.results?.length === 0) {
          setMessage('검색 결과가 없습니다.')
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      setMessage('검색 중 오류가 발생했습니다.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleImport = async (place: PlaceResult) => {
    startTransition(async () => {
      // Google Places Details API로 전화번호 가져오기
      let phone = ''
      try {
        const detailsResponse = await fetch(`/api/places/details?place_id=${place.place_id}`)
        const detailsData = await detailsResponse.json()
        if (detailsData.result?.phone) {
          phone = detailsData.result.phone
        }
      } catch (e) {
        console.error('Failed to get place details:', e)
      }

      // 사진 URL 생성
      let photoUrl = ''
      if (place.photo_reference) {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photo_reference}&key=${apiKey}`
      }

      const data: ImportPracticeRangeData = {
        name: place.name,
        address: place.address,
        placeId: place.place_id,
        lat: place.lat,
        lng: place.lng,
        rating: place.rating,
        reviewCount: place.review_count,
        phone: phone || undefined,
        photoUrl: photoUrl || undefined,
      }

      const result = await importPracticeRangeFromPlace(data)

      if (result.error) {
        setMessage(result.error)
      } else {
        setMessage(`"${place.name}" 등록 완료!`)
        setImportedIds([...importedIds, place.place_id])
      }
    })
  }

  const handleImportAll = async () => {
    const unimportedResults = results.filter(r => !importedIds.includes(r.place_id))

    for (const place of unimportedResults) {
      await handleImport(place)
    }
  }

  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">연습장 데이터 가져오기</h1>
        <p className="text-muted mb-8">Google Places에서 골프 연습장을 검색하여 등록합니다</p>

        {/* 검색 폼 */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">검색어</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="골프 연습장, 스크린골프, 골프존..."
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">지역</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              >
                <option value="">전체 지역</option>
                {practiceRangeRegionOptions.map((option) => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="btn btn-primary w-full"
          >
            {isSearching ? '검색 중...' : '검색'}
          </button>
        </div>

        {/* 메시지 */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('오류') || message.includes('실패') || message.includes('이미')
              ? 'bg-red-50 text-red-600'
              : 'bg-green-50 text-green-600'
          }`}>
            {message}
          </div>
        )}

        {/* 검색 결과 */}
        {results.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted">검색 결과: {results.length}개</p>
              <button
                onClick={handleImportAll}
                disabled={isPending || results.every(r => importedIds.includes(r.place_id))}
                className="btn btn-outline"
              >
                전체 등록
              </button>
            </div>

            <div className="space-y-4">
              {results.map((place) => {
                const isImported = importedIds.includes(place.place_id)
                return (
                  <div
                    key={place.place_id}
                    className={`card p-4 flex items-start gap-4 ${isImported ? 'opacity-50' : ''}`}
                  >
                    {/* 이미지 */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {place.photo_reference ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=100&photo_reference=${place.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                          alt={place.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{place.name}</h3>
                      <p className="text-sm text-muted truncate">{place.address}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {place.rating > 0 && (
                          <span className="flex items-center gap-1 text-sm">
                            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                            {place.rating.toFixed(1)}
                            <span className="text-muted">({place.review_count})</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 버튼 */}
                    <button
                      onClick={() => handleImport(place)}
                      disabled={isPending || isImported}
                      className={`btn ${isImported ? 'btn-outline' : 'btn-primary'} flex-shrink-0`}
                    >
                      {isImported ? '등록됨' : isPending ? '등록 중...' : '등록'}
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* 안내 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">추천 검색어</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {['골프 연습장', '스크린골프', '골프존', '실내골프', '야외 연습장'].map((keyword) => (
              <button
                key={keyword}
                onClick={() => setQuery(keyword)}
                className="px-3 py-1 bg-white border rounded-full text-sm hover:border-primary"
              >
                {keyword}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted">
            * Google Places API 사용량에 따라 비용이 발생할 수 있습니다<br />
            * 등록된 연습장은 /practice-range 페이지에서 확인할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  )
}
