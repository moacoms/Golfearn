import Link from 'next/link'

export default function MyPage() {
  // TODO: Get user data from Supabase
  const user = {
    username: '골린이',
    email: 'user@example.com',
    avatar_url: null,
    golf_started_at: '2024-01-01',
    average_score: 120,
    location: '서울',
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
              🏌️
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <Link href="/mypage/profile" className="text-sm text-primary hover:underline">
                  프로필 수정
                </Link>
              </div>
              <p className="text-muted mb-4">{user.email}</p>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {user.average_score}
                  </p>
                  <p className="text-sm text-muted">평균 스코어</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">1년</p>
                  <p className="text-sm text-muted">골프 경력</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{user.location}</p>
                  <p className="text-sm text-muted">지역</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <MenuCard
            href="/mypage/posts"
            icon="📝"
            title="내 게시글"
            description="작성한 게시글을 확인합니다"
            count={5}
          />
          <MenuCard
            href="/mypage/products"
            icon="🛒"
            title="내 판매 상품"
            description="등록한 판매 상품을 관리합니다"
            count={2}
          />
          <MenuCard
            href="/mypage/likes"
            icon="❤️"
            title="관심 상품"
            description="찜한 상품 목록을 확인합니다"
            count={8}
          />
          <MenuCard
            href="/mypage/messages"
            icon="💬"
            title="채팅"
            description="거래 채팅 목록을 확인합니다"
            count={3}
          />
        </div>

        {/* Logout */}
        <div className="mt-8 text-center">
          <button className="text-muted hover:text-red-500 transition-colors">
            로그아웃
          </button>
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
}: {
  href: string
  icon: string
  title: string
  description: string
  count: number
}) {
  return (
    <Link href={href}>
      <div className="card hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="text-3xl">{icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{title}</h3>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-sm rounded-full">
                {count}
              </span>
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
