'use client'

import { useState } from 'react'
import LocationSettingModal from './LocationSettingModal'

interface LocationDisplayProps {
  location?: {
    dong: string | null
    gu: string | null
    city: string | null
    range: number
  } | null
  onLocationChange?: () => void
  showChangeButton?: boolean
  className?: string
}

export default function LocationDisplay({
  location,
  onLocationChange,
  showChangeButton = true,
  className = '',
}: LocationDisplayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const displayName = location?.dong || location?.gu || location?.city || null

  const handleSuccess = () => {
    onLocationChange?.()
  }

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <svg
          className="w-4 h-4 text-gray-500 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>

        {displayName ? (
          <span className="text-sm font-medium text-gray-700">{displayName}</span>
        ) : (
          <span className="text-sm text-gray-400">위치 미설정</span>
        )}

        {showChangeButton && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm text-primary hover:text-primary-dark"
          >
            {displayName ? '변경' : '설정'}
          </button>
        )}
      </div>

      <LocationSettingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentLocation={location}
        onSuccess={handleSuccess}
      />
    </>
  )
}
