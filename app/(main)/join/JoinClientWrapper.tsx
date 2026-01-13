'use client'

import { useRouter } from 'next/navigation'
import { LocationPromptBanner } from '@/components/location'
import JoinFilters from './JoinFilters'

interface UserLocation {
  dong: string | null
  gu: string | null
  city: string | null
  lat: number | null
  lng: number | null
  range: number
}

interface JoinClientWrapperProps {
  userLocation: UserLocation | null
}

export default function JoinClientWrapper({ userLocation }: JoinClientWrapperProps) {
  const router = useRouter()

  const handleLocationChange = () => {
    router.refresh()
  }

  return (
    <>
      {/* 위치 미설정시 배너 */}
      {!userLocation?.dong && (
        <LocationPromptBanner onLocationSet={handleLocationChange} />
      )}

      {/* 필터 */}
      <JoinFilters userLocation={userLocation} onLocationChange={handleLocationChange} />
    </>
  )
}
