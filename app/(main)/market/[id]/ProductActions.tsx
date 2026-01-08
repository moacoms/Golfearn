'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProductStatus, deleteProduct } from '@/lib/actions/products'

export default function ProductActions({
  productId,
  currentStatus,
}: {
  productId: number
  currentStatus: string
}) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (status: 'selling' | 'reserved' | 'sold') => {
    if (currentStatus === status) return
    setIsUpdating(true)

    const result = await updateProductStatus(productId, status)

    if (result.error) {
      alert(result.error)
    }

    setIsUpdating(false)
  }

  const handleDelete = async () => {
    if (!confirm('상품을 삭제하시겠습니까?')) return

    const result = await deleteProduct(productId)

    if (result.error) {
      alert(result.error)
    } else {
      router.push('/market')
    }
  }

  return (
    <div className="flex gap-2 flex-wrap flex-1">
      {/* 상태 변경 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={() => handleStatusChange('selling')}
          disabled={isUpdating || currentStatus === 'selling'}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentStatus === 'selling'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          판매중
        </button>
        <button
          onClick={() => handleStatusChange('reserved')}
          disabled={isUpdating || currentStatus === 'reserved'}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentStatus === 'reserved'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          예약중
        </button>
        <button
          onClick={() => handleStatusChange('sold')}
          disabled={isUpdating || currentStatus === 'sold'}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentStatus === 'sold'
              ? 'bg-gray-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          판매완료
        </button>
      </div>

      {/* 수정/삭제 */}
      <div className="flex gap-2 ml-auto">
        <button
          onClick={() => router.push(`/market/${productId}/edit`)}
          className="btn btn-outline"
        >
          수정
        </button>
        <button
          onClick={handleDelete}
          className="btn btn-outline text-red-500 border-red-500 hover:bg-red-50"
        >
          삭제
        </button>
      </div>
    </div>
  )
}
