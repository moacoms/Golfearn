'use client'

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

interface LocationMapProps {
  latitude: number
  longitude: number
  address?: string
  height?: string
}

const libraries: ('places')[] = ['places']

export default function LocationMap({
  latitude,
  longitude,
  address,
  height = '200px',
}: LocationMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
    language: 'ko',
    region: 'KR',
  })

  // API 키가 없을 때
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-muted">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}</span>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        지도를 불러오는 데 실패했습니다.
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div
        className="bg-gray-100 rounded-lg animate-pulse flex items-center justify-center"
        style={{ height }}
      >
        <span className="text-muted">지도 로딩 중...</span>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden border">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height }}
        center={{ lat: latitude, lng: longitude }}
        zoom={15}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          draggable: true,
          scrollwheel: false,
        }}
      >
        <Marker position={{ lat: latitude, lng: longitude }} />
      </GoogleMap>
      {address && (
        <div className="p-3 bg-gray-50 border-t">
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-muted">{address}</span>
          </div>
        </div>
      )}
    </div>
  )
}
