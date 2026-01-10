'use client'

import { useRouter } from 'next/navigation'
import MarketFilters from './MarketFilters'
import { LocationPromptBanner } from '@/components/location'

interface UserLocation {
  address: string | null
  dong: string | null
  gu: string | null
  city: string | null
  lat: number | null
  lng: number | null
  range: number
}

interface MarketClientWrapperProps {
  userLocation: UserLocation | null
  categories: { id: string; name: string }[]
}

export default function MarketClientWrapper({
  userLocation,
  categories,
}: MarketClientWrapperProps) {
  const router = useRouter()

  const handleLocationChange = () => {
    // 페이지 새로고침으로 새 위치 반영
    router.refresh()
  }

  const showBanner = !userLocation?.dong

  return (
    <>
      {/* 위치 미설정시 안내 배너 */}
      {showBanner && <LocationPromptBanner onLocationSet={handleLocationChange} />}

      {/* 필터 */}
      <MarketFilters
        categories={categories}
        userLocation={userLocation}
        onLocationChange={handleLocationChange}
      />
    </>
  )
}
