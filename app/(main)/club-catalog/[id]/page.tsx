import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { getClub, getRelatedClubs } from '@/lib/actions/club-catalog'
import { getClubReviews, getClubReviewStats } from '@/lib/actions/club-reviews'
import { getClubPriceGuide } from '@/lib/actions/club-price'
import ClubCard from '@/components/club/ClubCard'
import {
  CLUB_TYPE_LABELS,
  SHAFT_FLEX_LABELS,
  SHAFT_MATERIAL_LABELS,
  CONDITION_LABELS,
} from '@/types/club'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const club = await getClub(parseInt(resolvedParams.id))

  if (!club) {
    return { title: '클럽을 찾을 수 없습니다 | Golfearn' }
  }

  const name = club.name_ko || club.name
  const brand = club.brand?.name_ko || club.brand?.name || ''

  return {
    title: `${brand} ${name} | Golfearn 클럽 카탈로그`,
    description: club.description || `${brand} ${name}의 스펙, 리뷰, 중고 시세를 확인하세요.`,
  }
}

// 특성 레벨 표시 컴포넌트
function LevelBar({ level, label }: { level: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted w-16">{label}</span>
      <div className="flex-1 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded ${
              i <= level ? 'bg-primary' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium w-6 text-right">{level}</span>
    </div>
  )
}

// 리뷰 섹션
async function ReviewSection({ clubId }: { clubId: number }) {
  const [{ reviews }, stats] = await Promise.all([
    getClubReviews(clubId, { limit: 5 }),
    getClubReviewStats(clubId),
  ])

  return (
    <div>
      {/* 리뷰 통계 */}
      <div className="flex items-start gap-8 mb-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-primary">
            {stats.average.toFixed(1)}
          </div>
          <div className="flex justify-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${
                  i <= Math.round(stats.average) ? 'text-yellow-400' : 'text-gray-200'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <div className="text-sm text-muted">{stats.total}개의 리뷰</div>
        </div>

        {/* 평점 분포 */}
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.distribution[rating] || 0
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
            return (
              <div key={rating} className="flex items-center gap-2 mb-1">
                <span className="text-sm w-6">{rating}점</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted w-8">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 리뷰 목록 */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {review.profiles?.avatar_url ? (
                    <Image
                      src={review.profiles.avatar_url}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-gray-500">
                      {review.profiles?.username?.[0] || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {review.profiles?.username || '익명'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <span className="text-yellow-500">★ {review.rating}</span>
                    {review.ownership_period && (
                      <span>· 사용기간: {review.ownership_period}</span>
                    )}
                  </div>
                </div>
              </div>
              {review.title && (
                <h4 className="font-medium mb-1">{review.title}</h4>
              )}
              <p className="text-gray-700">{review.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted text-center py-8">아직 리뷰가 없습니다.</p>
      )}
    </div>
  )
}

// 시세 가이드 섹션
async function PriceGuideSection({ clubId, currentPrice }: { clubId: number; currentPrice: number | null }) {
  const priceGuide = await getClubPriceGuide(clubId)

  if (!priceGuide || Object.keys(priceGuide).length === 0) {
    return (
      <p className="text-muted text-center py-8">
        아직 거래 데이터가 없습니다.
      </p>
    )
  }

  const conditions = ['S', 'A', 'B', 'C'] as const

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {conditions.map((condition) => {
          const price = priceGuide[condition]
          if (!price) return null

          const { name, description } = CONDITION_LABELS[condition]
          const discount = currentPrice
            ? Math.round(((currentPrice - price) / currentPrice) * 100)
            : 0

          return (
            <div key={condition} className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold mb-2">
                {condition}
              </div>
              <div className="text-sm text-muted mb-1">{name}</div>
              <div className="font-bold text-lg">
                {price.toLocaleString()}원
              </div>
              {discount > 0 && (
                <div className="text-xs text-primary">정가 대비 {discount}% ↓</div>
              )}
              <div className="text-xs text-muted mt-1">{description}</div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>시세 안내:</strong> Golfearn 중고거래 및 외부 데이터 기반의 평균 시세입니다.
          실제 거래가는 상품 상태와 구성품에 따라 달라질 수 있습니다.
        </p>
      </div>
    </div>
  )
}

// 관련 클럽 섹션
async function RelatedClubsSection({
  clubId,
  brandId,
  clubType,
}: {
  clubId: number
  brandId: number | null
  clubType: string
}) {
  const relatedClubs = await getRelatedClubs(clubId, brandId, clubType, 4)

  if (relatedClubs.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {relatedClubs.map((club) => (
        <ClubCard key={club.id} club={club} />
      ))}
    </div>
  )
}

export default async function ClubDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const club = await getClub(parseInt(resolvedParams.id))

  if (!club) {
    notFound()
  }

  const name = club.name_ko || club.name
  const brand = club.brand?.name_ko || club.brand?.name || ''
  const mainImage = club.image_urls?.[0] || '/images/club-placeholder.png'

  return (
    <div className="py-12">
      <div className="container">
        {/* 브레드크럼 */}
        <nav className="flex items-center gap-2 text-sm text-muted mb-8">
          <Link href="/club-catalog" className="hover:text-primary">
            클럽 카탈로그
          </Link>
          <span>/</span>
          <Link
            href={`/club-catalog?type=${club.club_type}`}
            className="hover:text-primary"
          >
            {CLUB_TYPE_LABELS[club.club_type]}
          </Link>
          <span>/</span>
          <span className="text-foreground">{name}</span>
        </nav>

        {/* 메인 콘텐츠 */}
        <div className="lg:flex gap-12">
          {/* 이미지 */}
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <Image
                src={mainImage}
                alt={name}
                fill
                className="object-contain p-8"
                priority
              />
              {club.is_featured && (
                <span className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm">
                  에디터 추천
                </span>
              )}
            </div>

            {/* 추가 이미지 썸네일 */}
            {club.image_urls && club.image_urls.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {club.image_urls.map((url, index) => (
                  <div
                    key={index}
                    className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={url}
                      alt={`${name} 이미지 ${index + 1}`}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 정보 */}
          <div className="lg:w-1/2">
            {/* 브랜드 & 타입 */}
            <div className="flex items-center gap-3 mb-2">
              {brand && (
                <Link
                  href={`/club-catalog?brand=${club.brand_id}`}
                  className="text-primary hover:underline"
                >
                  {brand}
                </Link>
              )}
              <span className="bg-gray-100 px-2 py-0.5 rounded text-sm">
                {CLUB_TYPE_LABELS[club.club_type]}
              </span>
              {club.model_year && (
                <span className="bg-gray-100 px-2 py-0.5 rounded text-sm">
                  {club.model_year}년
                </span>
              )}
            </div>

            {/* 이름 */}
            <h1 className="text-3xl font-bold mb-4">{name}</h1>

            {/* 평점 */}
            {club.rating > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i <= Math.round(club.rating) ? 'text-yellow-400' : 'text-gray-200'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-lg font-medium">{club.rating.toFixed(1)}</span>
                <span className="text-muted">({club.review_count}개 리뷰)</span>
              </div>
            )}

            {/* 가격 */}
            <div className="mb-6 pb-6 border-b">
              {club.current_price ? (
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-primary">
                    {club.current_price.toLocaleString()}원
                  </span>
                  {club.release_price && club.release_price > club.current_price && (
                    <span className="text-lg text-muted line-through">
                      {club.release_price.toLocaleString()}원
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-lg text-muted">가격 미정</span>
              )}
            </div>

            {/* 특성 레벨 */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-bold mb-4">클럽 특성</h3>
              <div className="space-y-3">
                <LevelBar level={club.forgiveness_level} label="관용성" />
                <LevelBar level={club.distance_level} label="비거리" />
                <LevelBar level={club.control_level} label="컨트롤" />
                <LevelBar level={club.feel_level} label="타감" />
              </div>
            </div>

            {/* 스펙 */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-bold mb-4">스펙</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {club.loft && club.loft.length > 0 && (
                  <div>
                    <span className="text-muted">로프트</span>
                    <p className="font-medium">{club.loft.join('°, ')}°</p>
                  </div>
                )}
                {club.shaft_flex && club.shaft_flex.length > 0 && (
                  <div>
                    <span className="text-muted">샤프트 강도</span>
                    <p className="font-medium">
                      {club.shaft_flex.map((f) => SHAFT_FLEX_LABELS[f] || f).join(', ')}
                    </p>
                  </div>
                )}
                {club.shaft_material && club.shaft_material.length > 0 && (
                  <div>
                    <span className="text-muted">샤프트 재질</span>
                    <p className="font-medium">
                      {club.shaft_material.map((m) => SHAFT_MATERIAL_LABELS[m] || m).join(', ')}
                    </p>
                  </div>
                )}
                {club.specs && Object.keys(club.specs).length > 0 && (
                  <>
                    {club.specs.head_volume && (
                      <div>
                        <span className="text-muted">헤드 용량</span>
                        <p className="font-medium">{club.specs.head_volume}</p>
                      </div>
                    )}
                    {club.specs.length && (
                      <div>
                        <span className="text-muted">길이</span>
                        <p className="font-medium">{club.specs.length}인치</p>
                      </div>
                    )}
                    {club.specs.weight && (
                      <div>
                        <span className="text-muted">무게</span>
                        <p className="font-medium">{club.specs.weight}</p>
                      </div>
                    )}
                    {club.specs.MOI && (
                      <div>
                        <span className="text-muted">MOI</span>
                        <p className="font-medium">{club.specs.MOI}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 주요 특징 */}
            {club.features && club.features.length > 0 && (
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-bold mb-4">주요 특징</h3>
                <ul className="space-y-2">
                  {club.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA 버튼 */}
            <div className="flex gap-4">
              <Link
                href={`/market?search=${encodeURIComponent(name)}`}
                className="flex-1 btn btn-primary"
              >
                중고 매물 보기
              </Link>
              <Link
                href={`/market/sell?club_id=${club.id}`}
                className="flex-1 btn btn-outline"
              >
                이 클럽 판매하기
              </Link>
            </div>
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="mt-16">
          {/* 설명 */}
          {club.description && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">상품 설명</h2>
              <div className="card p-6">
                <p className="whitespace-pre-wrap">{club.description}</p>
              </div>
            </section>
          )}

          {/* 중고 시세 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">중고 시세 가이드</h2>
            <div className="card p-6">
              <Suspense fallback={<div className="animate-pulse h-40 bg-gray-100 rounded" />}>
                <PriceGuideSection clubId={club.id} currentPrice={club.current_price} />
              </Suspense>
            </div>
          </section>

          {/* 리뷰 */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">사용자 리뷰</h2>
              {/* 리뷰 작성 버튼은 로그인 시에만 표시 - 클라이언트 컴포넌트로 분리 필요 */}
            </div>
            <div className="card p-6">
              <Suspense fallback={<div className="animate-pulse h-60 bg-gray-100 rounded" />}>
                <ReviewSection clubId={club.id} />
              </Suspense>
            </div>
          </section>

          {/* 관련 클럽 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">비슷한 클럽</h2>
            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="card animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded-t-lg" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-6 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              }
            >
              <RelatedClubsSection
                clubId={club.id}
                brandId={club.brand_id}
                clubType={club.club_type}
              />
            </Suspense>
          </section>
        </div>
      </div>
    </div>
  )
}
