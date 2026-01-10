'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import LocationSettingModal from './LocationSettingModal'
import { LocationRange } from '@/types/database'

interface LocationFilterChipProps {
  userLocation?: {
    dong: string | null
    gu: string | null
    city: string | null
    lat: number | null
    lng: number | null
    range: number
  } | null
  onLocationChange?: () => void
}

const RANGE_OPTIONS: { value: LocationRange | 'all'; label: string }[] = [
  { value: 'all', label: '전국' },
  { value: 1, label: '1km' },
  { value: 3, label: '3km' },
  { value: 5, label: '5km' },
  { value: 10, label: '10km' },
  { value: 20, label: '20km' },
]

export default function LocationFilterChip({
  userLocation,
  onLocationChange,
}: LocationFilterChipProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentRange = searchParams.get('range') || (userLocation?.dong ? String(userLocation.range) : 'all')
  const isFiltered = currentRange !== 'all' && userLocation?.dong

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRangeChange = (range: LocationRange | 'all') => {
    const params = new URLSearchParams(searchParams.toString())

    if (range === 'all') {
      params.delete('range')
      params.delete('lat')
      params.delete('lng')
    } else {
      if (!userLocation?.lat || !userLocation?.lng) {
        // 위치가 설정되지 않은 경우 모달 열기
        setIsModalOpen(true)
        setIsDropdownOpen(false)
        return
      }
      params.set('range', String(range))
      params.set('lat', String(userLocation.lat))
      params.set('lng', String(userLocation.lng))
    }

    router.push(`/market?${params.toString()}`)
    setIsDropdownOpen(false)
  }

  const displayText = userLocation?.dong
    ? currentRange === 'all'
      ? '전국'
      : `${userLocation.dong} ${currentRange}km`
    : '전국'

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
            isFiltered
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg
            className="w-4 h-4"
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
          {displayText}
          <svg
            className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 드롭다운 */}
        {isDropdownOpen && (
          <div className="absolute z-40 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
            {/* 위치 설정 버튼 */}
            <button
              onClick={() => {
                setIsModalOpen(true)
                setIsDropdownOpen(false)
              }}
              className="w-full px-4 py-3 text-left text-sm text-primary hover:bg-gray-50 border-b border-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              동네 설정
            </button>

            {/* 범위 옵션들 */}
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRangeChange(option.value)}
                disabled={option.value !== 'all' && !userLocation?.dong}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between ${
                  currentRange === String(option.value) ? 'text-primary font-medium' : 'text-gray-700'
                }`}
              >
                {option.label}
                {currentRange === String(option.value) && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <LocationSettingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentLocation={userLocation}
        onSuccess={onLocationChange}
      />
    </>
  )
}
