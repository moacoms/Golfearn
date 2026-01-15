import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query') || '골프 레슨'
  const region = searchParams.get('region') || ''

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    // 지역 + 골프 레슨 키워드로 검색
    const searchTerm = region ? `${region} ${query}` : query

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerm)}&language=ko&region=kr&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error('Places API request failed')
    }

    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', data.status)
      return NextResponse.json({ results: [] })
    }

    // 결과 매핑
    const results = (data.results || [])
      .slice(0, 20)
      .map((place: {
        name: string
        formatted_address: string
        place_id: string
        geometry: { location: { lat: number; lng: number } }
        rating?: number
        user_ratings_total?: number
        types?: string[]
        photos?: Array<{ photo_reference: string }>
      }) => ({
        name: place.name,
        address: place.formatted_address,
        place_id: place.place_id,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        rating: place.rating || 0,
        review_count: place.user_ratings_total || 0,
        types: place.types || [],
        photo_reference: place.photos?.[0]?.photo_reference || null,
      }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Lesson places search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
