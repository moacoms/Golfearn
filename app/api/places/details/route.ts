import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const placeId = searchParams.get('place_id')

  if (!placeId) {
    return NextResponse.json({ error: 'place_id가 필요합니다.' }, { status: 400 })
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    // Google Places Details API
    const fields = [
      'place_id',
      'name',
      'formatted_address',
      'formatted_phone_number',
      'international_phone_number',
      'website',
      'url',
      'rating',
      'user_ratings_total',
      'reviews',
      'photos',
      'opening_hours',
      'geometry',
      'types',
      'business_status',
      'price_level',
    ].join(',')

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=ko&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error('Places API request failed')
    }

    const data = await response.json()

    if (data.status !== 'OK') {
      console.error('Places API error:', data.status)
      return NextResponse.json({ error: '골프장 정보를 가져올 수 없습니다.' }, { status: 404 })
    }

    const place = data.result

    // 결과 가공
    const courseDetail = {
      place_id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number || place.international_phone_number || null,
      website: place.website || null,
      google_maps_url: place.url || null,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      rating: place.rating || null,
      ratings_total: place.user_ratings_total || 0,
      business_status: place.business_status || null,
      price_level: place.price_level ?? null,
      // 영업시간
      opening_hours: place.opening_hours ? {
        open_now: place.opening_hours.open_now ?? null,
        weekday_text: place.opening_hours.weekday_text || [],
      } : null,
      // 사진 (최대 10장)
      photos: (place.photos || []).slice(0, 10).map((photo: { photo_reference: string; width: number; height: number }) => ({
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
      })),
      // Google 리뷰 (최대 5개)
      google_reviews: (place.reviews || []).slice(0, 5).map((review: {
        author_name: string
        rating: number
        text: string
        time: number
        profile_photo_url?: string
        relative_time_description?: string
      }) => ({
        author: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.time,
        photo_url: review.profile_photo_url || null,
        relative_time: review.relative_time_description || null,
      })),
    }

    return NextResponse.json({ result: courseDetail })
  } catch (error) {
    console.error('Place details error:', error)
    return NextResponse.json({ error: 'Failed to fetch place details' }, { status: 500 })
  }
}
