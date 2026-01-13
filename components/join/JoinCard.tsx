import Link from 'next/link'
import { JoinPostWithHost } from '@/types/database'
import { formatPrice } from '@/lib/utils'

interface JoinCardProps {
  post: JoinPostWithHost
}

export default function JoinCard({ post }: JoinCardProps) {
  const roundDate = new Date(post.round_date)
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const dayName = dayNames[roundDate.getDay()]

  const formattedDate = `${roundDate.getMonth() + 1}/${roundDate.getDate()} (${dayName})`
  const formattedTime = post.round_time.slice(0, 5)

  const isFullOrClosed = post.status === 'full' || post.status === 'confirmed' || post.status === 'completed'

  // 총 비용 계산
  const totalFee = (post.green_fee || 0) + (post.cart_fee || 0) + (post.caddie_fee || 0)

  return (
    <Link href={`/join/${post.id}`}>
      <article className="card p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
        {/* 날짜/시간 헤더 */}
        <div className={`px-4 py-3 ${isFullOrClosed ? 'bg-gray-100' : 'bg-primary/10'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${isFullOrClosed ? 'text-gray-500' : 'text-primary'}`}>
                {formattedDate}
              </span>
              <span className={`text-lg ${isFullOrClosed ? 'text-gray-500' : 'text-primary'}`}>
                {formattedTime}
              </span>
            </div>
            {/* 상태 뱃지 */}
            {post.status === 'recruiting' && (
              <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">모집중</span>
            )}
            {post.status === 'full' && (
              <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">마감</span>
            )}
            {post.status === 'confirmed' && (
              <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">확정</span>
            )}
            {post.status === 'completed' && (
              <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full">완료</span>
            )}
          </div>
        </div>

        {/* 내용 */}
        <div className="p-4">
          {/* 제목 */}
          <h3 className="font-semibold text-lg mb-2 truncate">{post.title}</h3>

          {/* 골프장 */}
          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{post.golf_course_name}</span>
          </div>

          {/* 모집 현황 */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm">
                <span className="font-bold text-primary">{post.current_slots}</span>
                <span className="text-gray-500">/{post.total_slots}명</span>
              </span>
            </div>

            {/* 실력 조건 */}
            {(post.min_score || post.max_score) && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>
                  {post.min_score && post.max_score
                    ? `${post.min_score}~${post.max_score}타`
                    : post.min_score
                    ? `${post.min_score}타+`
                    : `~${post.max_score}타`}
                </span>
              </div>
            )}
          </div>

          {/* 하단 정보 */}
          <div className="flex items-center justify-between pt-3 border-t">
            {/* 호스트 정보 */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs overflow-hidden">
                {post.profiles?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.profiles.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-600">
                {post.profiles?.username || post.profiles?.full_name || '익명'}
                {post.profiles?.average_score && (
                  <span className="text-gray-400 ml-1">({post.profiles.average_score}타)</span>
                )}
              </span>
            </div>

            {/* 비용 */}
            {totalFee > 0 && (
              <span className="text-sm font-medium text-gray-700">
                {formatPrice(totalFee)}
              </span>
            )}

            {/* 거리 */}
            {post.distance !== undefined && (
              <span className="text-sm text-primary font-medium">
                {post.distance < 1
                  ? `${Math.round(post.distance * 1000)}m`
                  : `${post.distance.toFixed(1)}km`}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
