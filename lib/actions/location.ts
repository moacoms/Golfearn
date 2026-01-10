'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { LocationRange, ParsedKoreanAddress, Profile } from '@/types/database'

/**
 * 현재 사용자의 위치 정보 조회
 */
export async function getUserLocation(): Promise<{
  success: boolean
  location: {
    address: string | null
    dong: string | null
    gu: string | null
    city: string | null
    lat: number | null
    lng: number | null
    range: number
  } | null
  error?: string
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, location: null, error: '로그인이 필요합니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error } = await (supabase as any)
    .from('profiles')
    .select('location_address, location_dong, location_gu, location_city, location_lat, location_lng, location_range')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return { success: false, location: null, error: '위치 정보를 불러올 수 없습니다.' }
  }

  return {
    success: true,
    location: {
      address: profile.location_address as string | null,
      dong: profile.location_dong as string | null,
      gu: profile.location_gu as string | null,
      city: profile.location_city as string | null,
      lat: profile.location_lat as number | null,
      lng: profile.location_lng as number | null,
      range: (profile.location_range as number) ?? 3,
    },
  }
}

/**
 * 사용자 위치 업데이트
 */
export async function updateUserLocation(locationData: ParsedKoreanAddress): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .update({
      location_address: locationData.address,
      location_dong: locationData.dong,
      location_gu: locationData.gu,
      location_city: locationData.city,
      location_lat: locationData.lat,
      location_lng: locationData.lng,
      // 기존 location 필드도 동네 이름으로 업데이트 (호환성)
      location: locationData.dong || locationData.gu || locationData.city,
    })
    .eq('id', user.id)

  if (error) {
    console.error('Update location error:', error)
    return { success: false, error: '위치 업데이트에 실패했습니다.' }
  }

  revalidatePath('/mypage')
  revalidatePath('/market')

  return { success: true }
}

/**
 * 사용자 위치 검색 범위 업데이트
 */
export async function updateLocationRange(range: LocationRange): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ location_range: range })
    .eq('id', user.id)

  if (error) {
    console.error('Update location range error:', error)
    return { success: false, error: '검색 범위 업데이트에 실패했습니다.' }
  }

  revalidatePath('/market')

  return { success: true }
}

/**
 * 사용자 위치 초기화 (삭제)
 */
export async function clearUserLocation(): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .update({
      location_address: null,
      location_dong: null,
      location_gu: null,
      location_city: null,
      location_lat: null,
      location_lng: null,
      location: null,
    })
    .eq('id', user.id)

  if (error) {
    console.error('Clear location error:', error)
    return { success: false, error: '위치 초기화에 실패했습니다.' }
  }

  revalidatePath('/mypage')
  revalidatePath('/market')

  return { success: true }
}

/**
 * 특정 동네의 상품 개수 조회
 */
export async function getProductCountByDong(dong: string): Promise<number> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count, error } = await (supabase as any)
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('location_dong', dong)
    .eq('status', 'selling')

  if (error) {
    console.error('Get product count error:', error)
    return 0
  }

  return count ?? 0
}

/**
 * 주변 동네 목록 조회 (같은 구 내)
 */
export async function getNearbyDongs(gu: string): Promise<string[]> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('products')
    .select('location_dong')
    .eq('location_gu', gu)
    .eq('status', 'selling')
    .not('location_dong', 'is', null)

  if (error) {
    console.error('Get nearby dongs error:', error)
    return []
  }

  // 중복 제거
  const dongs = data.map((d: { location_dong: string | null }) => d.location_dong).filter(Boolean) as string[]
  const uniqueDongs = Array.from(new Set(dongs))
  return uniqueDongs
}
