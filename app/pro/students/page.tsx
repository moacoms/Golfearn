import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import StudentList from '@/components/pro/StudentList'

export default async function StudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 학생 목록 가져오기
  const { data: students } = await supabase
    .from('lesson_students')
    .select(`
      *,
      lesson_packages (
        id,
        package_name,
        status,
        end_date,
        remaining_count
      )
    `)
    .eq('pro_id', user.id)
    .order('created_at', { ascending: false })

  // 통계
  const activeStudents = students?.filter((s: any) => s.is_active) || []
  const inactiveStudents = students?.filter((s: any) => !s.is_active) || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">학생 관리</h1>
        <Link 
          href="/pro/students/new"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + 학생 추가
        </Link>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">전체 학생</div>
          <div className="text-2xl font-bold text-gray-900">{students?.length || 0}명</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">활성 학생</div>
          <div className="text-2xl font-bold text-emerald-600">{activeStudents.length}명</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">비활성 학생</div>
          <div className="text-2xl font-bold text-gray-400">{inactiveStudents.length}명</div>
        </Card>
      </div>

      {/* 학생 목록 */}
      <StudentList students={students || []} />
    </div>
  )
}