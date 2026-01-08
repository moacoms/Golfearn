'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const conditions = [
  { id: 'S', name: 'S급 (거의 새것)' },
  { id: 'A', name: 'A급 (상태 좋음)' },
  { id: 'B', name: 'B급 (사용감 있음)' },
  { id: 'C', name: 'C급 (사용감 많음)' },
]

const statusOptions = [
  { id: 'all', name: '전체' },
  { id: 'selling', name: '판매중' },
  { id: 'reserved', name: '예약중' },
  { id: 'sold', name: '판매완료' },
]

export default function MarketFilters({
  categories,
}: {
  categories: { id: string; name: string }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') || 'all'
  const currentStatus = searchParams.get('status') || 'all'

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/market?${params.toString()}`)
  }

  return (
    <div className="card mb-8">
      <div className="flex flex-wrap gap-4">
        {/* Category Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-2">카테고리</label>
          <select
            className="input"
            value={currentCategory}
            onChange={(e) => updateFilter('category', e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-2">판매 상태</label>
          <select
            className="input"
            value={currentStatus}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            {statusOptions.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
