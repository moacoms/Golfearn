'use client'

import { useState, useCallback, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

export interface Location {
  lat: number
  lng: number
  address: string
}

interface LocationPickerProps {
  value?: Location | null
  onChange: (location: Location | null) => void
  placeholder?: string
}

const mapContainerStyle = {
  width: '100%',
  height: '300px',
}

// 서울 기본 좌표
const defaultCenter = {
  lat: 37.5665,
  lng: 126.978,
}

const libraries: ('places')[] = ['places']

export default function LocationPicker({
  value,
  onChange,
  placeholder = '거래 희망 장소를 선택하세요',
}: LocationPickerProps) {
  const [showMap, setShowMap] = useState(false)
  const [center, setCenter] = useState(value ? { lat: value.lat, lng: value.lng } : defaultCenter)
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    value ? { lat: value.lat, lng: value.lng } : null
  )
  const [address, setAddress] = useState(value?.address || '')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [searchInput, setSearchInput] = useState('')

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  })

  // 현재 위치 가져오기
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 서비스를 지원하지 않습니다.')
      return
    }

    setIsLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const newPosition = { lat: latitude, lng: longitude }
        setCenter(newPosition)
        setMarkerPosition(newPosition)

        // Reverse geocoding으로 주소 가져오기
        if (isLoaded && window.google) {
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: newPosition }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              const addr = results[0].formatted_address
              setAddress(addr)
              onChange({ lat: latitude, lng: longitude, address: addr })
            }
          })
        } else {
          const addr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          setAddress(addr)
          onChange({ lat: latitude, lng: longitude, address: addr })
        }

        setIsLoadingLocation(false)
      },
      (error) => {
        console.error('위치 가져오기 실패:', error)
        alert('위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.')
        setIsLoadingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [isLoaded, onChange])

  // 지도 클릭 시 마커 위치 변경
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return

      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      const newPosition = { lat, lng }
      setMarkerPosition(newPosition)

      // Reverse geocoding
      if (window.google) {
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ location: newPosition }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const addr = results[0].formatted_address
            setAddress(addr)
            onChange({ lat, lng, address: addr })
          }
        })
      }
    },
    [onChange]
  )

  // 주소 검색
  const handleSearch = useCallback(() => {
    if (!searchInput.trim() || !isLoaded || !window.google) return

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address: searchInput }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const location = results[0].geometry.location
        const newPosition = { lat: location.lat(), lng: location.lng() }
        setCenter(newPosition)
        setMarkerPosition(newPosition)
        const addr = results[0].formatted_address
        setAddress(addr)
        onChange({ lat: newPosition.lat, lng: newPosition.lng, address: addr })
      } else {
        alert('주소를 찾을 수 없습니다.')
      }
    })
  }, [searchInput, isLoaded, onChange])

  // Enter 키로 검색
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  // 위치 초기화
  const clearLocation = () => {
    setMarkerPosition(null)
    setAddress('')
    onChange(null)
  }

  // API 키가 없을 때 대체 UI
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          <p className="font-medium mb-1">Google Maps API 키가 필요합니다</p>
          <p>환경변수에 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY를 설정해주세요.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">지역 (수동 입력)</label>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value)
              onChange({ lat: 0, lng: 0, address: e.target.value })
            }}
            placeholder="예: 서울 강남구"
            className="input"
          />
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        지도를 불러오는 데 실패했습니다. API 키를 확인해주세요.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 선택된 위치 표시 */}
      {value && address && !showMap && (
        <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="flex-1 text-sm truncate">{address}</span>
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="text-primary text-sm hover:underline"
          >
            변경
          </button>
          <button
            type="button"
            onClick={clearLocation}
            className="text-muted hover:text-red-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 위치 선택 버튼 */}
      {!value && !showMap && (
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <div className="flex flex-col items-center gap-2 text-muted">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{placeholder}</span>
          </div>
        </button>
      )}

      {/* 지도 UI */}
      {showMap && (
        <div className="border rounded-lg overflow-hidden">
          {/* 검색 및 컨트롤 */}
          <div className="p-3 bg-gray-50 border-b space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="주소 검색 (예: 강남역)"
                className="input flex-1"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="btn btn-primary px-4"
              >
                검색
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLoadingLocation}
                className="btn btn-outline flex-1 text-sm"
              >
                {isLoadingLocation ? (
                  '위치 찾는 중...'
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    현재 위치 사용
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowMap(false)}
                className="btn btn-outline px-4 text-sm"
              >
                닫기
              </button>
            </div>
          </div>

          {/* 지도 */}
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={15}
              onClick={handleMapClick}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              {markerPosition && <Marker position={markerPosition} />}
            </GoogleMap>
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-gray-100">
              <div className="text-muted">지도 로딩 중...</div>
            </div>
          )}

          {/* 선택된 주소 */}
          {address && (
            <div className="p-3 bg-gray-50 border-t">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="flex-1 text-sm">{address}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
