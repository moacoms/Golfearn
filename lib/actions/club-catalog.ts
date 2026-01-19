'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  GolfClubBrand,
  GolfClub,
  GolfClubWithBrand,
  ClubFilters,
  ClubType,
} from '@/types/club'

// =============================================
// 브랜드 관련
// =============================================

/**
 * 모든 활성 브랜드 목록 조회
 */
export async function getBrands(): Promise<GolfClubBrand[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('golf_club_brands')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching brands:', error)
    return []
  }

  return data as GolfClubBrand[]
}

/**
 * 브랜드 상세 조회
 */
export async function getBrand(id: number): Promise<GolfClubBrand | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('golf_club_brands')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching brand:', error)
    return null
  }

  return data as GolfClubBrand
}

// =============================================
// 클럽 목록 관련
// =============================================

/**
 * 클럽 목록 조회 (필터/정렬/페이지네이션)
 */
export async function getClubs(filters?: ClubFilters & { page?: number; limit?: number }): Promise<{
  clubs: GolfClubWithBrand[]
  total: number
  page: number
  totalPages: number
}> {
  const supabase = await createClient()

  const page = filters?.page || 1
  const limit = filters?.limit || 12
  const offset = (page - 1) * limit

  // 기본 쿼리 빌드
  let query = supabase
    .from('golf_clubs')
    .select(`
      *,
      brand:golf_club_brands(*)
    `, { count: 'exact' })
    .eq('is_active', true)

  // 필터 적용
  if (filters?.brand_id) {
    query = query.eq('brand_id', filters.brand_id)
  }

  if (filters?.club_type) {
    query = query.eq('club_type', filters.club_type)
  }

  if (filters?.model_year) {
    query = query.eq('model_year', filters.model_year)
  }

  if (filters?.min_price) {
    query = query.gte('current_price', filters.min_price)
  }

  if (filters?.max_price) {
    query = query.lte('current_price', filters.max_price)
  }

  if (filters?.shaft_flex) {
    query = query.contains('shaft_flex', [filters.shaft_flex])
  }

  if (filters?.shaft_material) {
    query = query.contains('shaft_material', [filters.shaft_material])
  }

  if (filters?.forgiveness_level_min) {
    query = query.gte('forgiveness_level', filters.forgiveness_level_min)
  }

  if (filters?.is_featured) {
    query = query.eq('is_featured', true)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,name_ko.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  // 정렬
  switch (filters?.sort_by) {
    case 'rating':
      query = query.order('rating', { ascending: false })
      break
    case 'price_asc':
      query = query.order('current_price', { ascending: true, nullsFirst: false })
      break
    case 'price_desc':
      query = query.order('current_price', { ascending: false })
      break
    case 'popular':
      query = query.order('view_count', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('model_year', { ascending: false }).order('created_at', { ascending: false })
      break
  }

  // 페이지네이션
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching clubs:', error)
    return { clubs: [], total: 0, page, totalPages: 0 }
  }

  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  return {
    clubs: data as GolfClubWithBrand[],
    total,
    page,
    totalPages,
  }
}

/**
 * Featured 클럽 목록 조회
 */
export async function getFeaturedClubs(limit = 8): Promise<GolfClubWithBrand[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('golf_clubs')
    .select(`
      *,
      brand:golf_club_brands(*)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('rating', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured clubs:', error)
    return []
  }

  return data as GolfClubWithBrand[]
}

/**
 * 클럽 타입별 목록 조회
 */
export async function getClubsByType(clubType: ClubType, limit = 10): Promise<GolfClubWithBrand[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('golf_clubs')
    .select(`
      *,
      brand:golf_club_brands(*)
    `)
    .eq('is_active', true)
    .eq('club_type', clubType)
    .order('rating', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching clubs by type:', error)
    return []
  }

  return data as GolfClubWithBrand[]
}

// =============================================
// 클럽 상세 관련
// =============================================

/**
 * 클럽 상세 조회
 */
export async function getClub(id: number): Promise<GolfClubWithBrand | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('golf_clubs')
    .select(`
      *,
      brand:golf_club_brands(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching club:', error)
    return null
  }

  // 조회수 증가
  await (supabase.rpc as any)('increment_club_view', { club_id_param: id })

  return data as GolfClubWithBrand
}

/**
 * 같은 브랜드/타입의 다른 클럽 조회
 */
export async function getRelatedClubs(clubId: number, brandId: number | null, clubType: string, limit = 4): Promise<GolfClubWithBrand[]> {
  const supabase = await createClient()

  let query = supabase
    .from('golf_clubs')
    .select(`
      *,
      brand:golf_club_brands(*)
    `)
    .eq('is_active', true)
    .neq('id', clubId)
    .limit(limit)

  // 같은 브랜드 또는 같은 타입
  if (brandId) {
    query = query.or(`brand_id.eq.${brandId},club_type.eq.${clubType}`)
  } else {
    query = query.eq('club_type', clubType)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching related clubs:', error)
    return []
  }

  return data as GolfClubWithBrand[]
}

// =============================================
// 검색 관련
// =============================================

/**
 * 클럽 검색 (자동완성용)
 */
export async function searchClubs(query: string, limit = 10): Promise<GolfClubWithBrand[]> {
  if (!query || query.length < 2) {
    return []
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('golf_clubs')
    .select(`
      *,
      brand:golf_club_brands(*)
    `)
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,name_ko.ilike.%${query}%`)
    .order('rating', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error searching clubs:', error)
    return []
  }

  return data as GolfClubWithBrand[]
}

// =============================================
// 통계 관련
// =============================================

/**
 * 출시년도 목록 조회
 */
export async function getModelYears(): Promise<number[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('golf_clubs' as any)
    .select('model_year')
    .eq('is_active', true)
    .not('model_year', 'is', null)
    .order('model_year', { ascending: false })

  if (error) {
    console.error('Error fetching model years:', error)
    return []
  }

  // 중복 제거
  const years = Array.from(new Set((data as any[]).map(d => d.model_year))).filter(Boolean) as number[]
  return years
}

/**
 * 클럽 타입별 통계
 */
export async function getClubStats(): Promise<{ type: ClubType; count: number }[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('golf_clubs' as any)
    .select('club_type')
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching club stats:', error)
    return []
  }

  // 타입별 카운트
  const counts: Record<string, number> = {}
  ;(data as any[]).forEach(item => {
    counts[item.club_type] = (counts[item.club_type] || 0) + 1
  })

  return Object.entries(counts).map(([type, count]) => ({
    type: type as ClubType,
    count,
  }))
}

// =============================================
// Admin용 (향후 확장)
// =============================================

export async function createClub(clubData: Partial<GolfClub>): Promise<{ error?: string; data?: GolfClub }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // 관리자 체크 (향후 구현)
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!(profile as any)?.is_admin) {
    return { error: '관리자만 등록할 수 있습니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('golf_clubs')
    .insert(clubData)
    .select()
    .single()

  if (error) {
    console.error('Error creating club:', error)
    return { error: '클럽 등록에 실패했습니다.' }
  }

  revalidatePath('/club-catalog')
  return { data }
}

export async function updateClub(id: number, clubData: Partial<GolfClub>): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // 관리자 체크
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!(profile as any)?.is_admin) {
    return { error: '관리자만 수정할 수 있습니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('golf_clubs')
    .update({ ...clubData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error updating club:', error)
    return { error: '클럽 수정에 실패했습니다.' }
  }

  revalidatePath('/club-catalog')
  revalidatePath(`/club-catalog/${id}`)
  return { success: true }
}
