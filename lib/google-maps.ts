import { GoogleGeocodingResponse, GoogleGeocodingResult, ParsedKoreanAddress } from '@/types/database'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

/**
 * 좌표로 주소 검색 (역지오코딩)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GoogleGeocodingResult | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key is not configured')
    return null
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=ko&key=${GOOGLE_MAPS_API_KEY}`
    )

    if (!response.ok) {
      throw new Error('Geocoding API request failed')
    }

    const data: GoogleGeocodingResponse = await response.json()

    if (data.status !== 'OK' || data.results.length === 0) {
      return null
    }

    return data.results[0]
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

/**
 * 주소로 좌표 검색 (지오코딩)
 */
export async function geocodeAddress(address: string): Promise<GoogleGeocodingResult | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key is not configured')
    return null
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&language=ko&region=kr&key=${GOOGLE_MAPS_API_KEY}`
    )

    if (!response.ok) {
      throw new Error('Geocoding API request failed')
    }

    const data: GoogleGeocodingResponse = await response.json()

    if (data.status !== 'OK' || data.results.length === 0) {
      return null
    }

    return data.results[0]
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * 주소 검색 (자동완성 없이 직접 검색)
 */
export async function searchAddress(query: string): Promise<GoogleGeocodingResult[]> {
  if (!GOOGLE_MAPS_API_KEY || !query.trim()) {
    return []
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&language=ko&region=kr&key=${GOOGLE_MAPS_API_KEY}`
    )

    if (!response.ok) {
      throw new Error('Address search failed')
    }

    const data: GoogleGeocodingResponse = await response.json()

    if (data.status !== 'OK') {
      return []
    }

    return data.results
  } catch (error) {
    console.error('Address search error:', error)
    return []
  }
}

/**
 * Google Geocoding 결과에서 한국 주소 파싱
 */
export function parseKoreanAddress(result: GoogleGeocodingResult): ParsedKoreanAddress {
  const components = result.address_components

  let city: string | null = null      // 시/도
  let gu: string | null = null        // 구/군/시
  let dong: string | null = null      // 동/읍/면/리

  for (const component of components) {
    const types = component.types

    // 시/도 레벨 (서울특별시, 경기도 등)
    if (types.includes('administrative_area_level_1')) {
      city = component.long_name
    }
    // 구/군/시 레벨 (강남구, 성남시 등)
    else if (types.includes('sublocality_level_1') || types.includes('locality')) {
      gu = component.long_name
    }
    // 동/읍/면/리 레벨 (역삼동 등)
    else if (types.includes('sublocality_level_2')) {
      dong = component.long_name
    }
    // 대안: sublocality (일부 주소에서 동이 여기에 포함됨)
    else if (types.includes('sublocality') && !dong) {
      dong = component.long_name
    }
  }

  // 동이 없으면 구 사용 (일부 지역에서는 동 정보가 없을 수 있음)
  if (!dong && gu) {
    dong = gu
  }

  return {
    address: result.formatted_address,
    dong,
    gu,
    city,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
  }
}

/**
 * 두 좌표 간 거리 계산 (Haversine formula)
 * @returns 거리 (km)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // 지구 반지름 (km)

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * 거리 포맷팅
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`
  }
  return `${distanceKm.toFixed(1)}km`
}

/**
 * 브라우저 Geolocation API로 현재 위치 가져오기
 */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5분 캐시
    })
  })
}

/**
 * 위치 권한 상태 확인
 */
export async function checkLocationPermission(): Promise<PermissionState> {
  if (!navigator.permissions) {
    return 'prompt'
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' })
    return result.state
  } catch {
    return 'prompt'
  }
}
