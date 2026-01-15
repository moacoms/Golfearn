import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLessonPro, getLessonProReviews } from '@/lib/actions/lesson-pros'
import {
  specialtyOptions,
  lessonTypeOptions,
  regionOptions,
} from '@/lib/lesson-pro-constants'
import { createClient } from '@/lib/supabase/server'
import ReviewSection from './ReviewSection'
import InquiryButton from './InquiryButton'

function formatPrice(price: number | null): string {
  if (!price) return '-'
  return price.toLocaleString() + '원'
}

export default async function LessonProDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const proId = parseInt(id)

  if (isNaN(proId)) {
    notFound()
  }

  const [pro, reviews] = await Promise.all([
    getLessonPro(proId),
    getLessonProReviews(proId),
  ])

  if (!pro) {
    notFound()
  }

  // 현재 사용자 확인
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        {/* 뒤로가기 */}
        <Link
          href="/lesson-pro"
          className="inline-flex items-center gap-2 text-muted hover:text-primary mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </Link>

        {/* 프로필 카드 */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* 프로필 이미지 */}
            <div className="w-full md:w-48 h-48 md:h-auto md:aspect-square bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {pro.profile_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pro.profile_image}
                  alt={pro.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>

            {/* 기본 정보 */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-2xl font-bold">{pro.name} 프로</h1>
                {pro.is_verified && (
                  <span className="px-2 py-1 bg-primary text-white text-xs rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    인증 프로
                  </span>
                )}
              </div>

              {/* 평점 */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(pro.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="font-medium">{pro.rating.toFixed(1)}</span>
                <span className="text-muted">리뷰 {pro.review_count}개</span>
              </div>

              {/* 경력 */}
              {pro.experience_years && (
                <p className="text-muted mb-4">경력 {pro.experience_years}년</p>
              )}

              {/* 전문 분야 */}
              {pro.specialties && pro.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {pro.specialties.map((specialty) => {
                    const option = specialtyOptions.find((o) => o.value === specialty)
                    return (
                      <span
                        key={specialty}
                        className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                      >
                        {option?.label || specialty}
                      </span>
                    )
                  })}
                </div>
              )}

              {/* 지역 */}
              {pro.regions && pro.regions.length > 0 && (
                <div className="flex items-center gap-2 text-muted mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {pro.regions.map((region) => {
                    const option = regionOptions.find((o) => o.value === region)
                    return option?.label || region
                  }).join(', ')}
                </div>
              )}

              {/* 문의 버튼 */}
              <InquiryButton proId={proId} proName={pro.name} isLoggedIn={!!user} />
            </div>
          </div>
        </div>

        {/* 소개 */}
        {pro.introduction && (
          <div className="card mb-8">
            <h2 className="text-lg font-semibold mb-4">소개</h2>
            <p className="text-muted whitespace-pre-wrap">{pro.introduction}</p>
          </div>
        )}

        {/* 레슨 정보 */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-4">레슨 정보</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* 레슨 유형 */}
            {pro.lesson_types && pro.lesson_types.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted mb-2">레슨 유형</h3>
                <div className="flex flex-wrap gap-2">
                  {pro.lesson_types.map((type) => {
                    const option = lessonTypeOptions.find((o) => o.value === type)
                    return (
                      <span key={type} className="px-2 py-1 bg-gray-100 text-sm rounded">
                        {option?.label || type}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 가격 */}
            <div>
              <h3 className="text-sm font-medium text-muted mb-2">레슨 비용</h3>
              <div className="space-y-1">
                {pro.price_individual && (
                  <div className="flex justify-between">
                    <span>1:1 개인레슨</span>
                    <span className="font-medium">{formatPrice(pro.price_individual)}</span>
                  </div>
                )}
                {pro.price_group && (
                  <div className="flex justify-between">
                    <span>그룹레슨</span>
                    <span className="font-medium">{formatPrice(pro.price_group)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 가능 시간 */}
            {pro.available_times && (
              <div className="sm:col-span-2">
                <h3 className="text-sm font-medium text-muted mb-2">가능 시간</h3>
                <p>{pro.available_times}</p>
              </div>
            )}
          </div>
        </div>

        {/* 자격증 */}
        {pro.certifications && pro.certifications.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-lg font-semibold mb-4">자격 및 경력</h2>
            <ul className="list-disc list-inside space-y-1 text-muted">
              {pro.certifications.map((cert, index) => (
                <li key={index}>{cert}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 연락처 */}
        {(pro.contact_phone || pro.contact_kakao || pro.instagram || pro.youtube) && (
          <div className="card mb-8">
            <h2 className="text-lg font-semibold mb-4">연락처</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {pro.contact_phone && (
                <a
                  href={`tel:${pro.contact_phone}`}
                  className="flex items-center gap-2 text-muted hover:text-primary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {pro.contact_phone}
                </a>
              )}
              {pro.contact_kakao && (
                <div className="flex items-center gap-2 text-muted">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3c-5.523 0-10 3.582-10 8 0 2.793 1.845 5.238 4.621 6.622-.147.527-.946 3.378-.994 3.635 0 0-.019.187.089.258.108.071.235.038.235.038.397-.056 4.593-3.014 5.318-3.492.237.022.478.034.721.034 5.523 0 10-3.582 10-8 0-4.418-4.477-8-10-8" />
                  </svg>
                  카카오톡: {pro.contact_kakao}
                </div>
              )}
              {pro.instagram && (
                <a
                  href={`https://instagram.com/${pro.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted hover:text-primary"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  @{pro.instagram}
                </a>
              )}
              {pro.youtube && (
                <a
                  href={pro.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted hover:text-primary"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  YouTube
                </a>
              )}
            </div>
          </div>
        )}

        {/* 갤러리 */}
        {pro.gallery_images && pro.gallery_images.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-lg font-semibold mb-4">갤러리</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {pro.gallery_images.map((image, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={index}
                  src={image}
                  alt={`갤러리 ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* 리뷰 섹션 */}
        <ReviewSection
          proId={proId}
          reviews={reviews}
          currentUserId={user?.id}
        />
      </div>
    </div>
  )
}
