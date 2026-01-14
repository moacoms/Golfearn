'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getGolfCourseReviews, getGolfCourseAverageRating, GolfCourseReview } from '@/lib/actions/golf-course-reviews'
import ReviewList from '@/components/golf-courses/ReviewList'
import ReviewForm from '@/components/golf-courses/ReviewForm'

interface CourseDetail {
  place_id: string
  name: string
  address: string
  phone: string | null
  website: string | null
  google_maps_url: string | null
  lat: number
  lng: number
  rating: number | null
  ratings_total: number
  business_status: string | null
  price_level: number | null
  opening_hours: {
    open_now: boolean | null
    weekday_text: string[]
  } | null
  photos: {
    reference: string
    width: number
    height: number
  }[]
  google_reviews: {
    author: string
    rating: number
    text: string
    time: number
    photo_url: string | null
    relative_time: string | null
  }[]
}

export default function GolfCourseDetailPage() {
  const params = useParams()
  const placeId = params?.id as string

  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [reviews, setReviews] = useState<GolfCourseReview[]>([])
  const [reviewStats, setReviewStats] = useState<{
    average: number
    count: number
    distribution: { [key: number]: number }
  } | null>(null)

  // 현재 사용자 확인
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null)
    })
  }, [])

  // 리뷰 로드
  const loadReviews = useCallback(async () => {
    if (!placeId) return
    try {
      const [reviewsData, stats] = await Promise.all([
        getGolfCourseReviews(placeId),
        getGolfCourseAverageRating(placeId),
      ])
      setReviews(reviewsData)
      setReviewStats(stats)
    } catch (err) {
      console.error('Error loading reviews:', err)
    }
  }, [placeId])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  useEffect(() => {
    if (!placeId) {
      setError('잘못된 접근입니다.')
      setIsLoading(false)
      return
    }

    const fetchDetails = async () => {
      try {
        const response = await fetch(`/api/places/details?place_id=${encodeURIComponent(placeId)}`)

        if (!response.ok) {
          throw new Error('골프장 정보를 가져올 수 없습니다.')
        }

        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }

        if (!data.result) {
          throw new Error('골프장 정보가 없습니다.')
        }

        setCourse(data.result)
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [placeId])

  // 사진 URL 생성
  const getPhotoUrl = (reference: string, maxWidth = 800) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  }

  // 별점 렌더링
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="container max-w-4xl">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted">골프장 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="py-12">
        <div className="container max-w-4xl">
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error || '골프장을 찾을 수 없습니다.'}</p>
            <Link href="/golf-courses" className="btn btn-primary">
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        {/* 뒤로가기 */}
        <Link
          href="/golf-courses"
          className="inline-flex items-center gap-2 text-muted hover:text-primary mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </Link>

        {/* 사진 갤러리 */}
        {course.photos && course.photos.length > 0 && (
          <div className="mb-6">
            {/* 메인 사진 */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 mb-2">
              {course.photos[selectedPhotoIndex]?.reference && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getPhotoUrl(course.photos[selectedPhotoIndex].reference)}
                  alt={course.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* 썸네일 */}
            {course.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {course.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                      selectedPhotoIndex === index ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    {photo?.reference && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getPhotoUrl(photo.reference, 200)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 기본 정보 */}
        <div className="card mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold">{course.name}</h1>
              {course.rating && (
                <div className="flex items-center gap-2 mt-2">
                  {renderStars(course.rating)}
                  <span className="font-medium">{course.rating.toFixed(1)}</span>
                  <span className="text-muted">({course.ratings_total}개 리뷰)</span>
                </div>
              )}
            </div>

            {/* 영업 상태 */}
            {course.opening_hours && course.opening_hours.open_now !== null && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  course.opening_hours.open_now
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {course.opening_hours.open_now ? '영업중' : '영업종료'}
              </span>
            )}
          </div>

          {/* 주소 */}
          <div className="flex items-start gap-3 text-gray-700 mb-3">
            <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{course.address}</span>
          </div>

          {/* 전화번호 */}
          {course.phone && (
            <div className="flex items-center gap-3 text-gray-700 mb-3">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href={`tel:${course.phone}`} className="hover:text-primary">
                {course.phone}
              </a>
            </div>
          )}

          {/* 웹사이트 */}
          {course.website && (
            <div className="flex items-center gap-3 text-gray-700 mb-3">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <a
                href={course.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary truncate"
              >
                {course.website}
              </a>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-3 mt-6">
            {course.google_maps_url && (
              <a
                href={course.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline flex-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                길찾기
              </a>
            )}
            {course.phone && (
              <a href={`tel:${course.phone}`} className="btn btn-primary flex-1">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                전화하기
              </a>
            )}
          </div>
        </div>

        {/* 영업시간 */}
        {course.opening_hours?.weekday_text && course.opening_hours.weekday_text.length > 0 && (
          <div className="card mb-6">
            <h2 className="font-semibold mb-4">영업시간</h2>
            <div className="space-y-2">
              {course.opening_hours.weekday_text.map((text, index) => (
                <p key={index} className="text-gray-700 text-sm">
                  {text}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Google 리뷰 */}
        {course.google_reviews && course.google_reviews.length > 0 && (
          <div className="card mb-6">
            <h2 className="font-semibold mb-4">Google 리뷰</h2>
            <div className="space-y-4">
              {course.google_reviews.map((review, index) => (
                <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-3 mb-2">
                    {review.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={review.photo_url}
                        alt=""
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{review.author}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        {review.relative_time && (
                          <span className="text-sm text-muted">{review.relative_time}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {review.text && (
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{review.text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 골린이 리뷰 */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">골린이 리뷰</h2>
            {reviewStats && reviewStats.count > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < Math.round(reviewStats.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-medium">{reviewStats.average}</span>
                <span className="text-muted">({reviewStats.count})</span>
              </div>
            )}
          </div>

          {/* 평점 분포 */}
          {reviewStats && reviewStats.count > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviewStats.distribution[star] || 0
                  const percentage = reviewStats.count > 0 ? (count / reviewStats.count) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-4">{star}</span>
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-muted">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 리뷰 작성 폼 */}
          {currentUserId && course ? (
            <div className="mb-6">
              <ReviewForm
                placeId={placeId}
                golfCourseName={course.name}
                onSuccess={loadReviews}
              />
            </div>
          ) : !currentUserId && course ? (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-muted mb-2">리뷰를 작성하려면 로그인이 필요합니다.</p>
              <Link href="/login" className="btn btn-primary btn-sm">
                로그인
              </Link>
            </div>
          ) : null}

          {/* 리뷰 목록 */}
          <ReviewList
            reviews={reviews}
            currentUserId={currentUserId}
            onReviewDeleted={loadReviews}
          />
        </div>

        {/* 조인 찾기 CTA */}
        <div className="card bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">이 골프장에서 함께 플레이할 골린이를 찾고 계신가요?</h3>
              <p className="text-sm text-muted mt-1">조인 매칭에서 함께할 멤버를 찾아보세요!</p>
            </div>
            <Link href="/join" className="btn btn-primary flex-shrink-0">
              조인 찾기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
