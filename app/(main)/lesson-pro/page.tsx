import Link from 'next/link'
import { getLessonPros } from '@/lib/actions/lesson-pros'
import {
  specialtyOptions,
  lessonTypeOptions,
  regionOptions,
} from '@/lib/lesson-pro-constants'
import LessonProFilters from './LessonProFilters'

export const metadata = {
  title: '레슨프로 찾기',
  description: '골린이를 위한 레슨프로 찾기. 초보 전문 프로를 만나 실력을 키워보세요.',
  openGraph: {
    title: '레슨프로 찾기 | Golfearn',
    description: '골린이를 위한 레슨프로 찾기. 초보 전문 프로를 만나 실력을 키워보세요.',
  },
}

function formatPrice(price: number | null): string {
  if (!price) return '-'
  return price.toLocaleString() + '원'
}

export default async function LessonProPage({
  searchParams,
}: {
  searchParams: Promise<{
    region?: string
    specialty?: string
    lessonType?: string
    sortBy?: string
    search?: string
  }>
}) {
  const params = await searchParams

  const pros = await getLessonPros({
    region: params.region,
    specialty: params.specialty,
    lessonType: params.lessonType,
    sortBy: params.sortBy as 'rating' | 'review_count' | 'price_low' | 'price_high' | undefined,
    search: params.search,
  })

  return (
    <div className="py-12">
      <div className="container">
        {/* 헤더 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">레슨프로 찾기</h1>
            <p className="text-muted">골린이 전문 프로님들을 만나보세요</p>
          </div>
          <Link href="/lesson-pro/register" className="btn btn-primary">
            레슨프로 등록하기
          </Link>
        </div>

        {/* 필터 */}
        <LessonProFilters
          regions={regionOptions}
          specialties={specialtyOptions}
          lessonTypes={lessonTypeOptions}
        />

        {/* 프로 목록 */}
        {pros.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pros.map((pro) => (
              <Link key={pro.id} href={`/lesson-pro/${pro.id}`}>
                <article className="card p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                  {/* 프로필 이미지 */}
                  <div className="relative aspect-[4/3] bg-gray-100">
                    {pro.profile_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pro.profile_image}
                        alt={pro.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    {pro.is_verified && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-white text-xs rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        인증됨
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-semibold text-lg">{pro.name} 프로</h2>
                      <div className="flex items-center gap-1 text-sm">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        <span className="font-medium">{pro.rating.toFixed(1)}</span>
                        <span className="text-muted">({pro.review_count})</span>
                      </div>
                    </div>

                    {/* 경력 */}
                    {pro.experience_years && (
                      <p className="text-sm text-muted mb-2">
                        경력 {pro.experience_years}년
                      </p>
                    )}

                    {/* 전문 분야 */}
                    {pro.specialties && pro.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {pro.specialties.slice(0, 3).map((specialty) => {
                          const option = specialtyOptions.find((o) => o.value === specialty)
                          return (
                            <span
                              key={specialty}
                              className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {option?.label || specialty}
                            </span>
                          )
                        })}
                        {pro.specialties.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-muted text-xs rounded-full">
                            +{pro.specialties.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 지역 */}
                    {pro.regions && pro.regions.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted mb-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {pro.regions.slice(0, 2).map((region) => {
                          const option = regionOptions.find((o) => o.value === region)
                          return option?.label || region
                        }).join(', ')}
                        {pro.regions.length > 2 && ` 외 ${pro.regions.length - 2}곳`}
                      </div>
                    )}

                    {/* 가격 */}
                    <div className="pt-3 border-t flex items-center justify-between">
                      <span className="text-sm text-muted">1:1 레슨</span>
                      <span className="font-bold text-primary">
                        {formatPrice(pro.price_individual)}
                      </span>
                    </div>
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <p className="text-muted text-lg mb-2">등록된 레슨프로가 없습니다</p>
            <p className="text-muted text-sm mb-6">
              조건을 변경하여 다시 검색해보세요
            </p>
            <Link href="/lesson-pro/register" className="btn btn-primary">
              레슨프로로 등록하기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
