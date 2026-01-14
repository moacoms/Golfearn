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

export default function GolfCoursesPage() {
  const [courses, setCourses] = useState<GolfCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [radius, setRadius] = useState(30) // km

  // 위치 가져오기
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('브라우저에서 위치 서비스를 지원하지 않습니다.')
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (err) => {
        console.error('Geolocation error:', err)
        // 기본 위치: 서울 시청
        setUserLocation({ lat: 37.5665, lng: 126.978 })
        setError('위치를 가져올 수 없어 서울 기준으로 검색합니다.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

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
            {userLocation
              ? `현재 위치 기준 ${radius}km 이내 골프장을 찾아드립니다.`
              : '위치 정보를 확인 중입니다...'}
          </p>
        </div>

        {/* 필터 */}
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

        {/* 에러 메시지 */}
        {error && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* 로딩 */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted">골프장을 검색 중입니다...</p>
          </div>
        )}

        {/* 결과 없음 */}
        {!isLoading && courses.length === 0 && (
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
