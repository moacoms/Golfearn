import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getJoinPost, getParticipants, incrementJoinPostView } from '@/lib/actions/join'
import { checkJoinChatAccess } from '@/lib/actions/join-chat'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import ApplyButton from './ApplyButton'
import ParticipantList from './ParticipantList'

export default async function JoinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const postId = parseInt(id)

  if (isNaN(postId)) {
    notFound()
  }

  // 조회수 증가
  await incrementJoinPostView(postId)

  const [post, participants] = await Promise.all([
    getJoinPost(postId),
    getParticipants(postId),
  ])

  if (!post) {
    notFound()
  }

  // 현재 사용자 확인
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isHost = user?.id === post.user_id
  const isLoggedIn = !!user

  // 채팅 권한 확인
  const chatAccess = await checkJoinChatAccess(postId)
  const canChat = chatAccess.hasAccess

  // 날짜 포맷
  const roundDate = new Date(post.round_date)
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const dayName = dayNames[roundDate.getDay()]
  const formattedDate = `${roundDate.getFullYear()}년 ${roundDate.getMonth() + 1}월 ${roundDate.getDate()}일 (${dayName})`
  const formattedTime = post.round_time.slice(0, 5)

  // 총 비용
  const totalFee = (post.green_fee || 0) + (post.cart_fee || 0) + (post.caddie_fee || 0)

  // 골프 경력 계산
  const getGolfCareer = (startDate: string | null) => {
    if (!startDate) return null
    const start = new Date(startDate)
    const now = new Date()
    const months =
      (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
    if (months < 12) return `${months}개월`
    const years = Math.floor(months / 12)
    return `${years}년`
  }

  return (
    <div className="py-12">
      <div className="container max-w-3xl">
        {/* 뒤로가기 */}
        <Link
          href="/join"
          className="inline-flex items-center gap-2 text-muted hover:text-primary mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </Link>

        {/* 상태 뱃지 */}
        <div className="flex items-center gap-2 mb-4">
          {post.status === 'recruiting' && (
            <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">모집중</span>
          )}
          {post.status === 'full' && (
            <span className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-full">마감</span>
          )}
          {post.status === 'confirmed' && (
            <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">확정</span>
          )}
          {post.status === 'completed' && (
            <span className="px-3 py-1 bg-gray-500 text-white text-sm rounded-full">완료</span>
          )}
        </div>

        {/* 제목 */}
        <h1 className="text-2xl font-bold mb-6">{post.title}</h1>

        {/* 라운딩 정보 카드 */}
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">라운딩 정보</h2>

          {/* 날짜/시간 */}
          <div className="flex items-center gap-3 mb-4 p-4 bg-primary/5 rounded-lg">
            <div className="w-12 h-12 bg-primary text-white rounded-lg flex flex-col items-center justify-center">
              <span className="text-xs">{roundDate.getMonth() + 1}월</span>
              <span className="text-lg font-bold">{roundDate.getDate()}</span>
            </div>
            <div>
              <p className="font-semibold">{formattedDate}</p>
              <p className="text-primary font-bold text-lg">{formattedTime} 티오프</p>
            </div>
          </div>

          {/* 골프장 */}
          <div className="flex items-start gap-3 mb-4">
            <svg
              className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div>
              <p className="font-medium">{post.golf_course_name}</p>
              {post.golf_course_address && (
                <p className="text-sm text-gray-500">{post.golf_course_address}</p>
              )}
            </div>
          </div>

          {/* 비용 정보 */}
          {totalFee > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">예상 비용 (1인)</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                {post.green_fee && post.green_fee > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">그린피</p>
                    <p className="font-semibold">{formatPrice(post.green_fee)}</p>
                  </div>
                )}
                {post.cart_fee && post.cart_fee > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">카트비</p>
                    <p className="font-semibold">{formatPrice(post.cart_fee)}</p>
                  </div>
                )}
                {post.caddie_fee && post.caddie_fee > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">캐디피</p>
                    <p className="font-semibold">{formatPrice(post.caddie_fee)}</p>
                  </div>
                )}
              </div>
              <div className="mt-3 text-right">
                <span className="text-sm text-gray-500">총 </span>
                <span className="text-lg font-bold text-primary">{formatPrice(totalFee)}</span>
              </div>
            </div>
          )}
        </div>

        {/* 모집 정보 카드 */}
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">모집 현황</h2>

          {/* 인원 프로그레스 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">모집 인원</span>
              <span>
                <span className="text-2xl font-bold text-primary">{post.current_slots}</span>
                <span className="text-gray-500">/{post.total_slots}명</span>
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(post.current_slots / post.total_slots) * 100}%` }}
              />
            </div>
          </div>

          {/* 실력 조건 */}
          {(post.min_score || post.max_score) && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="text-sm font-medium">실력 조건:</span>
                <span className="text-sm">
                  {post.min_score && post.max_score
                    ? `${post.min_score}타 ~ ${post.max_score}타`
                    : post.min_score
                    ? `${post.min_score}타 이상`
                    : `${post.max_score}타 이하`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 호스트 정보 */}
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">호스트</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {post.profiles?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.profiles.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="font-semibold">
                {post.profiles?.username || post.profiles?.full_name || '익명'}
              </p>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                {post.profiles?.average_score && (
                  <span>평균 {post.profiles.average_score}타</span>
                )}
                {post.profiles?.golf_started_at && (
                  <span>경력 {getGolfCareer(post.profiles.golf_started_at)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 상세 설명 */}
        {post.description && (
          <div className="card mb-6">
            <h2 className="font-semibold mb-4">상세 설명</h2>
            <p className="whitespace-pre-wrap text-gray-700">{post.description}</p>
          </div>
        )}

        {/* 참가자 목록 */}
        <div className="card mb-6">
          <ParticipantList participants={participants} isHost={isHost} />
        </div>

        {/* 액션 버튼 */}
        <div className="sticky bottom-4">
          <div className="card">
            {isHost ? (
              <div className="flex gap-3">
                <Link href={`/join/${post.id}/edit`} className="btn btn-outline flex-1">
                  수정하기
                </Link>
                <Link href={`/join/${post.id}/chat`} className="btn btn-primary flex-1">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  채팅
                </Link>
              </div>
            ) : canChat ? (
              <div className="flex gap-3">
                <ApplyButton
                  joinPostId={post.id}
                  isHost={isHost}
                  status={post.status}
                  isLoggedIn={isLoggedIn}
                />
                <Link href={`/join/${post.id}/chat`} className="btn btn-primary flex-1">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  채팅
                </Link>
              </div>
            ) : (
              <ApplyButton
                joinPostId={post.id}
                isHost={isHost}
                status={post.status}
                isLoggedIn={isLoggedIn}
              />
            )}
          </div>
        </div>

        {/* 조회수 */}
        <p className="text-center text-sm text-gray-400 mt-4">조회 {post.view_count}</p>
      </div>
    </div>
  )
}
