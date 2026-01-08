'use client'

import { useState } from 'react'
import { toggleFavorite } from '@/lib/actions/products'

export default function FavoriteButton({
  productId,
  initialIsFavorite,
}: {
  productId: number
  initialIsFavorite: boolean
}) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)

    const result = await toggleFavorite(productId)

    if (result.error) {
      alert(result.error)
    } else if (result.isFavorite !== undefined) {
      setIsFavorite(result.isFavorite)
    }

    setIsLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-3 rounded-lg border transition-colors ${
        isFavorite
          ? 'border-red-500 text-red-500 bg-red-50'
          : 'border-gray-300 text-gray-400 hover:border-red-500 hover:text-red-500'
      }`}
      title={isFavorite ? '찜 취소' : '찜하기'}
    >
      <svg
        className="w-6 h-6"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}
