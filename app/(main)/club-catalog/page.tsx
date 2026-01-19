import { Suspense } from 'react'
import Link from 'next/link'
import { getBrands, getClubs, getModelYears, getClubStats } from '@/lib/actions/club-catalog'
import ClubCard from '@/components/club/ClubCard'
import type { ClubType, ShaftFlex, ShaftMaterial } from '@/types/club'
import { CLUB_TYPE_LABELS } from '@/types/club'

export const metadata = {
  title: '클럽 카탈로그 | Golfearn',
  description: '골프 클럽 카탈로그에서 드라이버, 아이언, 퍼터 등 다양한 클럽의 스펙과 시세를 확인하세요.',
}

interface PageProps {
  searchParams: Promise<{
    brand?: string
    type?: string
    year?: string
    min_price?: string
    max_price?: string
    flex?: string
    material?: string
    search?: string
    sort?: string
    page?: string
  }>
}

function ClubFilters({
  brands,
  years,
  stats,
  currentFilters,
}: {
  brands: { id: number; name: string; name_ko: string | null }[]
  years: number[]
  stats: { type: ClubType; count: number }[]
  currentFilters: {
    brand?: string
    type?: string
    year?: string
    min_price?: string
    max_price?: string
    flex?: string
    material?: string
    search?: string
    sort?: string
  }
}) {
  const buildUrl = (params: Record<string, string | undefined>) => {
    const searchParams = new URLSearchParams()
    const merged = { ...currentFilters, ...params }
    Object.entries(merged).forEach(([key, value]) => {
      if (value && value !== 'all') {
        searchParams.set(key, value)
      }
    })
    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : '/club-catalog'
  }

  return (
    <div className="space-y-6">
      {/* 검색 */}
      <div>
        <label className="block text-sm font-medium mb-2">검색</label>
        <form action="/club-catalog" method="get">
          <input
            type="text"
            name="search"
            placeholder="클럽명, 브랜드 검색"
            defaultValue={currentFilters.search}
            className="input w-full"
          />
          {/* 기존 필터 유지 */}
          {currentFilters.brand && <input type="hidden" name="brand" value={currentFilters.brand} />}
          {currentFilters.type && <input type="hidden" name="type" value={currentFilters.type} />}
          {currentFilters.sort && <input type="hidden" name="sort" value={currentFilters.sort} />}
        </form>
      </div>

      {/* 클럽 타입 */}
      <div>
        <label className="block text-sm font-medium mb-2">클럽 종류</label>
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildUrl({ type: undefined })}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              !currentFilters.type
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            전체
          </Link>
          {Object.entries(CLUB_TYPE_LABELS).map(([type, label]) => {
            const stat = stats.find((s) => s.type === type)
            return (
              <Link
                key={type}
                href={buildUrl({ type })}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  currentFilters.type === type
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {label} {stat && <span className="text-xs">({stat.count})</span>}
              </Link>
            )
          })}
        </div>
      </div>

      {/* 브랜드 */}
      <div>
        <label className="block text-sm font-medium mb-2">브랜드</label>
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildUrl({ brand: undefined })}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              !currentFilters.brand
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            전체
          </Link>
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={buildUrl({ brand: brand.id.toString() })}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                currentFilters.brand === brand.id.toString()
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {brand.name_ko || brand.name}
            </Link>
          ))}
        </div>
      </div>

      {/* 출시년도 */}
      <div>
        <label className="block text-sm font-medium mb-2">출시년도</label>
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildUrl({ year: undefined })}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              !currentFilters.year
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            전체
          </Link>
          {years.slice(0, 5).map((year) => (
            <Link
              key={year}
              href={buildUrl({ year: year.toString() })}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                currentFilters.year === year.toString()
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {year}년
            </Link>
          ))}
        </div>
      </div>

      {/* 가격대 */}
      <div>
        <label className="block text-sm font-medium mb-2">가격대</label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '전체', min: '', max: '' },
            { label: '50만원 이하', min: '', max: '500000' },
            { label: '50-100만원', min: '500000', max: '1000000' },
            { label: '100-150만원', min: '1000000', max: '1500000' },
            { label: '150만원 이상', min: '1500000', max: '' },
          ].map((range) => {
            const isActive =
              currentFilters.min_price === range.min &&
              currentFilters.max_price === range.max
            return (
              <Link
                key={range.label}
                href={buildUrl({
                  min_price: range.min || undefined,
                  max_price: range.max || undefined,
                })}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* 정렬 */}
      <div>
        <label className="block text-sm font-medium mb-2">정렬</label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'newest', label: '최신순' },
            { value: 'rating', label: '평점순' },
            { value: 'price_asc', label: '가격 낮은순' },
            { value: 'price_desc', label: '가격 높은순' },
            { value: 'popular', label: '인기순' },
          ].map((option) => (
            <Link
              key={option.value}
              href={buildUrl({ sort: option.value })}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                currentFilters.sort === option.value ||
                (!currentFilters.sort && option.value === 'newest')
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {/* 필터 초기화 */}
      {Object.values(currentFilters).some(Boolean) && (
        <Link
          href="/club-catalog"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          필터 초기화
        </Link>
      )}
    </div>
  )
}

function ClubListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-t-lg" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-gray-200 rounded w-1/4" />
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="space-y-1">
              <div className="h-2 bg-gray-200 rounded" />
              <div className="h-2 bg-gray-200 rounded" />
              <div className="h-2 bg-gray-200 rounded" />
            </div>
            <div className="h-6 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

async function ClubList({
  filters,
  page,
}: {
  filters: {
    brand_id?: number
    club_type?: ClubType
    model_year?: number
    min_price?: number
    max_price?: number
    shaft_flex?: ShaftFlex
    shaft_material?: ShaftMaterial
    search?: string
    sort_by?: 'rating' | 'price_asc' | 'price_desc' | 'newest' | 'popular'
  }
  page: number
}) {
  const { clubs, total, totalPages } = await getClubs({ ...filters, page, limit: 12 })

  if (clubs.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-600 mb-2">검색 결과가 없습니다</h3>
        <p className="text-muted">다른 조건으로 검색해보세요.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-muted mb-4">총 {total}개의 클럽</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {clubs.map((club) => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={`?page=${page - 1}`}
              className="px-4 py-2 rounded border hover:bg-gray-50"
            >
              이전
            </Link>
          )}

          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1
            // 현재 페이지 주변 3개만 표시
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= page - 1 && pageNum <= page + 1)
            ) {
              return (
                <Link
                  key={pageNum}
                  href={`?page=${pageNum}`}
                  className={`px-4 py-2 rounded ${
                    pageNum === page
                      ? 'bg-primary text-white'
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </Link>
              )
            }
            if (pageNum === 2 || pageNum === totalPages - 1) {
              return <span key={pageNum}>...</span>
            }
            return null
          })}

          {page < totalPages && (
            <Link
              href={`?page=${page + 1}`}
              className="px-4 py-2 rounded border hover:bg-gray-50"
            >
              다음
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default async function ClubCatalogPage({ searchParams }: PageProps) {
  const params = await searchParams
  const [brands, years, stats] = await Promise.all([
    getBrands(),
    getModelYears(),
    getClubStats(),
  ])

  const page = parseInt(params.page || '1')

  const filters = {
    brand_id: params.brand ? parseInt(params.brand) : undefined,
    club_type: params.type as ClubType | undefined,
    model_year: params.year ? parseInt(params.year) : undefined,
    min_price: params.min_price ? parseInt(params.min_price) : undefined,
    max_price: params.max_price ? parseInt(params.max_price) : undefined,
    shaft_flex: params.flex as ShaftFlex | undefined,
    shaft_material: params.material as ShaftMaterial | undefined,
    search: params.search,
    sort_by: params.sort as 'rating' | 'price_asc' | 'price_desc' | 'newest' | 'popular' | undefined,
  }

  return (
    <div className="py-12">
      <div className="container">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">클럽 카탈로그</h1>
          <p className="text-muted">
            골프 클럽의 스펙, 리뷰, 중고 시세를 한눈에 확인하세요.
          </p>
        </div>

        {/* AI 추천 배너 */}
        <Link
          href="/club-recommend"
          className="block mb-8 p-6 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white hover:opacity-95 transition-opacity"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">AI 클럽 추천받기</h2>
              <p className="text-white/80">
                키, 실력, 예산에 맞는 클럽을 AI가 추천해드립니다.
              </p>
            </div>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </Link>

        <div className="lg:flex gap-8">
          {/* 필터 사이드바 (데스크탑) */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 card p-6">
              <h2 className="font-bold mb-4">필터</h2>
              <ClubFilters
                brands={brands}
                years={years}
                stats={stats}
                currentFilters={{
                  brand: params.brand,
                  type: params.type,
                  year: params.year,
                  min_price: params.min_price,
                  max_price: params.max_price,
                  flex: params.flex,
                  material: params.material,
                  search: params.search,
                  sort: params.sort,
                }}
              />
            </div>
          </aside>

          {/* 모바일 필터 (아코디언) */}
          <details className="lg:hidden mb-6 card p-4">
            <summary className="font-bold cursor-pointer">필터 및 정렬</summary>
            <div className="mt-4">
              <ClubFilters
                brands={brands}
                years={years}
                stats={stats}
                currentFilters={{
                  brand: params.brand,
                  type: params.type,
                  year: params.year,
                  min_price: params.min_price,
                  max_price: params.max_price,
                  flex: params.flex,
                  material: params.material,
                  search: params.search,
                  sort: params.sort,
                }}
              />
            </div>
          </details>

          {/* 클럽 목록 */}
          <main className="flex-1">
            <Suspense fallback={<ClubListSkeleton />}>
              <ClubList filters={filters} page={page} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}
