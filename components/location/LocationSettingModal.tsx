'use client'

import { useState, useEffect } from 'react'
import { getCurrentPosition, reverseGeocode, parseKoreanAddress } from '@/lib/google-maps'
import { updateUserLocation, updateLocationRange } from '@/lib/actions/location'
import { ParsedKoreanAddress, LocationRange } from '@/types/database'
import LocationSearchInput from './LocationSearchInput'

interface LocationSettingModalProps {
  isOpen: boolean
  onClose: () => void
  currentLocation?: {
    dong: string | null
    gu: string | null
    city: string | null
    range: number
  } | null
  onSuccess?: () => void
}

const RANGE_OPTIONS: { value: LocationRange; label: string }[] = [
  { value: 1, label: '1km' },
  { value: 3, label: '3km' },
  { value: 5, label: '5km' },
  { value: 10, label: '10km' },
  { value: 20, label: '20km' },
]

export default function LocationSettingModal({
  isOpen,
  onClose,
  currentLocation,
  onSuccess,
}: LocationSettingModalProps) {
  const [selectedLocation, setSelectedLocation] = useState<ParsedKoreanAddress | null>(null)
  const [selectedRange, setSelectedRange] = useState<LocationRange>(3)
  const [isDetecting, setIsDetecting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (currentLocation?.range) {
      setSelectedRange(currentLocation.range as LocationRange)
    }
  }, [currentLocation])

  useEffect(() => {
    if (!isOpen) {
      setSelectedLocation(null)
      setError(null)
    }
  }, [isOpen])

  const handleDetectLocation = async () => {
    setIsDetecting(true)
    setError(null)

    try {
      const position = await getCurrentPosition()
      const { latitude, longitude } = position.coords

      const geocodeResult = await reverseGeocode(latitude, longitude)
      if (!geocodeResult) {
        setError('주소를 찾을 수 없습니다.')
        return
      }

      const parsed = parseKoreanAddress(geocodeResult)
      setSelectedLocation(parsed)
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.')
            break
          case err.POSITION_UNAVAILABLE:
            setError('위치 정보를 사용할 수 없습니다.')
            break
          case err.TIMEOUT:
            setError('위치 요청 시간이 초과되었습니다.')
            break
        }
      } else {
        setError('위치를 가져오는데 실패했습니다.')
      }
    } finally {
      setIsDetecting(false)
    }
  }

  const handleSearchSelect = (location: ParsedKoreanAddress) => {
    setSelectedLocation(location)
    setError(null)
  }

  const handleSave = async () => {
    if (!selectedLocation) {
      setError('위치를 선택해주세요.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const locationResult = await updateUserLocation(selectedLocation)
      if (!locationResult.success) {
        setError(locationResult.error || '위치 저장에 실패했습니다.')
        return
      }

      const rangeResult = await updateLocationRange(selectedRange)
      if (!rangeResult.success) {
        setError(rangeResult.error || '검색 범위 저장에 실패했습니다.')
        return
      }

      onSuccess?.()
      onClose()
    } catch {
      setError('저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">동네 설정</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 바디 */}
        <div className="p-4 space-y-6">
          {/* 현재 위치 표시 */}
          {currentLocation?.dong && !selectedLocation && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">현재 설정된 동네</p>
              <p className="font-medium text-gray-900">
                {currentLocation.dong}
                {currentLocation.gu && `, ${currentLocation.gu}`}
              </p>
            </div>
          )}

          {/* 선택된 위치 표시 */}
          {selectedLocation && (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-primary">선택된 동네</p>
              <p className="font-medium text-gray-900">
                {selectedLocation.dong || selectedLocation.gu || '알 수 없음'}
              </p>
              <p className="text-sm text-gray-500">{selectedLocation.address}</p>
            </div>
          )}

          {/* GPS 감지 버튼 */}
          <button
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDetecting ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                위치 감지 중...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                현재 위치로 설정
              </>
            )}
          </button>

          {/* 구분선 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-sm text-gray-400">또는</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* 주소 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">주소 검색</label>
            <LocationSearchInput onSelect={handleSearchSelect} placeholder="동네 이름, 도로명, 지번 검색" />
          </div>

          {/* 검색 범위 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">검색 범위</label>
            <div className="flex gap-2 flex-wrap">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedRange(option.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedRange === option.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              내 위치에서 {selectedRange}km 이내의 매물을 볼 수 있어요
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={handleSave}
            disabled={!selectedLocation || isSaving}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
