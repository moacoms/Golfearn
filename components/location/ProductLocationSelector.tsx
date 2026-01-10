'use client'

import { useState, useEffect } from 'react'
import { ParsedKoreanAddress } from '@/types/database'
import LocationSearchInput from './LocationSearchInput'

interface ProductLocationSelectorProps {
  sellerLocation?: {
    address: string | null
    dong: string | null
    gu: string | null
    city: string | null
    lat: number | null
    lng: number | null
  } | null
  initialLocation?: {
    address: string | null
    dong: string | null
    gu: string | null
    city: string | null
    lat: number | null
    lng: number | null
    useSellerLocation: boolean
  } | null
  onChange: (location: {
    address: string | null
    dong: string | null
    gu: string | null
    city: string | null
    lat: number | null
    lng: number | null
    useSellerLocation: boolean
  }) => void
}

export default function ProductLocationSelector({
  sellerLocation,
  initialLocation,
  onChange,
}: ProductLocationSelectorProps) {
  const [useSellerLocation, setUseSellerLocation] = useState(
    initialLocation?.useSellerLocation ?? true
  )
  const [customLocation, setCustomLocation] = useState<ParsedKoreanAddress | null>(
    initialLocation && !initialLocation.useSellerLocation
      ? {
          address: initialLocation.address || '',
          dong: initialLocation.dong,
          gu: initialLocation.gu,
          city: initialLocation.city,
          lat: initialLocation.lat || 0,
          lng: initialLocation.lng || 0,
        }
      : null
  )

  const hasSellerLocation = !!(sellerLocation?.dong || sellerLocation?.gu)

  useEffect(() => {
    if (useSellerLocation && sellerLocation) {
      onChange({
        address: sellerLocation.address,
        dong: sellerLocation.dong,
        gu: sellerLocation.gu,
        city: sellerLocation.city,
        lat: sellerLocation.lat,
        lng: sellerLocation.lng,
        useSellerLocation: true,
      })
    } else if (!useSellerLocation && customLocation) {
      onChange({
        address: customLocation.address,
        dong: customLocation.dong,
        gu: customLocation.gu,
        city: customLocation.city,
        lat: customLocation.lat,
        lng: customLocation.lng,
        useSellerLocation: false,
      })
    }
  }, [useSellerLocation, customLocation, sellerLocation, onChange])

  const handleCustomLocationSelect = (location: ParsedKoreanAddress) => {
    setCustomLocation(location)
    onChange({
      address: location.address,
      dong: location.dong,
      gu: location.gu,
      city: location.city,
      lat: location.lat,
      lng: location.lng,
      useSellerLocation: false,
    })
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">거래 위치</label>

      {/* 옵션 선택 */}
      <div className="space-y-2">
        {/* 내 위치 사용 */}
        <label
          className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
            useSellerLocation
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          } ${!hasSellerLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="radio"
            name="locationOption"
            checked={useSellerLocation}
            onChange={() => setUseSellerLocation(true)}
            disabled={!hasSellerLocation}
            className="w-4 h-4 text-primary"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900">내 동네에서 거래</p>
            {hasSellerLocation ? (
              <p className="text-sm text-gray-500">
                {sellerLocation?.dong || sellerLocation?.gu || sellerLocation?.city}
              </p>
            ) : (
              <p className="text-sm text-red-500">
                프로필에서 동네를 먼저 설정해주세요
              </p>
            )}
          </div>
        </label>

        {/* 다른 위치 선택 */}
        <label
          className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
            !useSellerLocation
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="locationOption"
            checked={!useSellerLocation}
            onChange={() => setUseSellerLocation(false)}
            className="w-4 h-4 text-primary"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900">다른 위치 선택</p>
            {customLocation && !useSellerLocation && (
              <p className="text-sm text-gray-500">
                {customLocation.dong || customLocation.gu || customLocation.address}
              </p>
            )}
          </div>
        </label>
      </div>

      {/* 다른 위치 검색 */}
      {!useSellerLocation && (
        <div className="pt-2">
          <LocationSearchInput
            onSelect={handleCustomLocationSelect}
            placeholder="거래할 동네를 검색하세요"
          />
        </div>
      )}

      {/* 선택된 위치 표시 */}
      {((useSellerLocation && hasSellerLocation) || (!useSellerLocation && customLocation)) && (
        <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <span>
            거래 위치:{' '}
            <strong>
              {useSellerLocation
                ? sellerLocation?.dong || sellerLocation?.gu
                : customLocation?.dong || customLocation?.gu || customLocation?.address}
            </strong>
          </span>
        </div>
      )}
    </div>
  )
}
