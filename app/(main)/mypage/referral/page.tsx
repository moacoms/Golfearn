import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyReferralCode, getMyReferralStats, getMyReferrals } from '@/lib/actions/referrals'
import { ReferralShareButton } from '@/components/ShareButton'
import Link from 'next/link'

export default async function ReferralPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: referralCode } = await getMyReferralCode()
  const { data: stats } = await getMyReferralStats()
  const { data: referrals } = await getMyReferrals()

  // 추천 보상 계산
  const totalReferrals = stats?.total_referrals || 0
  const premiumRewards = [
    { count: 5, reward: '프리미엄 1개월', achieved: totalReferrals >= 5 },
    { count: 10, reward: '프리미엄 3개월', achieved: totalReferrals >= 10 },
    { count: 20, reward: '프리미엄 1년 + 골프공 1더즌', achieved: totalReferrals >= 20 },
  ]

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

        <h1 className="text-3xl font-bold mb-2">친구 초대하기</h1>
        <p className="text-gray-600 mb-8">친구를 초대하고 보상을 받으세요!</p>

        {/* 내 추천 코드 */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white mb-6">
          <h2 className="text-xl font-bold mb-4">내 추천 코드</h2>
          <div className="flex items-center justify-between bg-white/20 rounded-lg p-4">
            <div>
              <p className="text-sm opacity-90 mb-1">추천 코드</p>
              <p className="text-3xl font-bold tracking-wider">{referralCode?.code || 'LOADING...'}</p>
            </div>
            <ReferralShareButton referralCode={referralCode?.code || ''} className="bg-white text-green-600 hover:bg-gray-100" />
          </div>
          <p className="text-sm mt-4 opacity-90">친구가 이 코드로 가입하면 친구는 3,000P, 나는 5,000P를 받아요!</p>
        </div>

        {/* 추천 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-gray-600 text-sm mb-2">총 추천 수</p>
            <p className="text-3xl font-bold text-green-600">{totalReferrals}명</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-gray-600 text-sm mb-2">추천 보상</p>
            <p className="text-3xl font-bold text-green-600">{(totalReferrals * 5000).toLocaleString()}P</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-gray-600 text-sm mb-2">다음 목표</p>
            <p className="text-xl font-bold text-gray-800">
              {totalReferrals < 5 ? '5명 달성' : totalReferrals < 10 ? '10명 달성' : totalReferrals < 20 ? '20명 달성' : '완료!'}
            </p>
          </div>
        </div>

        {/* 추천 보상 단계 */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-4">추천 달성 보상</h2>
          <div className="space-y-4">
            {premiumRewards.map((reward, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  reward.achieved ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                      reward.achieved ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {reward.count}명
                  </div>
                  <div>
                    <p className="font-semibold">{reward.reward}</p>
                    <p className="text-sm text-gray-600">
                      {totalReferrals >= reward.count ? '달성 완료!' : `${reward.count - totalReferrals}명 남음`}
                    </p>
                  </div>
                </div>
                {reward.achieved && (
                  <div className="text-green-500">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 추천한 친구 목록 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">추천한 친구 목록</h2>
          {referrals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">아직 추천한 친구가 없습니다</p>
              <p className="text-sm text-gray-500">위의 추천 코드를 공유하고 친구를 초대해보세요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">친구 #{referral.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">{new Date(referral.created_at).toLocaleDateString('ko-KR')}</p>
                    </div>
                  </div>
                  <div>
                    {referral.reward_given ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">보상 지급 완료</span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">처리 중</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 공유 방법 안내 */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h3 className="font-bold mb-3 text-blue-900">친구 초대 방법</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>위의 "공유하기" 버튼을 클릭하여 친구에게 추천 코드를 공유하세요</li>
            <li>친구가 추천 코드로 회원가입을 완료하면 자동으로 보상이 지급됩니다</li>
            <li>친구는 3,000P, 나는 5,000P를 받을 수 있어요</li>
            <li>추천 인원에 따라 프리미엄 멤버십 등 추가 보상을 받을 수 있습니다</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
