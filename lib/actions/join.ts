'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  JoinPostWithHost,
  JoinPostStatus,
  ParticipantWithProfile,
  ParticipantStatus,
} from '@/types/database'

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

// ===== 조회 =====

// 조인 목록 조회
export async function getJoinPosts(filters?: {
  dateFrom?: string
  dateTo?: string
  location?: {
    lat: number
    lng: number
    range: number
  }
  minScore?: number
  maxScore?: number
  status?: string
  search?: string
}): Promise<JoinPostWithHost[]> {
  const supabase = await createClient()

  let query = supabase
    .from('join_posts')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url,
        average_score,
        golf_started_at,
        location_dong
      )
    `)
    .neq('status', 'cancelled')
    .order('round_date', { ascending: true })
    .order('round_time', { ascending: true })

  // 날짜 필터
  if (filters?.dateFrom) {
    query = query.gte('round_date', filters.dateFrom)
  }
  if (filters?.dateTo) {
    query = query.lte('round_date', filters.dateTo)
  }

  // 상태 필터
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // 검색어 필터
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,golf_course_name.ilike.%${filters.search}%`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (query as any)

  if (error) {
    console.error('Error fetching join posts:', error)
    return []
  }

  let posts = data as JoinPostWithHost[]

  // 위치 기반 필터링
  if (filters?.location) {
    const { lat, lng, range } = filters.location

    posts = posts
      .map((post) => {
        if (post.location_lat && post.location_lng) {
          const distance = calculateDistance(lat, lng, post.location_lat, post.location_lng)
          return { ...post, distance }
        }
        return { ...post, distance: undefined }
      })
      .filter((post) => {
        if (post.distance !== undefined) {
          return post.distance <= range
        }
        return true
      })
      .sort((a, b) => {
        if (a.distance === undefined && b.distance === undefined) return 0
        if (a.distance === undefined) return 1
        if (b.distance === undefined) return -1
        return a.distance - b.distance
      })
  }

  return posts
}

// 조인 상세 조회
export async function getJoinPost(id: number): Promise<JoinPostWithHost | null> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('join_posts')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url,
        average_score,
        golf_started_at,
        location_dong
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching join post:', error)
    return null
  }

  return data as JoinPostWithHost
}

// 내 조인 목록 조회
export async function getMyJoins(): Promise<{
  hosted: JoinPostWithHost[]
  participated: JoinPostWithHost[]
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { hosted: [], participated: [] }
  }

  // 내가 작성한 조인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: hosted } = await (supabase as any)
    .from('join_posts')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url,
        average_score,
        golf_started_at,
        location_dong
      )
    `)
    .eq('user_id', user.id)
    .neq('status', 'cancelled')
    .order('round_date', { ascending: true })

  // 내가 참가한 조인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: participations } = await (supabase as any)
    .from('join_participants')
    .select(`
      join_post_id,
      status,
      join_posts (
        *,
        profiles (
          username,
          full_name,
          avatar_url,
          average_score,
          golf_started_at,
          location_dong
        )
      )
    `)
    .eq('user_id', user.id)
    .neq('status', 'cancelled')

  const participated = (participations || [])
    .filter((p: { join_posts: JoinPostWithHost | null }) => p.join_posts)
    .map((p: { join_posts: JoinPostWithHost }) => p.join_posts)

  return {
    hosted: hosted || [],
    participated: participated || [],
  }
}

// 참가자 목록 조회
export async function getParticipants(joinPostId: number): Promise<ParticipantWithProfile[]> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('join_participants')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url,
        average_score,
        golf_started_at
      )
    `)
    .eq('join_post_id', joinPostId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching participants:', error)
    return []
  }

  return data as ParticipantWithProfile[]
}

// ===== 생성/수정/삭제 =====

// 조인 모집글 생성
export async function createJoinPost(formData: FormData): Promise<{ error?: string; data?: { id: number } }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const roundDate = formData.get('round_date') as string
  const roundTime = formData.get('round_time') as string
  const golfCourseName = formData.get('golf_course_name') as string
  const golfCourseAddress = formData.get('golf_course_address') as string
  const totalSlots = parseInt(formData.get('total_slots') as string) || 4
  const minScore = formData.get('min_score') ? parseInt(formData.get('min_score') as string) : null
  const maxScore = formData.get('max_score') ? parseInt(formData.get('max_score') as string) : null
  const greenFee = formData.get('green_fee') ? parseInt(formData.get('green_fee') as string) : null
  const cartFee = formData.get('cart_fee') ? parseInt(formData.get('cart_fee') as string) : null
  const caddieFee = formData.get('caddie_fee') ? parseInt(formData.get('caddie_fee') as string) : null
  const locationDong = formData.get('location_dong') as string || null
  const locationGu = formData.get('location_gu') as string || null
  const locationCity = formData.get('location_city') as string || null
  const locationLat = formData.get('location_lat') ? parseFloat(formData.get('location_lat') as string) : null
  const locationLng = formData.get('location_lng') ? parseFloat(formData.get('location_lng') as string) : null

  if (!title || !roundDate || !roundTime || !golfCourseName) {
    return { error: '필수 항목을 모두 입력해주세요.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('join_posts')
    .insert({
      user_id: user.id,
      title,
      description,
      round_date: roundDate,
      round_time: roundTime,
      golf_course_name: golfCourseName,
      golf_course_address: golfCourseAddress,
      total_slots: totalSlots,
      min_score: minScore,
      max_score: maxScore,
      green_fee: greenFee,
      cart_fee: cartFee,
      caddie_fee: caddieFee,
      location_dong: locationDong,
      location_gu: locationGu,
      location_city: locationCity,
      location_lat: locationLat,
      location_lng: locationLng,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating join post:', error)
    return { error: '모집글 등록에 실패했습니다.' }
  }

  revalidatePath('/join')
  return { data: { id: data.id } }
}

// 조인 모집글 수정
export async function updateJoinPost(id: number, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const roundDate = formData.get('round_date') as string
  const roundTime = formData.get('round_time') as string
  const golfCourseName = formData.get('golf_course_name') as string
  const golfCourseAddress = formData.get('golf_course_address') as string
  const totalSlots = parseInt(formData.get('total_slots') as string) || 4
  const minScore = formData.get('min_score') ? parseInt(formData.get('min_score') as string) : null
  const maxScore = formData.get('max_score') ? parseInt(formData.get('max_score') as string) : null
  const greenFee = formData.get('green_fee') ? parseInt(formData.get('green_fee') as string) : null
  const cartFee = formData.get('cart_fee') ? parseInt(formData.get('cart_fee') as string) : null
  const caddieFee = formData.get('caddie_fee') ? parseInt(formData.get('caddie_fee') as string) : null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('join_posts')
    .update({
      title,
      description,
      round_date: roundDate,
      round_time: roundTime,
      golf_course_name: golfCourseName,
      golf_course_address: golfCourseAddress,
      total_slots: totalSlots,
      min_score: minScore,
      max_score: maxScore,
      green_fee: greenFee,
      cart_fee: cartFee,
      caddie_fee: caddieFee,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating join post:', error)
    return { error: '수정에 실패했습니다.' }
  }

  revalidatePath('/join')
  revalidatePath(`/join/${id}`)
  return { success: true }
}

// 조인 삭제 (상태를 cancelled로 변경)
export async function deleteJoinPost(id: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('join_posts')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting join post:', error)
    return { error: '삭제에 실패했습니다.' }
  }

  revalidatePath('/join')
  return { success: true }
}

// 조인 상태 변경
export async function updateJoinStatus(
  id: number,
  status: JoinPostStatus
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('join_posts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating join status:', error)
    return { error: '상태 변경에 실패했습니다.' }
  }

  revalidatePath('/join')
  revalidatePath(`/join/${id}`)
  return { success: true }
}

// ===== 참가 신청 =====

// 참가 신청
export async function applyToJoin(
  joinPostId: number,
  message?: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // 모집글 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: post } = await (supabase as any)
    .from('join_posts')
    .select('user_id, status, current_slots, total_slots')
    .eq('id', joinPostId)
    .single()

  if (!post) {
    return { error: '모집글을 찾을 수 없습니다.' }
  }

  if (post.user_id === user.id) {
    return { error: '본인이 작성한 모집글에는 신청할 수 없습니다.' }
  }

  if (post.status !== 'recruiting') {
    return { error: '모집이 마감되었습니다.' }
  }

  // 이미 신청했는지 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('join_participants')
    .select('id, status')
    .eq('join_post_id', joinPostId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    if (existing.status === 'pending' || existing.status === 'approved') {
      return { error: '이미 신청한 조인입니다.' }
    }
    // 거절/취소된 경우 다시 신청 가능하도록 업데이트
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('join_participants')
      .update({ status: 'pending', message, updated_at: new Date().toISOString() })
      .eq('id', existing.id)

    if (error) {
      console.error('Error re-applying to join:', error)
      return { error: '신청에 실패했습니다.' }
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('join_participants')
      .insert({
        join_post_id: joinPostId,
        user_id: user.id,
        message,
      })

    if (error) {
      console.error('Error applying to join:', error)
      return { error: '신청에 실패했습니다.' }
    }
  }

  revalidatePath(`/join/${joinPostId}`)
  revalidatePath('/mypage/joins')
  return { success: true }
}

// 참가 취소
export async function cancelJoinApplication(
  participantId: number
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('join_participants')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', participantId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error canceling application:', error)
    return { error: '취소에 실패했습니다.' }
  }

  revalidatePath('/join')
  revalidatePath('/mypage/joins')
  return { success: true }
}

// 참가 승인/거절 (호스트용)
export async function updateParticipantStatus(
  participantId: number,
  status: 'approved' | 'rejected'
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // 참가 정보 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: participant } = await (supabase as any)
    .from('join_participants')
    .select('join_post_id')
    .eq('id', participantId)
    .single()

  if (!participant) {
    return { error: '참가 정보를 찾을 수 없습니다.' }
  }

  // 모집글 작성자인지 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: post } = await (supabase as any)
    .from('join_posts')
    .select('user_id')
    .eq('id', participant.join_post_id)
    .single()

  if (!post || post.user_id !== user.id) {
    return { error: '권한이 없습니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('join_participants')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', participantId)

  if (error) {
    console.error('Error updating participant status:', error)
    return { error: '처리에 실패했습니다.' }
  }

  revalidatePath(`/join/${participant.join_post_id}`)
  return { success: true }
}

// 참가 여부 확인
export async function checkJoinParticipation(joinPostId: number): Promise<{
  isParticipating: boolean
  status?: ParticipantStatus
  participantId?: number
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { isParticipating: false }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('join_participants')
    .select('id, status')
    .eq('join_post_id', joinPostId)
    .eq('user_id', user.id)
    .single()

  if (!data) {
    return { isParticipating: false }
  }

  return {
    isParticipating: true,
    status: data.status as ParticipantStatus,
    participantId: data.id,
  }
}

// 실력 조건 확인
export async function checkEligibility(joinPostId: number): Promise<{
  eligible: boolean
  reason?: string
  userScore?: number
  requiredScore?: { min?: number; max?: number }
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { eligible: false, reason: '로그인이 필요합니다.' }
  }

  // 사용자 프로필
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('average_score')
    .eq('id', user.id)
    .single()

  // 모집글 조건
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: post } = await (supabase as any)
    .from('join_posts')
    .select('min_score, max_score')
    .eq('id', joinPostId)
    .single()

  if (!post) {
    return { eligible: false, reason: '모집글을 찾을 수 없습니다.' }
  }

  const userScore = profile?.average_score
  const requiredScore = {
    min: post.min_score ?? undefined,
    max: post.max_score ?? undefined,
  }

  // 실력 조건이 없으면 통과
  if (!post.min_score && !post.max_score) {
    return { eligible: true, userScore: userScore ?? undefined, requiredScore }
  }

  // 사용자 평균타가 없으면 경고만
  if (!userScore) {
    return {
      eligible: true,
      reason: '프로필에 평균 스코어를 입력하면 더 정확한 매칭이 가능합니다.',
      requiredScore,
    }
  }

  // 조건 확인
  if (post.min_score && userScore < post.min_score) {
    return {
      eligible: false,
      reason: `최소 ${post.min_score}타 이상만 신청 가능합니다.`,
      userScore,
      requiredScore,
    }
  }

  if (post.max_score && userScore > post.max_score) {
    return {
      eligible: false,
      reason: `최대 ${post.max_score}타 이하만 신청 가능합니다.`,
      userScore,
      requiredScore,
    }
  }

  return { eligible: true, userScore, requiredScore }
}

// 조회수 증가
export async function incrementJoinPostView(id: number): Promise<void> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).rpc('increment_join_post_view', { post_id: id })
}
