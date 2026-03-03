import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ScheduleCalendar from '@/components/pro/ScheduleCalendar'

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 이번 달 스케줄 가져오기
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]

  const { data: schedules } = await supabase
    .from('lesson_schedules')
    .select(`
      *,
      lesson_students (
        student_name,
        student_phone
      )
    `)
    .eq('pro_id', user.id)
    .gte('lesson_date', startOfMonth)
    .lte('lesson_date', endOfMonth)
    .order('lesson_date')
    .order('lesson_time')

  // 학생 목록 (스케줄 추가용)
  const { data: students } = await supabase
    .from('lesson_students')
    .select('id, student_name')
    .eq('pro_id', user.id)
    .eq('is_active', true)
    .order('student_name')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">스케줄 관리</h1>
        <Link 
          href="/pro/schedule/new"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + 일정 추가
        </Link>
      </div>

      {/* 캘린더 뷰 */}
      <ScheduleCalendar 
        schedules={schedules || []} 
        students={students || []}
      />
    </div>
  )
}