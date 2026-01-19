'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { GolfClubReview, GolfClubReviewWithProfile } from '@/types/club'

// =============================================
// 리뷰 목록 조회
// =============================================

/**
 * 클럽 리뷰 목록 조회
 */
export async function getClubReviews(
  clubId: number,
  options?: { page?: number; limit?: number; sort?: 'newest' | 'rating' | 'helpful' }
): Promise<{
  reviews: GolfClubReviewWithProfile[]
  total: number
  page: number
  totalPages: number
}> {
  const supabase = await createClient()

  const page = options?.page || 1
  const limit = options?.limit || 10
  const offset = (page - 1) * limit

  let query = supabase
    .from('golf_club_reviews')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `, { count: 'exact' })
    .eq('club_id', clubId)

  // 정렬
  switch (options?.sort) {
    case 'rating':
      query = query.order('rating', { ascending: false })
      break
    case 'helpful':
      query = query.order('helpful_count', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching club reviews:', error)
    return { reviews: [], total: 0, page, totalPages: 0 }
  }

  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  return {
    reviews: data as GolfClubReviewWithProfile[],
    total,
    page,
    totalPages,
  }
}

/**
 * 리뷰 통계 조회
 */
export async function getClubReviewStats(clubId: number): Promise<{
  average: number
  total: number
  distribution: Record<number, number>
  averageByCategory: {
    forgiveness: number | null
    distance: number | null
    control: number | null
    feel: number | null
    value: number | null
  }
}> {
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('golf_club_reviews')
    .select('rating, forgiveness_rating, distance_rating, control_rating, feel_rating, value_rating')
    .eq('club_id', clubId)

  if (error || !data || !data.length) {
    return {
      average: 0,
      total: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      averageByCategory: { forgiveness: null, distance: null, control: null, feel: null, value: null },
    }
  }

  const reviews = data as any[]

  // 평균 계산
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  // 분포 계산
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach(r => {
    distribution[r.rating] = (distribution[r.rating] || 0) + 1
  })

  // 카테고리별 평균
  const calcAvg = (field: string) => {
    const values = reviews.filter(r => r[field] !== null).map(r => r[field] as number)
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null
  }

  return {
    average: Math.round(average * 10) / 10,
    total: reviews.length,
    distribution,
    averageByCategory: {
      forgiveness: calcAvg('forgiveness_rating'),
      distance: calcAvg('distance_rating'),
      control: calcAvg('control_rating'),
      feel: calcAvg('feel_rating'),
      value: calcAvg('value_rating'),
    },
  }
}

// =============================================
// 리뷰 작성/수정/삭제
// =============================================

/**
 * 리뷰 작성
 */
export async function createClubReview(formData: FormData): Promise<{
  error?: string
  data?: GolfClubReview
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const clubId = parseInt(formData.get('club_id') as string)
  const rating = parseInt(formData.get('rating') as string)
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  // 선택적 필드
  const forgivenessRating = formData.get('forgiveness_rating')
  const distanceRating = formData.get('distance_rating')
  const controlRating = formData.get('control_rating')
  const feelRating = formData.get('feel_rating')
  const valueRating = formData.get('value_rating')
  const reviewerHandicap = formData.get('reviewer_handicap')
  const reviewerHeight = formData.get('reviewer_height')
  const ownershipPeriod = formData.get('ownership_period')
  const imagesJson = formData.get('images') as string

  if (!clubId || !rating || !content) {
    return { error: '필수 항목을 입력해주세요.' }
  }

  // 이미 리뷰를 작성했는지 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('golf_club_reviews')
    .select('id')
    .eq('club_id', clubId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return { error: '이미 이 클럽에 리뷰를 작성하셨습니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('golf_club_reviews')
    .insert({
      club_id: clubId,
      user_id: user.id,
      rating,
      title: title || null,
      content,
      forgiveness_rating: forgivenessRating ? parseInt(forgivenessRating as string) : null,
      distance_rating: distanceRating ? parseInt(distanceRating as string) : null,
      control_rating: controlRating ? parseInt(controlRating as string) : null,
      feel_rating: feelRating ? parseInt(feelRating as string) : null,
      value_rating: valueRating ? parseInt(valueRating as string) : null,
      reviewer_handicap: reviewerHandicap ? parseInt(reviewerHandicap as string) : null,
      reviewer_height: reviewerHeight ? parseInt(reviewerHeight as string) : null,
      ownership_period: ownershipPeriod || null,
      images: imagesJson ? JSON.parse(imagesJson) : null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating review:', error)
    return { error: '리뷰 작성에 실패했습니다.' }
  }

  revalidatePath(`/club-catalog/${clubId}`)
  return { data }
}

/**
 * 리뷰 수정
 */
export async function updateClubReview(
  reviewId: number,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const rating = parseInt(formData.get('rating') as string)
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const forgivenessRating = formData.get('forgiveness_rating')
  const distanceRating = formData.get('distance_rating')
  const controlRating = formData.get('control_rating')
  const feelRating = formData.get('feel_rating')
  const valueRating = formData.get('value_rating')
  const reviewerHandicap = formData.get('reviewer_handicap')
  const reviewerHeight = formData.get('reviewer_height')
  const ownershipPeriod = formData.get('ownership_period')
  const imagesJson = formData.get('images') as string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: review, error: fetchError } = await (supabase as any)
    .from('golf_club_reviews')
    .select('club_id')
    .eq('id', reviewId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !review) {
    return { error: '리뷰를 찾을 수 없거나 수정 권한이 없습니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('golf_club_reviews')
    .update({
      rating,
      title: title || null,
      content,
      forgiveness_rating: forgivenessRating ? parseInt(forgivenessRating as string) : null,
      distance_rating: distanceRating ? parseInt(distanceRating as string) : null,
      control_rating: controlRating ? parseInt(controlRating as string) : null,
      feel_rating: feelRating ? parseInt(feelRating as string) : null,
      value_rating: valueRating ? parseInt(valueRating as string) : null,
      reviewer_handicap: reviewerHandicap ? parseInt(reviewerHandicap as string) : null,
      reviewer_height: reviewerHeight ? parseInt(reviewerHeight as string) : null,
      ownership_period: ownershipPeriod || null,
      images: imagesJson ? JSON.parse(imagesJson) : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating review:', error)
    return { error: '리뷰 수정에 실패했습니다.' }
  }

  revalidatePath(`/club-catalog/${review.club_id}`)
  return { success: true }
}

/**
 * 리뷰 삭제
 */
export async function deleteClubReview(reviewId: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // 리뷰 조회 (club_id 얻기)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: review, error: fetchError } = await (supabase as any)
    .from('golf_club_reviews')
    .select('club_id')
    .eq('id', reviewId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !review) {
    return { error: '리뷰를 찾을 수 없거나 삭제 권한이 없습니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('golf_club_reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting review:', error)
    return { error: '리뷰 삭제에 실패했습니다.' }
  }

  revalidatePath(`/club-catalog/${review.club_id}`)
  return { success: true }
}

// =============================================
// 도움됨 기능
// =============================================

/**
 * 리뷰 도움됨 카운트 증가
 */
export async function markReviewHelpful(reviewId: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  // 현재 helpful_count 조회
  const { data: review, error: fetchError } = await (supabase as any)
    .from('golf_club_reviews')
    .select('helpful_count')
    .eq('id', reviewId)
    .single()

  if (fetchError || !review) {
    return { error: '리뷰를 찾을 수 없습니다.' }
  }

  // helpful_count + 1로 업데이트
  const { error: updateError } = await (supabase as any)
    .from('golf_club_reviews')
    .update({ helpful_count: (review.helpful_count || 0) + 1 })
    .eq('id', reviewId)

  if (updateError) {
    return { error: '업데이트에 실패했습니다.' }
  }

  return { success: true }
}

// =============================================
// 내 리뷰 조회
// =============================================

/**
 * 사용자가 작성한 리뷰 목록
 */
export async function getMyReviews(): Promise<(GolfClubReview & { club_name: string })[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('golf_club_reviews')
    .select(`
      *,
      golf_clubs (
        name,
        name_ko
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching my reviews:', error)
    return []
  }

  return data.map((r: { golf_clubs: { name_ko: string; name: string } }) => ({
    ...r,
    club_name: r.golf_clubs?.name_ko || r.golf_clubs?.name || '알 수 없음',
  }))
}

/**
 * 특정 클럽에 대한 내 리뷰 조회
 */
export async function getMyClubReview(clubId: number): Promise<GolfClubReview | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('golf_club_reviews')
    .select('*')
    .eq('club_id', clubId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return null
  }

  return data as GolfClubReview
}
