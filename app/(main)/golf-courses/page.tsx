'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface GolfCourse {
  place_id: string
  name: string
  address: string
  lat: number
  lng: number
  rating: number | null
  ratings_total: number
  photo_reference: string | null
  open_now: boolean | null
  business_status: string | null
  distance: number
}

// 한국 주요 도시/지역 좌표
const KOREA_REGIONS = [
  { name: '서울', lat: 37.5665, lng: 126.978 },
  { name: '경기 북부 (의정부)', lat: 37.7381, lng: 127.0337 },
  { name: '경기 남부 (수원)', lat: 37.2636, lng: 127.0286 },
  { name: '인천', lat: 37.4563, lng: 126.7052 },
  { name: '부산', lat: 35.1796, lng: 129.0756 },
  { name: '대구', lat: 35.8714, lng: 128.6014 },
  { name: '대전', lat: 36.3504, lng: 127.3845 },
  { name: '광주', lat: 35.1595, lng: 126.8526 },
  { name: '울산', lat: 35.5384, lng: 129.3114 },
  { name: '세종', lat: 36.4801, lng: 127.2890 },
  { name: '강원 (춘천)', lat: 37.8813, lng: 127.7298 },
  { name: '충북 (청주)', lat: 36.6424, lng: 127.4890 },
  { name: '충남 (천안)', lat: 36.8151, lng: 127.1139 },
  { name: '전북 (전주)', lat: 35.8242, lng: 127.1480 },
  { name: '전남 (목포)', lat: 34.8118, lng: 126.3922 },
  { name: '경북 (포항)', lat: 36.0190, lng: 129.3435 },
  { name: '경남 (창원)', lat: 35.2281, lng: 128.6811 },
  { name: '제주', lat: 33.4996, lng: 126.5312 },
]

export default function GolfCoursesPage() {
  const [courses, setCourses] = useState<GolfCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [radius, setRadius] = useState(30) // km
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'failed' | 'manual'>('loading')

  // 위치 가져오기
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!navigator.geolocation) {
      setLocationStatus('failed')
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocationStatus('success')
      },
      (err) => {
        console.error('Geolocation error:', err)
        setLocationStatus('failed')
        setIsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  // 지역 선택 시 위치 업데이트
  const handleRegionSelect = (regionName: string) => {
    const region = KOREA_REGIONS.find(r => r.name === regionName)
    if (region) {
      setSelectedRegion(regionName)
      setUserLocation({ lat: region.lat, lng: region.lng })
      setLocationStatus('manual')
      setError(null)
    }
  }

  // 골프장 검색
  useEffect(() => {
    if (!userLocation) return

    const fetchCourses = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/places/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radius * 1000}`
        )

        if (!response.ok) {
          throw new Error('검색에 실패했습니다.')
        }

        const data = await response.json()
        setCourses(data.results || [])
      } catch (err) {
        console.error('Fetch error:', err)
        setError('골프장 검색에 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [userLocation, radius])

  // 사진 URL 생성
  const getPhotoUrl = (photoReference: string | null) => {
    if (!photoReference) return null
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  }

  // 별점 렌더링
  const renderStars = (rating: number | null) => {
    if (!rating) return null
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.5

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${
              i < fullStars
                ? 'text-yellow-400'
                : i === fullStars && hasHalf
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)} ({courses.find(c => c.rating === rating)?.ratings_total || 0})
        </span>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">내 주변 골프장</h1>
          <p className="text-muted">
            {locationStatus === 'loading' && '위치 정보를 확인 중입니다...'}
            {locationStatus === 'success' && `현재 위치 기준 ${radius}km 이내 골프장을 찾아드립니다.`}
            {locationStatus === 'manual' && `${selectedRegion} 기준 ${radius}km 이내 골프장을 찾아드립니다.`}
            {locationStatus === 'failed' && !userLocation && '지역을 선택해주세요.'}
          </p>
        </div>

        {/* 위치 선택 (위치 가져오기 실패 시 또는 수동 선택 모드) */}
        {(locationStatus === 'failed' || locationStatus === 'manual') && (
          <div className="card mb-6 border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">지역 선택</span>
              {locationStatus === 'failed' && (
                <span className="text-sm text-muted ml-2">(위치 정보를 가져올 수 없습니다)</span>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {KOREA_REGIONS.map((region) => (
                <button
                  key={region.name}
                  onClick={() => handleRegionSelect(region.name)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedRegion === region.name
                      ? 'bg-primary text-white'
                      : 'bg-white border hover:border-primary hover:text-primary'
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 위치 변경 버튼 (위치 가져오기 성공 시) */}
        {locationStatus === 'success' && (
          <div className="mb-4">
            <button
              onClick={() => setLocationStatus('manual')}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              다른 지역에서 찾기
            </button>
          </div>
        )}

        {/* 필터 */}
        {userLocation && (
          <div className="card mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">검색 반경:</label>
              <div className="flex gap-2">
                {[10, 30, 50, 100].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadius(r)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      radius === r
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* 로딩 */}
        {isLoading && userLocation && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted">골프장을 검색 중입니다...</p>
          </div>
        )}

        {/* 지역 선택 안내 (위치 실패 + 지역 미선택) */}
        {locationStatus === 'failed' && !userLocation && (
          <div className="text-center py-20">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-muted mb-2">위의 지역을 선택하면</p>
            <p className="text-muted">해당 지역의 골프장을 검색합니다.</p>
          </div>
        )}

        {/* 결과 없음 */}
        {!isLoading && userLocation && courses.length === 0 && (
          <div className="text-center py-20">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-muted">주변에 골프장이 없습니다.</p>
            <p className="text-sm text-gray-400 mt-1">검색 반경을 넓혀보세요.</p>
          </div>
        )}

        {/* 골프장 목록 */}
        {!isLoading && courses.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted">{courses.length}개의 골프장을 찾았습니다.</p>

            {courses.map((course) => (
              <Link
                key={course.place_id}
                href={`/golf-courses/${course.place_id}`}
                className="card flex gap-4 hover:shadow-lg transition-shadow"
              >
                {/* 사진 */}
                <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {course.photo_reference ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getPhotoUrl(course.photo_reference) || ''}
                      alt={course.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg truncate">{course.name}</h3>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full flex-shrink-0">
                      {course.distance}km
                    </span>
                  </div>

                  <p className="text-sm text-muted mt-1 truncate">{course.address}</p>

                  {/* 별점 */}
                  {course.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
                      <span className="text-sm text-muted">({course.ratings_total})</span>
                    </div>
                  )}

                  {/* 영업 상태 */}
                  <div className="flex items-center gap-2 mt-2">
                    {course.open_now !== null && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          course.open_now
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {course.open_now ? '영업중' : '영업종료'}
                      </span>
                    )}
                    {course.business_status === 'CLOSED_TEMPORARILY' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        임시휴업
                      </span>
                    )}
                  </div>
                </div>

                {/* 화살표 */}
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
