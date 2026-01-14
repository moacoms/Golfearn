import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    // 골프장/CC 검색어 추가
    const searchTerm = query.includes('골프') || query.toLowerCase().includes('cc')
      ? query
      : `${query} 골프장`

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerm)}&language=ko&region=kr&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error('Places API request failed')
    }

    const data = await response.json()

    if (data.status !== 'OK') {
      return NextResponse.json({ results: [] })
    }

    // 골프장 관련 결과만 필터링
    const golfCourses = data.results
      .filter((place: { name: string; types?: string[] }) =>
        place.name.includes('골프') ||
        place.name.includes('CC') ||
        place.name.includes('컨트리') ||
        place.name.includes('파크') ||
        place.types?.includes('golf_course')
      )
      .slice(0, 8)
      .map((place: {
        name: string
        formatted_address: string
        place_id: string
        geometry: { location: { lat: number; lng: number } }
      }) => ({
        name: place.name,
        address: place.formatted_address,
        place_id: place.place_id,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      }))

    return NextResponse.json({ results: golfCourses })
  } catch (error) {
    console.error('Places search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
