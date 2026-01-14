import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = searchParams.get('radius') || '30000' // 기본 30km

  if (!lat || !lng) {
    return NextResponse.json({ error: '위치 정보가 필요합니다.' }, { status: 400 })
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    // Google Places Text Search API (더 정확한 골프장 검색)
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=골프장+OR+골프클럽+OR+CC+OR+컨트리클럽&location=${lat},${lng}&radius=${radius}&type=golf_course&language=ko&region=kr&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error('Places API request failed')
    }

    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', data.status)
      return NextResponse.json({ results: [] })
    }

    // 골프장 관련 키워드로 필터링
    const golfKeywords = ['골프', 'CC', '컨트리', 'Country', 'Golf', '클럽', 'Club', '힐스', 'Hills', '레이크', 'Lake', '파크', 'Park']

    const filteredResults = (data.results || []).filter((place: {
      name: string
      types?: string[]
    }) => {
      // 이름에 골프 관련 키워드가 있는지 확인
      const hasGolfKeyword = golfKeywords.some(keyword =>
        place.name.toLowerCase().includes(keyword.toLowerCase())
      )
      // types에 golf_course가 있는지 확인
      const isGolfCourseType = place.types?.includes('golf_course')

      return hasGolfKeyword || isGolfCourseType
    })

    // 결과 가공
    const golfCourses = filteredResults.map((place: {
      name: string
      formatted_address?: string
      vicinity?: string
      place_id: string
      geometry: { location: { lat: number; lng: number } }
      rating?: number
      user_ratings_total?: number
      photos?: { photo_reference: string }[]
      opening_hours?: { open_now: boolean }
      business_status?: string
    }) => {
      // 거리 계산
      const distance = calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        place.geometry.location.lat,
        place.geometry.location.lng
      )

      return {
        place_id: place.place_id,
        name: place.name,
        address: place.formatted_address || place.vicinity || '',
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        rating: place.rating || null,
        ratings_total: place.user_ratings_total || 0,
        photo_reference: place.photos?.[0]?.photo_reference || null,
        open_now: place.opening_hours?.open_now ?? null,
        business_status: place.business_status || null,
        distance: Math.round(distance * 10) / 10, // km, 소수점 1자리
      }
    })

    // 거리순 정렬
    golfCourses.sort((a: { distance: number }, b: { distance: number }) => a.distance - b.distance)

    return NextResponse.json({ results: golfCourses })
  } catch (error) {
    console.error('Nearby search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

// Haversine 거리 계산 (km)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
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
