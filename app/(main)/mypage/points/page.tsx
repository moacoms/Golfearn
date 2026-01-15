import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyPointWallet, getPointTransactions, getMyExperience, getMyBadges } from '@/lib/actions/points'
import { CheckInButton } from './CheckInButton'
import Link from 'next/link'

export default async function PointsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: wallet } = await getMyPointWallet()
  const { data: transactions } = await getPointTransactions(20)
  const { data: experience } = await getMyExperience()
  const { data: badges } = await getMyBadges()

  // 레벨 이름 매핑
  const getLevelName = (level: number) => {
    switch (level) {
      case 1:
        return '새싹 골린이'
      case 2:
        return '성장하는 골린이'
      case 3:
        return '열심히 하는 골린이'
      case 4:
        return '진지한 골린이'
      case 5:
        return '골프 애호가'
      case 6:
        return '골프 마스터'
      default:
        return '골린이'
    }
  }

  // 다음 레벨까지 필요한 경험치
  const getNextLevelXp = (currentLevel: number) => {
    switch (currentLevel) {
      case 1:
        return 100
      case 2:
        return 500
      case 3:
        return 1500
      case 4:
        return 5000
      case 5:
        return 10000
      default:
        return 0
    }
  }

  const currentXp = experience?.total_xp || 0
  const currentLevel = experience?.level || 1
  const nextLevelXp = getNextLevelXp(currentLevel)
  const xpProgress = currentLevel >= 6 ? 100 : ((currentXp % nextLevelXp) / nextLevelXp) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/mypage" className="text-green-600 hover:text-green-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            마이페이지로 돌아가기
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">포인트 & 리워드</h1>
        <p className="text-gray-600 mb-8">활동하고 보상을 받으세요!</p>

        {/* 포인트 잔액 */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90 mb-1">보유 포인트</p>
              <p className="text-4xl font-bold">{wallet?.balance.toLocaleString() || 0}P</p>
            </div>
            <CheckInButton />
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <p className="opacity-75">누적 적립</p>
              <p className="font-semibold">{wallet?.total_earned.toLocaleString() || 0}P</p>
            </div>
            <div>
              <p className="opacity-75">누적 사용</p>
              <p className="font-semibold">{wallet?.total_spent.toLocaleString() || 0}P</p>
            </div>
          </div>
        </div>

        {/* 레벨 & 경험치 */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">현재 레벨</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-green-600">Lv.{currentLevel}</span>
                <span className="text-xl font-semibold text-gray-700">{getLevelName(currentLevel)}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-sm mb-1">총 경험치</p>
              <p className="text-2xl font-bold text-gray-800">{currentXp.toLocaleString()} XP</p>
            </div>
          </div>

          {/* 경험치 진행바 */}
          {currentLevel < 6 && (
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>다음 레벨까지</span>
                <span>
                  {currentXp % nextLevelXp} / {nextLevelXp} XP
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${xpProgress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* 획득한 뱃지 */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4">획득한 뱃지 ({badges.length}개)</h2>
          {badges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>아직 획득한 뱃지가 없습니다</p>
              <p className="text-sm mt-2">활동하고 다양한 뱃지를 획득해보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((userBadge) => (
                <div key={userBadge.id} className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-2">{userBadge.badge.icon}</div>
                  <p className="font-semibold text-sm mb-1">{userBadge.badge.name}</p>
                  <p className="text-xs text-gray-500">{new Date(userBadge.earned_at).toLocaleDateString('ko-KR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 포인트 사용처 */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-bold mb-3 text-blue-900">포인트 사용처</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              중고거래 결제 시 현금처럼 사용 (1P = 1원)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              레슨 예약 시 할인 (10,000P = 10,000원)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              프리미엄 구독권 구매 (9,900P = 1개월)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              골프용품 구매 시 할인
            </li>
          </ul>
        </div>

        {/* 포인트 적립 방법 */}
        <div className="bg-green-50 rounded-lg p-6 mb-8">
          <h3 className="font-bold mb-3 text-green-900">포인트 적립 방법</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between p-3 bg-white rounded">
              <span className="text-gray-700">회원가입</span>
              <span className="font-bold text-green-600">+3,000P</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded">
              <span className="text-gray-700">친구 추천</span>
              <span className="font-bold text-green-600">+5,000P</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded">
              <span className="text-gray-700">프로필 완성</span>
              <span className="font-bold text-green-600">+1,000P</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded">
              <span className="text-gray-700">첫 게시글 작성</span>
              <span className="font-bold text-green-600">+500P</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded">
              <span className="text-gray-700">리뷰 작성</span>
              <span className="font-bold text-green-600">+500P</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded">
              <span className="text-gray-700">조인 참가</span>
              <span className="font-bold text-green-600">+1,000P</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded">
              <span className="text-gray-700">중고거래 완료</span>
              <span className="font-bold text-green-600">+2,000P</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded">
              <span className="text-gray-700">일일 출석체크</span>
              <span className="font-bold text-green-600">+100P</span>
            </div>
          </div>
        </div>

        {/* 포인트 거래 내역 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">포인트 거래 내역</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">포인트 거래 내역이 없습니다</div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{tx.description || tx.category}</p>
                    <p className="text-sm text-gray-500">{new Date(tx.created_at).toLocaleString('ko-KR')}</p>
                  </div>
                  <div className={`font-bold text-lg ${tx.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'earn' ? '+' : '-'}
                    {tx.amount.toLocaleString()}P
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
