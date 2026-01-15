'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type LessonPro = {
  id: number
  user_id: string | null
  name: string
  introduction: string | null
  experience_years: number | null
  specialties: string[] | null
  certifications: string[] | null
  regions: string[] | null
  lesson_types: string[] | null
  price_individual: number | null
  price_group: number | null
  available_times: string | null
  profile_image: string | null
  gallery_images: string[] | null
  contact_phone: string | null
  contact_kakao: string | null
  instagram: string | null
  youtube: string | null
  location_lat: number | null
  location_lng: number | null
  location_address: string | null
  rating: number
  review_count: number
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  distance?: number
}

export type LessonProReview = {
  id: number
  pro_id: number
  user_id: string
  rating: number
  content: string | null
  lesson_type: string | null
  created_at: string
  profiles: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface GetLessonProsParams {
  region?: string
  specialty?: string
  lessonType?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'rating' | 'review_count' | 'price_low' | 'price_high'
  search?: string
}

// 레슨프로 목록 조회
export async function getLessonPros(params: GetLessonProsParams = {}): Promise<LessonPro[]> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('lesson_pros')
    .select('*')
    .eq('is_active', true)

  // 지역 필터
  if (params.region) {
    query = query.contains('regions', [params.region])
  }

  // 전문 분야 필터
  if (params.specialty) {
    query = query.contains('specialties', [params.specialty])
  }

  // 레슨 유형 필터
  if (params.lessonType) {
    query = query.contains('lesson_types', [params.lessonType])
  }

  // 가격 필터 (1:1 레슨 기준)
  if (params.minPrice !== undefined) {
    query = query.gte('price_individual', params.minPrice)
  }
  if (params.maxPrice !== undefined) {
    query = query.lte('price_individual', params.maxPrice)
  }

  // 검색어 필터
  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,introduction.ilike.%${params.search}%`)
  }

  // 정렬
  switch (params.sortBy) {
    case 'rating':
      query = query.order('rating', { ascending: false })
      break
    case 'review_count':
      query = query.order('review_count', { ascending: false })
      break
    case 'price_low':
      query = query.order('price_individual', { ascending: true, nullsFirst: false })
      break
    case 'price_high':
      query = query.order('price_individual', { ascending: false })
      break
    default:
      query = query.order('rating', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching lesson pros:', error)
    return []
  }

  return data as LessonPro[]
}

// 레슨프로 상세 조회
export async function getLessonPro(id: number): Promise<LessonPro | null> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('lesson_pros')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching lesson pro:', error)
    return null
  }

  return data as LessonPro
}

// 레슨프로 리뷰 조회
export async function getLessonProReviews(proId: number): Promise<LessonProReview[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lesson_pro_reviews')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('pro_id', proId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching lesson pro reviews:', error)
    return []
  }

  return data as LessonProReview[]
}

// 레슨프로 리뷰 작성
export async function createLessonProReview(
  proId: number,
  rating: number,
  content: string,
  lessonType?: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  if (rating < 1 || rating > 5) {
    return { error: '평점은 1~5 사이여야 합니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('lesson_pro_reviews')
    .insert({
      pro_id: proId,
      user_id: user.id,
      rating,
      content: content.trim() || null,
      lesson_type: lessonType || null,
    })

  if (error) {
    if (error.code === '23505') { // unique constraint violation
      return { error: '이미 리뷰를 작성하셨습니다.' }
    }
    console.error('Error creating review:', error)
    return { error: '리뷰 작성에 실패했습니다.' }
  }

  revalidatePath(`/lesson-pro/${proId}`)
  return { success: true }
}

// 레슨프로 리뷰 삭제
export async function deleteLessonProReview(
  reviewId: number,
  proId: number
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('lesson_pro_reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting review:', error)
    return { error: '리뷰 삭제에 실패했습니다.' }
  }

  revalidatePath(`/lesson-pro/${proId}`)
  return { success: true }
}

// 레슨 문의하기
export async function createLessonInquiry(
  proId: number,
  message: string,
  preferredTime?: string,
  lessonType?: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  if (!message.trim()) {
    return { error: '문의 내용을 입력해주세요.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('lesson_inquiries')
    .insert({
      pro_id: proId,
      user_id: user.id,
      message: message.trim(),
      preferred_time: preferredTime || null,
      lesson_type: lessonType || null,
    })

  if (error) {
    console.error('Error creating inquiry:', error)
    return { error: '문의 전송에 실패했습니다.' }
  }

  // TODO: 레슨프로에게 알림 전송

  return { success: true }
}

// 사용자가 이미 리뷰를 작성했는지 확인
export async function hasUserReviewed(proId: number): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('lesson_pro_reviews')
    .select('id')
    .eq('pro_id', proId)
    .eq('user_id', user.id)
    .single()

  return !!data
}
