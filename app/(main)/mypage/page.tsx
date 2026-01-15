import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfile, getMyPosts, getMyProducts, getMyFavorites } from '@/lib/actions/profile'
import { getMyJoins } from '@/lib/actions/join'
import { getBookmarkedPosts } from '@/lib/actions/posts'
import { getMyPointWallet } from '@/lib/actions/points'
import { getMyReferralStats } from '@/lib/actions/referrals'
import LogoutButton from './LogoutButton'

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [profile, posts, products, favorites, joins, bookmarks, pointWallet, referralStats] = await Promise.all([
    getProfile(),
    getMyPosts(),
    getMyProducts(),
    getMyFavorites(),
    getMyJoins(),
    getBookmarkedPosts(),
    getMyPointWallet(),
    getMyReferralStats(),
  ])

  // 골프 경력 계산
  const getGolfCareer = () => {
    if (!profile?.golf_started_at) return '-'
    const startDate = new Date(profile.golf_started_at)
    const now = new Date()
    const months = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth())
    if (months < 12) return `${months}개월`
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    return remainingMonths > 0 ? `${years}년 ${remainingMonths}개월` : `${years}년`
  }

  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

        {/* Profile Card */}
        <div className="card mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt="프로필"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-2xl font-bold">
                  {profile?.username || profile?.full_name || '골린이'}
                </h2>
                <Link href="/mypage/profile" className="text-sm text-primary hover:underline">
                  프로필 수정
                </Link>
              </div>
              <p className="text-muted mb-4">{user.email}</p>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {profile?.average_score || '-'}
                  </p>
                  <p className="text-sm text-muted">평균 스코어</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{getGolfCareer()}</p>
                  <p className="text-sm text-muted">골프 경력</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{profile?.location || '-'}</p>
                  <p className="text-sm text-muted">지역</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <MenuCard
            href="/mypage/points"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="포인트 & 리워드"
            description={`보유 ${pointWallet.data?.balance.toLocaleString() || 0}P`}
            count={pointWallet.data?.balance || 0}
            highlight
          />
          <MenuCard
            href="/mypage/referral"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            title="친구 초대하기"
            description={`${referralStats.data?.total_referrals || 0}명 초대 완료`}
            count={referralStats.data?.total_referrals || 0}
            highlight
          />
          <MenuCard
            href="/mypage/posts"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
            title="내 게시글"
            description="작성한 게시글을 확인합니다"
            count={posts.length}
          />
          <MenuCard
            href="/mypage/products"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
            title="내 판매 상품"
            description="등록한 판매 상품을 관리합니다"
            count={products.length}
          />
          <MenuCard
            href="/mypage/favorites"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
            title="관심 상품"
            description="찜한 상품 목록을 확인합니다"
            count={favorites.length}
          />
          <MenuCard
            href="/mypage/bookmarks"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            }
            title="북마크한 게시글"
            description="북마크한 커뮤니티 게시글을 확인합니다"
            count={bookmarks.length}
          />
          <MenuCard
            href="/mypage/joins"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            title="내 조인"
            description="모집하거나 신청한 조인을 확인합니다"
            count={joins.hosted.length + joins.participated.length}
          />
          <MenuCard
            href="/mypage/messages"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
            title="채팅"
            description="거래 채팅 목록을 확인합니다"
            count={0}
          />
        </div>

        {/* Logout */}
        <div className="mt-8 text-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

function MenuCard({
  href,
  icon,
  title,
  description,
  count,
  highlight = false,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  count: number
  highlight?: boolean
}) {
  return (
    <Link href={href}>
      <div className={`card hover:shadow-md transition-shadow cursor-pointer ${highlight ? 'border-2 border-green-500 bg-green-50' : ''}`}>
        <div className="flex items-center gap-4">
          <div className={highlight ? 'text-green-600' : 'text-primary'}>{icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{title}</h3>
              {count > 0 && !highlight && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-sm rounded-full">
                  {count}
                </span>
              )}
            </div>
            <p className="text-sm text-muted">{description}</p>
          </div>
          <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
