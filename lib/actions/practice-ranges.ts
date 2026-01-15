'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type PracticeRange = {
  id: number
  name: string
  description: string | null
  address: string | null
  phone: string | null
  website: string | null
  location_lat: number | null
  location_lng: number | null
  facilities: string[] | null
  floor_count: number | null
  booth_count: number | null
  operating_hours: string | null
  price_info: string | null
  google_place_id: string | null
  google_rating: number
  google_review_count: number
  images: string[] | null
  region: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface GetPracticeRangesParams {
  region?: string
  facility?: string
  search?: string
}

// 연습장 목록 조회
export async function getPracticeRanges(params: GetPracticeRangesParams = {}): Promise<PracticeRange[]> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('practice_ranges')
    .select('*')
    .eq('is_active', true)

  // 지역 필터
  if (params.region) {
    query = query.eq('region', params.region)
  }

  // 시설 필터
  if (params.facility) {
    query = query.contains('facilities', [params.facility])
  }

  // 검색어 필터
  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,address.ilike.%${params.search}%`)
  }

  // 평점순 정렬
  query = query.order('google_rating', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching practice ranges:', error)
    return []
  }

  return data as PracticeRange[]
}

// 연습장 상세 조회
export async function getPracticeRange(id: number): Promise<PracticeRange | null> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('practice_ranges')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching practice range:', error)
    return null
  }

  return data as PracticeRange
}

// Google Places에서 연습장 가져오기
export interface ImportPracticeRangeData {
  name: string
  address: string
  placeId: string
  lat: number
  lng: number
  rating: number
  reviewCount: number
  phone?: string
  photoUrl?: string
}

export async function importPracticeRangeFromPlace(
  data: ImportPracticeRangeData
): Promise<{ error?: string; success?: boolean; rangeId?: number }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // 이미 등록된 place_id인지 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingRange } = await (supabase as any)
    .from('practice_ranges')
    .select('id')
    .eq('google_place_id', data.placeId)
    .single()

  if (existingRange) {
    return { error: '이미 등록된 연습장입니다.' }
  }

  // 지역 추출
  const regionMatch = data.address.match(/^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/)
  const region = regionMatch ? regionMatch[1] : null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newRange, error } = await (supabase as any)
    .from('practice_ranges')
    .insert({
      name: data.name,
      description: `${data.address}에 위치한 골프 연습장입니다.`,
      address: data.address,
      phone: data.phone || null,
      location_lat: data.lat,
      location_lng: data.lng,
      google_place_id: data.placeId,
      google_rating: data.rating || 0,
      google_review_count: data.reviewCount || 0,
      images: data.photoUrl ? [data.photoUrl] : null,
      region: region,
      is_active: true,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error importing practice range:', error)
    return { error: '연습장 등록에 실패했습니다.' }
  }

  revalidatePath('/practice-range')
  return { success: true, rangeId: newRange.id }
}
