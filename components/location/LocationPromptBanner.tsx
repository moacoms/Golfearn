'use client'

import { useState, useEffect } from 'react'
import LocationSettingModal from './LocationSettingModal'

interface LocationPromptBannerProps {
  onLocationSet?: () => void
}

const STORAGE_KEY = 'golfearn_location_banner_dismissed'

export default function LocationPromptBanner({ onLocationSet }: LocationPromptBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true) // 기본값 true로 깜빡임 방지
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // 클라이언트에서만 localStorage 확인
    const dismissed = localStorage.getItem(STORAGE_KEY)
    setIsDismissed(dismissed === 'true')
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsDismissed(true)
  }

  const handleSetLocation = () => {
    setIsModalOpen(true)
  }

  const handleSuccess = () => {
    setIsDismissed(true)
    localStorage.setItem(STORAGE_KEY, 'true')
    onLocationSet?.()
  }

  if (isDismissed) return null

  return (
    <>
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-primary"
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
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900">
              동네를 설정하고 가까운 매물을 먼저 보세요
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              내 주변의 중고 골프용품을 빠르게 찾을 수 있어요
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleSetLocation}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark"
              >
                동네 설정하기
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700"
              >
                나중에
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <LocationSettingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  )
}
