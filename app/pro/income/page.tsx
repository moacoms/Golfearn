import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Card from '@/components/ui/Card'

export default async function IncomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 이번 달 수입 조회
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

  const { data: monthIncome } = await supabase
    .from('pro_income_records')
    .select('*')
    .eq('pro_id', user.id)
    .gte('payment_date', startOfMonth)
    .lte('payment_date', endOfMonth)
    .order('payment_date', { ascending: false })

  // 이번 달 통계
  const totalIncome = monthIncome?.reduce((sum, record: any) => sum + record.amount, 0) || 0
  const cashIncome = monthIncome?.filter((r: any) => r.payment_method === 'cash')
    .reduce((sum, record: any) => sum + record.amount, 0) || 0
  const transferIncome = monthIncome?.filter((r: any) => r.payment_method === 'transfer')
    .reduce((sum, record: any) => sum + record.amount, 0) || 0
  const cardIncome = monthIncome?.filter((r: any) => r.payment_method === 'card')
    .reduce((sum, record: any) => sum + record.amount, 0) || 0

  // 전월 대비 통계
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()
  
  const { data: prevMonthIncome } = await supabase
    .from('pro_income_records')
    .select('amount')
    .eq('pro_id', user.id)
    .gte('payment_date', prevMonthStart)
    .lte('payment_date', prevMonthEnd)

  const prevTotal = prevMonthIncome?.reduce((sum, record: any) => sum + record.amount, 0) || 0
  const growthRate = prevTotal > 0 ? Math.round(((totalIncome - prevTotal) / prevTotal) * 100) : 0

  // 미수금 현황
  const { data: unpaidPackages } = await supabase
    .from('lesson_packages')
    .select('*, lesson_students(student_name)')
    .eq('pro_id', user.id)
    .eq('payment_status', 'partial')

  const totalUnpaid = unpaidPackages?.reduce((sum, pkg: any) => 
    sum + (pkg.price - (pkg.paid_amount || 0)), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">수입 관리</h1>
        <Link 
          href="/pro/income/new"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + 수입 기록
        </Link>
      </div>

      {/* 월간 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-2">이번 달 총 수입</div>
          <div className="text-3xl font-bold text-emerald-600">
            {totalIncome.toLocaleString()}원
          </div>
          {growthRate !== 0 && (
            <div className={`text-sm mt-2 ${growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
              전월 대비 {growthRate > 0 ? '+' : ''}{growthRate}%
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-2">현금 수입</div>
          <div className="text-3xl font-bold text-blue-600">
            {cashIncome.toLocaleString()}원
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {totalIncome > 0 ? Math.round((cashIncome / totalIncome) * 100) : 0}%
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-2">계좌이체</div>
          <div className="text-3xl font-bold text-purple-600">
            {transferIncome.toLocaleString()}원
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {totalIncome > 0 ? Math.round((transferIncome / totalIncome) * 100) : 0}%
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-2">미수금</div>
          <div className="text-3xl font-bold text-red-600">
            {totalUnpaid.toLocaleString()}원
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {unpaidPackages?.length || 0}건
          </div>
        </Card>
      </div>

      {/* 최근 수입 내역 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">이번 달 수입 내역</h2>
        {monthIncome && monthIncome.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-medium text-gray-700">날짜</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-700">유형</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-700">결제수단</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-700">금액</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-700">메모</th>
                </tr>
              </thead>
              <tbody>
                {monthIncome.map((record: any) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 text-sm">
                      {new Date(record.payment_date).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.income_type === 'lesson' ? 'bg-blue-100 text-blue-800' :
                        record.income_type === 'package' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {record.income_type === 'lesson' ? '레슨료' :
                         record.income_type === 'package' ? '수강권' :
                         '기타'}
                      </span>
                    </td>
                    <td className="py-3 text-sm">
                      {record.payment_method === 'cash' ? '💵 현금' :
                       record.payment_method === 'transfer' ? '🏦 계좌이체' :
                       record.payment_method === 'card' ? '💳 카드' :
                       record.payment_method}
                    </td>
                    <td className="py-3 text-sm text-right font-medium">
                      {record.amount.toLocaleString()}원
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {record.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">이번 달 수입 내역이 없습니다.</p>
        )}
      </Card>

      {/* 미수금 현황 */}
      {unpaidPackages && unpaidPackages.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ⚠️ 미수금 현황
          </h2>
          <div className="space-y-3">
            {unpaidPackages.map((pkg: any) => {
              const unpaidAmount = pkg.price - (pkg.paid_amount || 0)
              return (
                <div key={pkg.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <span className="font-medium">{pkg.lesson_students?.student_name}</span>
                    <span className="text-gray-600 ml-2">{pkg.package_name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-red-600">
                      미수: {unpaidAmount.toLocaleString()}원
                    </div>
                    <div className="text-sm text-gray-600">
                      총 {pkg.price.toLocaleString()}원 중 {pkg.paid_amount?.toLocaleString() || 0}원 납부
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}