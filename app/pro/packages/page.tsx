import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import PackageList from '@/components/pro/PackageList'

export default async function PackagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 수강권 목록 가져오기
  const { data: packages } = await supabase
    .from('lesson_packages')
    .select(`
      *,
      lesson_students (
        student_name,
        student_phone
      )
    `)
    .eq('pro_id', user.id)
    .order('created_at', { ascending: false })

  // 통계
  const activePackages = packages?.filter(p => p.status === 'active') || []
  const expiredPackages = packages?.filter(p => p.status === 'expired') || []
  const completedPackages = packages?.filter(p => p.status === 'completed') || []

  // 총 미수금 계산
  const totalUnpaid = packages?.reduce((sum, pkg) => {
    if (pkg.payment_status !== 'paid') {
      return sum + (pkg.price - (pkg.paid_amount || 0))
    }
    return sum
  }, 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">수강권 관리</h1>
        <Link 
          href="/pro/packages/new"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + 수강권 등록
        </Link>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">활성 수강권</div>
          <div className="text-2xl font-bold text-emerald-600">{activePackages.length}개</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">만료된 수강권</div>
          <div className="text-2xl font-bold text-gray-400">{expiredPackages.length}개</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">완료된 수강권</div>
          <div className="text-2xl font-bold text-blue-600">{completedPackages.length}개</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">총 미수금</div>
          <div className="text-2xl font-bold text-red-600">{totalUnpaid.toLocaleString()}원</div>
        </Card>
      </div>

      {/* 수강권 목록 */}
      <PackageList packages={packages || []} />
    </div>
  )
}