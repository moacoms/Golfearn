'use client'

import LocationMap from '@/components/LocationMap'

interface ProductLocationProps {
  latitude: number | null
  longitude: number | null
  address: string | null
}

export default function ProductLocation({ latitude, longitude, address }: ProductLocationProps) {
  if (!latitude || !longitude) {
    if (address) {
      return (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-muted">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{address}</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <LocationMap
      latitude={latitude}
      longitude={longitude}
      address={address || undefined}
      height="250px"
    />
  )
}
