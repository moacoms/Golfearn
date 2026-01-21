'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  GolfClub,
  GolfClubWithBrand,
  GolfClubBrand,
  ClubType,
} from '@/types/club'

// =============================================
// 타입 정의
// =============================================

export interface PendingClub {
  id: number
  brand_name: string
  club_name: string
  club_name_ko: string | null
  model_year: number | null
  club_type: string
  loft: string | null
  shaft_flex: string | null
  shaft_material: string | null
  release_price: number | null
  estimated_used_price: Record<string, number>
  recommended_handicap_range: string | null
  recommended_swing_speed_range: string | null
  forgiveness_level: number | null
  distance_level: number | null
  control_level: number | null
  feel_level: number | null
  description: string | null
  features: string[] | null
  source_url: string | null
  ai_confidence: number | null
  ai_model: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  approved_club_id: number | null
  created_at: string
  updated_at: string
}

export interface ClubSearchLog {
  id: number
  search_query: string | null
  search_type: string | null
  clubs_found: number
  clubs_added: number
  started_at: string
  completed_at: string | null
  duration_ms: number | null
  error_message: string | null
  metadata: Record<string, unknown>
}

export interface AdminNotification {
  id: number
  type: string
  title: string
  message: string | null
  related_table: string | null
  related_id: number | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

// =============================================
// 관리자 권한 확인
// =============================================

export async function checkAdminAccess(): Promise<boolean> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single() as { data: { is_admin?: boolean } | null }

  return profile?.is_admin === true
}

// =============================================
// 클럽 관리 (CRUD)
// =============================================

// 클럽 목록 조회 (관리자용)
export async function getAdminClubs(options?: {
  page?: number
  limit?: number
  search?: string
  club_type?: ClubType
  brand_id?: number
}): Promise<{ clubs: GolfClubWithBrand[]; total: number }> {
  const supabase = await createClient()

  const page = options?.page || 1
  const limit = options?.limit || 20
  const offset = (page - 1) * limit

  let query = (supabase.from('golf_clubs') as any)
    .select('*, brand:golf_club_brands(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,name_ko.ilike.%${options.search}%`
    )
  }

  if (options?.club_type) {
    query = query.eq('club_type', options.club_type)
  }

  if (options?.brand_id) {
    query = query.eq('brand_id', options.brand_id)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching admin clubs:', error)
    return { clubs: [], total: 0 }
  }

  return {
    clubs: data || [],
    total: count || 0,
  }
}

// 클럽 상세 조회
export async function getAdminClub(id: number): Promise<GolfClubWithBrand | null> {
  const supabase = await createClient()

  const { data, error } = await (supabase.from('golf_clubs') as any)
    .select('*, brand:golf_club_brands(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching club:', error)
    return null
  }

  return data
}

// 클럽 생성
export async function createAdminClub(formData: FormData): Promise<{
  success: boolean
  club_id?: number
  error?: string
}> {
  const supabase = await createClient()

  const isAdmin = await checkAdminAccess()
  if (!isAdmin) {
    return { success: false, error: '관리자 권한이 필요합니다.' }
  }

  try {
    const clubData = {
      brand_id: formData.get('brand_id') ? Number(formData.get('brand_id')) : null,
      name: formData.get('name') as string,
      name_ko: formData.get('name_ko') as string || null,
      model_year: formData.get('model_year') ? Number(formData.get('model_year')) : null,
      club_type: formData.get('club_type') as string,
      loft: formData.get('loft') ? JSON.parse(formData.get('loft') as string) : null,
      shaft_flex: formData.get('shaft_flex') ? JSON.parse(formData.get('shaft_flex') as string) : null,
      shaft_material: formData.get('shaft_material') ? JSON.parse(formData.get('shaft_material') as string) : null,
      hand: formData.get('hand') as string || 'both',
      specs: formData.get('specs') ? JSON.parse(formData.get('specs') as string) : {},
      release_price: formData.get('release_price') ? Number(formData.get('release_price')) : null,
      current_price: formData.get('current_price') ? Number(formData.get('current_price')) : null,
      used_price_guide: formData.get('used_price_guide') ? JSON.parse(formData.get('used_price_guide') as string) : {},
      recommended_handicap_min: formData.get('recommended_handicap_min') ? Number(formData.get('recommended_handicap_min')) : null,
      recommended_handicap_max: formData.get('recommended_handicap_max') ? Number(formData.get('recommended_handicap_max')) : null,
      recommended_swing_speed_min: formData.get('recommended_swing_speed_min') ? Number(formData.get('recommended_swing_speed_min')) : null,
      recommended_swing_speed_max: formData.get('recommended_swing_speed_max') ? Number(formData.get('recommended_swing_speed_max')) : null,
      forgiveness_level: Number(formData.get('forgiveness_level')) || 3,
      distance_level: Number(formData.get('distance_level')) || 3,
      control_level: Number(formData.get('control_level')) || 3,
      feel_level: Number(formData.get('feel_level')) || 3,
      miss_tendency_fix: formData.get('miss_tendency_fix') ? JSON.parse(formData.get('miss_tendency_fix') as string) : null,
      description: formData.get('description') as string || null,
      features: formData.get('features') ? JSON.parse(formData.get('features') as string) : null,
      is_active: formData.get('is_active') === 'true',
      is_featured: formData.get('is_featured') === 'true',
    }

    const { data, error } = await (supabase.from('golf_clubs') as any)
      .insert(clubData)
      .select('id')
      .single()

    if (error) throw error

    revalidatePath('/admin/clubs')
    revalidatePath('/club-catalog')

    return { success: true, club_id: data.id }
  } catch (error: any) {
    console.error('Error creating club:', error)
    return { success: false, error: error.message }
  }
}

// 클럽 수정
export async function updateAdminClub(
  id: number,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const isAdmin = await checkAdminAccess()
  if (!isAdmin) {
    return { success: false, error: '관리자 권한이 필요합니다.' }
  }

  try {
    const updateData: Record<string, any> = {}

    // 폼 데이터에서 값 추출
    const fields = [
      'brand_id', 'name', 'name_ko', 'model_year', 'club_type',
      'hand', 'release_price', 'current_price',
      'recommended_handicap_min', 'recommended_handicap_max',
      'recommended_swing_speed_min', 'recommended_swing_speed_max',
      'forgiveness_level', 'distance_level', 'control_level', 'feel_level',
      'description', 'is_active', 'is_featured'
    ]

    fields.forEach(field => {
      const value = formData.get(field)
      if (value !== null && value !== '') {
        if (['brand_id', 'model_year', 'release_price', 'current_price',
             'recommended_handicap_min', 'recommended_handicap_max',
             'recommended_swing_speed_min', 'recommended_swing_speed_max',
             'forgiveness_level', 'distance_level', 'control_level', 'feel_level'].includes(field)) {
          updateData[field] = Number(value)
        } else if (['is_active', 'is_featured'].includes(field)) {
          updateData[field] = value === 'true'
        } else {
          updateData[field] = value
        }
      }
    })

    // JSON 필드 처리
    const jsonFields = ['loft', 'shaft_flex', 'shaft_material', 'specs', 'used_price_guide', 'miss_tendency_fix', 'features']
    jsonFields.forEach(field => {
      const value = formData.get(field)
      if (value) {
        try {
          updateData[field] = JSON.parse(value as string)
        } catch {
          // JSON 파싱 실패 시 무시
        }
      }
    })

    const { error } = await (supabase.from('golf_clubs') as any)
      .update(updateData)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/clubs')
    revalidatePath(`/admin/clubs/${id}`)
    revalidatePath('/club-catalog')
    revalidatePath(`/club-catalog/${id}`)

    return { success: true }
  } catch (error: any) {
    console.error('Error updating club:', error)
    return { success: false, error: error.message }
  }
}

// 클럽 삭제
export async function deleteAdminClub(id: number): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = await createClient()

  const isAdmin = await checkAdminAccess()
  if (!isAdmin) {
    return { success: false, error: '관리자 권한이 필요합니다.' }
  }

  const { error } = await (supabase.from('golf_clubs') as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting club:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/clubs')
  revalidatePath('/club-catalog')

  return { success: true }
}

// =============================================
// 대기 클럽 관리
// =============================================

// 대기 클럽 목록 조회
export async function getPendingClubs(options?: {
  status?: 'pending' | 'approved' | 'rejected'
  page?: number
  limit?: number
}): Promise<{ clubs: PendingClub[]; total: number }> {
  const supabase = await createClient()

  const page = options?.page || 1
  const limit = options?.limit || 20
  const offset = (page - 1) * limit

  let query = (supabase.from('pending_clubs') as any)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching pending clubs:', error)
    return { clubs: [], total: 0 }
  }

  return {
    clubs: data || [],
    total: count || 0,
  }
}

// 대기 클럽 승인
export async function approvePendingClub(pendingId: number): Promise<{
  success: boolean
  club_id?: number
  error?: string
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' }
  }

  const isAdmin = await checkAdminAccess()
  if (!isAdmin) {
    return { success: false, error: '관리자 권한이 필요합니다.' }
  }

  const { data, error } = await (supabase.rpc as any)('approve_pending_club', {
    p_pending_id: pendingId,
    p_admin_id: user.id,
  })

  if (error) {
    console.error('Error approving pending club:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/clubs')
  revalidatePath('/admin/clubs/pending')
  revalidatePath('/club-catalog')

  return { success: true, club_id: data }
}

// 대기 클럽 거절
export async function rejectPendingClub(
  pendingId: number,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' }
  }

  const isAdmin = await checkAdminAccess()
  if (!isAdmin) {
    return { success: false, error: '관리자 권한이 필요합니다.' }
  }

  const { data, error } = await (supabase.rpc as any)('reject_pending_club', {
    p_pending_id: pendingId,
    p_admin_id: user.id,
    p_reason: reason || null,
  })

  if (error) {
    console.error('Error rejecting pending club:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/clubs/pending')

  return { success: true }
}

// =============================================
// 브랜드 관리
// =============================================

export async function getAdminBrands(): Promise<GolfClubBrand[]> {
  const supabase = await createClient()

  const { data, error } = await (supabase.from('golf_club_brands') as any)
    .select('*')
    .order('display_order')

  if (error) {
    console.error('Error fetching brands:', error)
    return []
  }

  return data || []
}

export async function createBrand(formData: FormData): Promise<{
  success: boolean
  brand_id?: number
  error?: string
}> {
  const supabase = await createClient()

  const isAdmin = await checkAdminAccess()
  if (!isAdmin) {
    return { success: false, error: '관리자 권한이 필요합니다.' }
  }

  const { data, error } = await (supabase.from('golf_club_brands') as any)
    .insert({
      name: formData.get('name'),
      name_ko: formData.get('name_ko') || null,
      country: formData.get('country') || null,
      description: formData.get('description') || null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating brand:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/clubs')

  return { success: true, brand_id: data.id }
}

// =============================================
// 검색 로그 & 알림
// =============================================

export async function getSearchLogs(limit = 20): Promise<ClubSearchLog[]> {
  const supabase = await createClient()

  const { data, error } = await (supabase.from('club_search_logs') as any)
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching search logs:', error)
    return []
  }

  return data || []
}

export async function getAdminNotifications(options?: {
  unread_only?: boolean
  limit?: number
}): Promise<AdminNotification[]> {
  const supabase = await createClient()

  let query = (supabase.from('admin_notifications') as any)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(options?.limit || 20)

  if (options?.unread_only) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data || []
}

export async function markNotificationRead(id: number): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await (supabase.from('admin_notifications') as any)
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error marking notification read:', error)
    return false
  }

  revalidatePath('/admin')

  return true
}

// =============================================
// 통계
// =============================================

export async function getAdminStats(): Promise<{
  total_clubs: number
  pending_clubs: number
  total_brands: number
  recent_searches: number
}> {
  const supabase = await createClient()

  const [clubsResult, pendingResult, brandsResult, searchesResult] = await Promise.all([
    (supabase.from('golf_clubs') as any).select('*', { count: 'exact', head: true }),
    (supabase.from('pending_clubs') as any).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    (supabase.from('golf_club_brands') as any).select('*', { count: 'exact', head: true }),
    (supabase.from('club_search_logs') as any).select('*', { count: 'exact', head: true }).gte(
      'started_at',
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    ),
  ])

  return {
    total_clubs: clubsResult.count || 0,
    pending_clubs: pendingResult.count || 0,
    total_brands: brandsResult.count || 0,
    recent_searches: searchesResult.count || 0,
  }
}
