import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/ui/Card'

export default async function StudentDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 학생 정보 조회
  const { data: studentInfo } = await (supabase as any)
    .from('lesson_students')
    .select(`
      *,
      profiles!lesson_students_pro_id_fkey (
        full_name,
        pro_certification,
        pro_phone
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (!studentInfo) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">학생 등록 대기 중</h1>
          <p className="text-gray-600">레슨 프로가 회원님을 학생으로 등록하면 이곳에서 레슨 정보를 확인할 수 있습니다.</p>
          <Link href="/" className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  // 현재 수강권 조회
  const { data: activePackage } = await (supabase as any)
    .from('lesson_packages')
    .select('*')
    .eq('student_id', studentInfo.id)
    .eq('status', 'active')
    .single()

  // 최근 레슨 기록 조회
  const { data: recentLessons } = await (supabase as any)
    .from('lesson_schedules')
    .select(`
      *,
      lesson_notes (
        content,
        homework
      )
    `)
    .eq('student_id', studentInfo.id)
    .order('lesson_date', { ascending: false })
    .order('lesson_time', { ascending: false })
    .limit(5)

  // 다음 레슨 일정 조회
  const today = new Date().toISOString().split('T')[0]
  const { data: upcomingLessons } = await (supabase as any)
    .from('lesson_schedules')
    .select('*')
    .eq('student_id', studentInfo.id)
    .eq('status', 'scheduled')
    .gte('lesson_date', today)
    .order('lesson_date')
    .order('lesson_time')
    .limit(3)

  // 통계 계산
  const { data: allLessons } = await (supabase as any)
    .from('lesson_schedules')
    .select('status')
    .eq('student_id', studentInfo.id)

  const completedCount = allLessons?.filter((l: any) => l.status === 'completed').length || 0
  const totalCount = allLessons?.length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold text-emerald-600">
                Golfearn
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-700">내 레슨</span>
            </div>
            <Link href="/mypage" className="text-gray-600 hover:text-gray-900">
              마이페이지
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 프로 정보 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">담당 프로</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-2xl text-emerald-600">👨‍🏫</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {studentInfo.profiles?.full_name} 프로
                </div>
                <div className="text-sm text-gray-600">
                  {studentInfo.profiles?.pro_certification}
                </div>
                <div className="text-sm text-gray-600">
                  📞 {studentInfo.profiles?.pro_phone}
                </div>
              </div>
            </div>
          </Card>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-gray-600">현재 레벨</div>
              <div className="text-2xl font-bold text-gray-900">{studentInfo.current_level}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600">평균 스코어</div>
              <div className="text-2xl font-bold text-blue-600">
                {studentInfo.average_score || '-'}타
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600">총 레슨</div>
              <div className="text-2xl font-bold text-emerald-600">{totalCount}회</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600">완료 레슨</div>
              <div className="text-2xl font-bold text-green-600">{completedCount}회</div>
            </Card>
          </div>

          {/* 현재 수강권 */}
          {activePackage && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">현재 수강권</h2>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{activePackage.package_name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      기간: {new Date(activePackage.start_date).toLocaleDateString('ko-KR')} ~ 
                      {new Date(activePackage.end_date).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">
                      잔여 {activePackage.remaining_count || 0}회
                    </div>
                    <div className="text-sm text-gray-600">
                      / 총 {activePackage.total_count}회
                    </div>
                  </div>
                </div>
                {activePackage.payment_status !== 'paid' && (
                  <div className="mt-3 text-sm text-red-600">
                    ⚠️ 미납금: {(activePackage.price - (activePackage.paid_amount || 0)).toLocaleString()}원
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* 다음 레슨 일정 */}
          {upcomingLessons && upcomingLessons.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">다음 레슨 일정</h2>
              <div className="space-y-3">
                {upcomingLessons.map((lesson: any) => (
                  <div key={lesson.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {new Date(lesson.lesson_date).toLocaleDateString('ko-KR', { 
                          month: 'long', 
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </div>
                      <div className="text-sm text-gray-600">
                        {lesson.lesson_time?.slice(0, 5)} • {lesson.duration}분 • {lesson.location}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      예정
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 최근 레슨 기록 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 레슨 기록</h2>
            {recentLessons && recentLessons.length > 0 ? (
              <div className="space-y-4">
                {recentLessons.map((lesson: any) => (
                  <div key={lesson.id} className="border-l-4 border-emerald-600 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">
                          {new Date(lesson.lesson_date).toLocaleDateString('ko-KR')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {lesson.lesson_time?.slice(0, 5)} • {lesson.duration}분 • {lesson.location}
                        </div>
                        {lesson.lesson_notes && lesson.lesson_notes[0] && (
                          <div className="mt-2 text-sm">
                            <div className="text-gray-700">
                              📝 {lesson.lesson_notes[0].content}
                            </div>
                            {lesson.lesson_notes[0].homework && (
                              <div className="mt-1 text-emerald-600">
                                📌 숙제: {lesson.lesson_notes[0].homework}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        lesson.status === 'completed' ? 'bg-green-100 text-green-800' :
                        lesson.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lesson.status === 'completed' ? '완료' :
                         lesson.status === 'cancelled' ? '취소' :
                         lesson.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">아직 레슨 기록이 없습니다.</p>
            )}
          </Card>

          {/* 목표 및 메모 */}
          {(studentInfo.goal || studentInfo.student_memo) && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">나의 목표</h2>
              {studentInfo.goal && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700">목표</div>
                  <div className="text-gray-900">{studentInfo.goal}</div>
                </div>
              )}
              {studentInfo.student_memo && (
                <div>
                  <div className="text-sm font-medium text-gray-700">메모</div>
                  <div className="text-gray-900">{studentInfo.student_memo}</div>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}