import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'

export default async function ProDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 오늘 날짜
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  // 통계 데이터 가져오기
  const [
    { data: todaySchedules },
    { data: activeStudents },
    { data: activePackages },
    { data: monthIncome }
  ] = await Promise.all([
    // 오늘 스케줄
    supabase
      .from('lesson_schedules')
      .select('*, lesson_students(student_name)')
      .eq('pro_id', user.id)
      .eq('lesson_date', today)
      .order('lesson_time'),
    
    // 활성 학생 수
    supabase
      .from('lesson_students')
      .select('id')
      .eq('pro_id', user.id)
      .eq('is_active', true),
    
    // 활성 수강권
    supabase
      .from('lesson_packages')
      .select('id')
      .eq('pro_id', user.id)
      .eq('status', 'active'),
    
    // 이번 달 수입
    supabase
      .from('pro_income_records')
      .select('amount')
      .eq('pro_id', user.id)
      .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  ])

  const totalMonthIncome = monthIncome?.reduce((sum, record) => sum + record.amount, 0) || 0

  // 내일 스케줄
  const { data: tomorrowSchedules } = await supabase
    .from('lesson_schedules')
    .select('*, lesson_students(student_name)')
    .eq('pro_id', user.id)
    .eq('lesson_date', tomorrow)
    .order('lesson_time')

  // 만료 임박 수강권 (7일 이내)
  const sevenDaysLater = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  const { data: expiringPackages } = await supabase
    .from('lesson_packages')
    .select('*, lesson_students(student_name)')
    .eq('pro_id', user.id)
    .eq('status', 'active')
    .lte('end_date', sevenDaysLater)
    .gte('end_date', today)
    .order('end_date')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-2">오늘 레슨</div>
          <div className="text-3xl font-bold text-emerald-600">
            {todaySchedules?.length || 0}건
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-2">활성 학생</div>
          <div className="text-3xl font-bold text-blue-600">
            {activeStudents?.length || 0}명
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-2">활성 수강권</div>
          <div className="text-3xl font-bold text-purple-600">
            {activePackages?.length || 0}개
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-2">이번 달 수입</div>
          <div className="text-3xl font-bold text-green-600">
            {totalMonthIncome.toLocaleString()}원
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 오늘 일정 */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">오늘 일정</h2>
            <Link href="/pro/schedule" className="text-sm text-emerald-600 hover:text-emerald-700">
              전체보기 →
            </Link>
          </div>
          
          {todaySchedules && todaySchedules.length > 0 ? (
            <div className="space-y-3">
              {todaySchedules.map((schedule: any) => (
                <div key={schedule.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      {schedule.lesson_time?.slice(0, 5)} - {schedule.lesson_students?.student_name}
                    </div>
                    <div className="text-sm text-gray-600">{schedule.location}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                    schedule.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {schedule.status === 'scheduled' ? '예정' :
                     schedule.status === 'completed' ? '완료' :
                     schedule.status === 'cancelled' ? '취소' : schedule.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">오늘 예정된 레슨이 없습니다.</p>
          )}
        </Card>

        {/* 내일 일정 */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">내일 일정</h2>
            <Link href="/pro/schedule" className="text-sm text-emerald-600 hover:text-emerald-700">
              일정 추가 +
            </Link>
          </div>
          
          {tomorrowSchedules && tomorrowSchedules.length > 0 ? (
            <div className="space-y-3">
              {tomorrowSchedules.map((schedule: any) => (
                <div key={schedule.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      {schedule.lesson_time?.slice(0, 5)} - {schedule.lesson_students?.student_name}
                    </div>
                    <div className="text-sm text-gray-600">{schedule.location}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">내일 예정된 레슨이 없습니다.</p>
          )}
        </Card>
      </div>

      {/* 알림 섹션 */}
      {expiringPackages && expiringPackages.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ⚠️ 만료 임박 수강권
          </h2>
          <div className="space-y-2">
            {expiringPackages.map((pkg: any) => (
              <div key={pkg.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div>
                  <span className="font-medium">{pkg.lesson_students?.student_name}</span>
                  <span className="text-gray-600 ml-2">{pkg.package_name}</span>
                </div>
                <div className="text-sm">
                  <span className="text-red-600 font-medium">
                    {new Date(pkg.end_date).toLocaleDateString()} 만료
                  </span>
                  <span className="text-gray-600 ml-2">
                    (잔여 {pkg.remaining_count || 0}회)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 빠른 작업 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/pro/students/new" className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center">
          <div className="text-2xl mb-2">➕</div>
          <div className="text-sm font-medium text-gray-700">학생 추가</div>
        </Link>
        <Link href="/pro/schedule/new" className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center">
          <div className="text-2xl mb-2">📅</div>
          <div className="text-sm font-medium text-gray-700">일정 추가</div>
        </Link>
        <Link href="/pro/packages/new" className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center">
          <div className="text-2xl mb-2">🎫</div>
          <div className="text-sm font-medium text-gray-700">수강권 등록</div>
        </Link>
        <Link href="/pro/income/new" className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-sm font-medium text-gray-700">수입 기록</div>
        </Link>
      </div>
    </div>
  )
}