import Link from 'next/link'
import { getJoinPosts } from '@/lib/actions/join'
import { getUserLocation } from '@/lib/actions/location'
import JoinCard from '@/components/join/JoinCard'
import JoinClientWrapper from './JoinClientWrapper'

// 날짜 범위 계산
function getDateRange(dateFilter: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (dateFilter) {
    case 'today':
      return {
        from: today.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
      }
    case 'week': {
      const endOfWeek = new Date(today)
      const dayOfWeek = today.getDay()
      endOfWeek.setDate(today.getDate() + (7 - dayOfWeek))
      return {
        from: today.toISOString().split('T')[0],
        to: endOfWeek.toISOString().split('T')[0],
      }
    }
    case 'nextweek': {
      const startOfNextWeek = new Date(today)
      const dayOfWeek = today.getDay()
      startOfNextWeek.setDate(today.getDate() + (7 - dayOfWeek) + 1)
      const endOfNextWeek = new Date(startOfNextWeek)
      endOfNextWeek.setDate(startOfNextWeek.getDate() + 6)
      return {
        from: startOfNextWeek.toISOString().split('T')[0],
        to: endOfNextWeek.toISOString().split('T')[0],
      }
    }
    default:
      // 오늘 이후 모든 조인
      return {
        from: today.toISOString().split('T')[0],
        to: undefined,
      }
  }
}

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string
    score?: string
    status?: string
    search?: string
    range?: string
    lat?: string
    lng?: string
  }>
}) {
  const params = await searchParams

  // 사용자 위치 정보
  const locationResult = await getUserLocation()
  const userLocation = locationResult.success ? locationResult.location : null

  // 날짜 범위 계산
  const dateRange = getDateRange(params.date || 'all')

  // 위치 필터
  const locationFilter =
    params.range && params.lat && params.lng
      ? {
          lat: parseFloat(params.lat),
          lng: parseFloat(params.lng),
          range: parseInt(params.range),
        }
      : userLocation?.lat && userLocation?.lng && userLocation?.dong
      ? {
          lat: userLocation.lat,
          lng: userLocation.lng,
          range: userLocation.range,
        }
      : undefined

  // 실력 필터
  const minScore = params.score && params.score !== 'all' ? parseInt(params.score) : undefined

  // 조인 목록 조회
  const posts = await getJoinPosts({
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
    location: locationFilter,
    minScore,
    status: params.status,
    search: params.search,
  })

  return (
    <div className="py-12">
      <div className="container">
        {/* 헤더 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">골린이 조인</h1>
            <p className="text-muted">비슷한 실력끼리 부담없이 라운딩해요</p>
          </div>
          <Link href="/join/create" className="btn btn-primary">
            모집하기
          </Link>
        </div>

        {/* 필터 */}
        <JoinClientWrapper userLocation={userLocation} />

        {/* 조인 목록 */}
        {posts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <JoinCard key={post.id} post={post} />
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-muted text-lg mb-4">아직 등록된 조인이 없습니다</p>
            <Link href="/join/create" className="btn btn-primary">
              첫 조인 모집하기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
