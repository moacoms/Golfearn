import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPracticeRange } from '@/lib/actions/practice-ranges'
import { facilityOptions } from '@/lib/practice-range-constants'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const range = await getPracticeRange(parseInt(id))

  if (!range) {
    return { title: '연습장을 찾을 수 없습니다' }
  }

  return {
    title: `${range.name} | 골프 연습장`,
    description: range.description || `${range.address}에 위치한 골프 연습장`,
    openGraph: {
      title: `${range.name} | Golfearn`,
      description: range.description || `${range.address}에 위치한 골프 연습장`,
    },
  }
}

export default async function PracticeRangeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const range = await getPracticeRange(parseInt(id))

  if (!range) {
    notFound()
  }

  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        {/* 뒤로가기 */}
        <Link
          href="/practice-range"
          className="inline-flex items-center gap-2 text-muted hover:text-foreground mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          연습장 목록으로
        </Link>

        {/* 메인 이미지 */}
        <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden mb-8">
          {range.images && range.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={range.images[0]}
              alt={range.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="card mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{range.name}</h1>
              {range.region && (
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  {range.region}
                </span>
              )}
            </div>
            {range.google_rating > 0 && (
              <div className="flex items-center gap-1 text-lg">
                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="font-semibold">{range.google_rating.toFixed(1)}</span>
                <span className="text-muted text-sm">({range.google_review_count})</span>
              </div>
            )}
          </div>

          {range.description && (
            <p className="text-muted mb-4">{range.description}</p>
          )}

          {/* 시설 */}
          {range.facilities && range.facilities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {range.facilities.map((facility) => {
                const option = facilityOptions.find((o) => o.value === facility)
                return (
                  <span
                    key={facility}
                    className="px-3 py-1 bg-gray-100 text-sm rounded-full"
                  >
                    {option?.label || facility}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* 상세 정보 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 위치 정보 */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">위치 정보</h2>
            <div className="space-y-3">
              {range.address && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-muted flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{range.address}</span>
                </div>
              )}
              {range.phone && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${range.phone}`} className="text-primary hover:underline">
                    {range.phone}
                  </a>
                </div>
              )}
              {range.website && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a
                    href={range.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    웹사이트 방문
                  </a>
                </div>
              )}
            </div>

            {/* 지도 */}
            {range.location_lat && range.location_lng && (
              <div className="mt-4 pt-4 border-t">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${range.location_lat},${range.location_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline w-full"
                >
                  Google 지도에서 보기
                </a>
              </div>
            )}
          </div>

          {/* 운영 정보 */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">운영 정보</h2>
            <div className="space-y-4">
              {range.operating_hours && (
                <div>
                  <h3 className="text-sm font-medium text-muted mb-1">영업시간</h3>
                  <p className="whitespace-pre-line">{range.operating_hours}</p>
                </div>
              )}
              {range.price_info && (
                <div>
                  <h3 className="text-sm font-medium text-muted mb-1">이용 요금</h3>
                  <p className="whitespace-pre-line">{range.price_info}</p>
                </div>
              )}
              {range.floor_count && (
                <div>
                  <h3 className="text-sm font-medium text-muted mb-1">층수</h3>
                  <p>{range.floor_count}층</p>
                </div>
              )}
              {range.booth_count && (
                <div>
                  <h3 className="text-sm font-medium text-muted mb-1">타석 수</h3>
                  <p>{range.booth_count}타석</p>
                </div>
              )}
              {!range.operating_hours && !range.price_info && !range.floor_count && !range.booth_count && (
                <p className="text-muted">등록된 운영 정보가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
