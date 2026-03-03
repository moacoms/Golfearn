'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'

interface Package {
  id: string
  package_name: string
  package_type: string
  total_count?: number
  used_count: number
  remaining_count?: number
  price: number
  paid_amount: number
  payment_status: string
  status: string
  start_date: string
  end_date: string
  lesson_students?: {
    student_name: string
    student_phone?: string
  }
}

interface PackageListProps {
  packages: Package[]
}

export default function PackageList({ packages }: PackageListProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'completed'>('all')
  const [filterPayment, setFilterPayment] = useState<'all' | 'paid' | 'unpaid'>('all')

  // 필터링
  const filteredPackages = packages.filter(pkg => {
    const matchesStatus = filterStatus === 'all' || pkg.status === filterStatus
    const matchesPayment = filterPayment === 'all' || 
                          (filterPayment === 'paid' && pkg.payment_status === 'paid') ||
                          (filterPayment === 'unpaid' && pkg.payment_status !== 'paid')
    return matchesStatus && matchesPayment
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string, paidAmount: number, price: number) => {
    if (status === 'paid') return 'bg-green-100 text-green-800'
    if (paidAmount > 0) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getPaymentStatusText = (status: string, paidAmount: number, price: number) => {
    if (status === 'paid') return '완납'
    if (paidAmount > 0) return `${paidAmount.toLocaleString()}원 / ${price.toLocaleString()}원`
    return '미납'
  }

  const getDaysRemaining = (endDate: string) => {
    const today = new Date()
    const end = new Date(endDate)
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div className="space-y-4">
      {/* 필터 */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                filterStatus === 'all' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                filterStatus === 'active' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              활성
            </button>
            <button
              onClick={() => setFilterStatus('expired')}
              className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                filterStatus === 'expired' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              만료
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                filterStatus === 'completed' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              완료
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterPayment('all')}
              className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                filterPayment === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterPayment('paid')}
              className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                filterPayment === 'paid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              완납
            </button>
            <button
              onClick={() => setFilterPayment('unpaid')}
              className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                filterPayment === 'unpaid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              미납
            </button>
          </div>
        </div>
      </Card>

      {/* 수강권 목록 */}
      <div className="space-y-3">
        {filteredPackages.map((pkg) => {
          const daysRemaining = getDaysRemaining(pkg.end_date)
          const isExpiringSoon = pkg.status === 'active' && daysRemaining <= 7 && daysRemaining > 0
          
          return (
            <Card key={pkg.id} className={`p-4 ${isExpiringSoon ? 'border-yellow-500' : ''}`}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {pkg.lesson_students?.student_name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(pkg.status)}`}>
                      {pkg.status === 'active' ? '활성' :
                       pkg.status === 'expired' ? '만료' :
                       pkg.status === 'completed' ? '완료' : pkg.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>{pkg.package_name}</div>
                    <div className="flex gap-4">
                      <span>기간: {new Date(pkg.start_date).toLocaleDateString()} ~ {new Date(pkg.end_date).toLocaleDateString()}</span>
                      {isExpiringSoon && (
                        <span className="text-yellow-600 font-medium">⚠️ {daysRemaining}일 후 만료</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {pkg.package_type === 'count' && pkg.total_count && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        {pkg.remaining_count || 0} / {pkg.total_count}
                      </div>
                      <div className="text-sm text-gray-600">잔여/전체 횟수</div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {pkg.price.toLocaleString()}원
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      getPaymentStatusColor(pkg.payment_status, pkg.paid_amount, pkg.price)
                    }`}>
                      {getPaymentStatusText(pkg.payment_status, pkg.paid_amount, pkg.price)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {filteredPackages.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">
            조건에 맞는 수강권이 없습니다.
          </p>
        </Card>
      )}
    </div>
  )
}