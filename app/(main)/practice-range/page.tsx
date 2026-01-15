import Link from 'next/link'
import { getPracticeRanges } from '@/lib/actions/practice-ranges'
import { facilityOptions, practiceRangeRegionOptions } from '@/lib/practice-range-constants'
import PracticeRangeFilters from './PracticeRangeFilters'

export const metadata = {
  title: '골프 연습장 찾기',
  description: '내 주변 골프 연습장을 찾아보세요. 실내, 야외, 스크린 연습장 정보를 한눈에.',
  openGraph: {
    title: '골프 연습장 찾기 | Golfearn',
    description: '내 주변 골프 연습장을 찾아보세요. 실내, 야외, 스크린 연습장 정보를 한눈에.',
  },
}

export default async function PracticeRangePage({
  searchParams,
}: {
  searchParams: Promise<{
    region?: string
    facility?: string
    search?: string
  }>
}) {
  const params = await searchParams

  const ranges = await getPracticeRanges({
    region: params.region,
    facility: params.facility,
    search: params.search,
  })

  return (
    <div className="py-12">
      <div className="container">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">골프 연습장 찾기</h1>
          <p className="text-muted">내 주변 골프 연습장을 찾아보세요</p>
        </div>

        {/* 필터 */}
        <PracticeRangeFilters
          regions={practiceRangeRegionOptions}
          facilities={facilityOptions}
        />

        {/* 연습장 목록 */}
        {ranges.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ranges.map((range) => (
              <Link key={range.id} href={`/practice-range/${range.id}`}>
                <article className="card p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                  {/* 이미지 */}
                  <div className="relative aspect-[4/3] bg-gray-100">
                    {range.images && range.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={range.images[0]}
                        alt={range.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                    {range.region && (
                      <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 text-sm rounded-full">
                        {range.region}
                      </span>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-semibold text-lg truncate">{range.name}</h2>
                      {range.google_rating > 0 && (
                        <div className="flex items-center gap-1 text-sm flex-shrink-0">
                          <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                          <span className="font-medium">{range.google_rating.toFixed(1)}</span>
                          <span className="text-muted">({range.google_review_count})</span>
                        </div>
                      )}
                    </div>

                    {/* 주소 */}
                    {range.address && (
                      <p className="text-sm text-muted mb-3 truncate">{range.address}</p>
                    )}

                    {/* 시설 */}
                    {range.facilities && range.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {range.facilities.slice(0, 4).map((facility) => {
                          const option = facilityOptions.find((o) => o.value === facility)
                          return (
                            <span
                              key={facility}
                              className="px-2 py-0.5 bg-gray-100 text-muted text-xs rounded-full"
                            >
                              {option?.label || facility}
                            </span>
                          )
                        })}
                        {range.facilities.length > 4 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-muted text-xs rounded-full">
                            +{range.facilities.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <p className="text-muted text-lg mb-2">등록된 연습장이 없습니다</p>
            <p className="text-muted text-sm">
              조건을 변경하여 다시 검색해보세요
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
