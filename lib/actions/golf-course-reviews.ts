'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type GolfCourseReview = {
  id: number
  user_id: string
  place_id: string
  golf_course_name: string
  rating: number
  title: string | null
  content: string
  visit_date: string | null
  course_condition: number | null
  facilities: number | null
  service: number | null
  value_for_money: number | null
  helpful_count: number
  created_at: string
  updated_at: string
  profiles?: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
  user_marked_helpful?: boolean
}

// 골프장 리뷰 목록 조회
export async function getGolfCourseReviews(placeId: string): Promise<GolfCourseReview[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('golf_course_reviews')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('place_id', placeId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching golf course reviews:', error)
    return []
  }

  // 현재 사용자가 도움됨 표시한 리뷰 확인
  if (user && data.length > 0) {
    const reviewIds = data.map((r: GolfCourseReview) => r.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: helpfulData } = await (supabase as any)
      .from('golf_course_review_helpful')
      .select('review_id')
      .in('review_id', reviewIds)
      .eq('user_id', user.id)

    const helpfulSet = new Set((helpfulData || []).map((h: { review_id: number }) => h.review_id))

    return data.map((review: GolfCourseReview) => ({
      ...review,
      user_marked_helpful: helpfulSet.has(review.id),
    }))
  }

  return data as GolfCourseReview[]
}

// 골프장 평균 평점 조회
export async function getGolfCourseAverageRating(placeId: string): Promise<{
  average: number
  count: number
  distribution: { [key: number]: number }
}> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('golf_course_reviews')
    .select('rating')
    .eq('place_id', placeId)

  if (error || !data || data.length === 0) {
    return { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
  }

  const ratings = data.map((r: { rating: number }) => r.rating)
  const average = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  ratings.forEach((r: number) => {
    distribution[r as keyof typeof distribution]++
  })

  return {
    average: Math.round(average * 10) / 10,
    count: ratings.length,
    distribution,
  }
}

// 리뷰 작성
export async function createGolfCourseReview(formData: FormData): Promise<{
  error?: string
  success?: boolean
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const placeId = formData.get('place_id') as string
  const golfCourseName = formData.get('golf_course_name') as string
  const rating = parseInt(formData.get('rating') as string)
  const title = formData.get('title') as string || null
  const content = formData.get('content') as string
  const visitDate = formData.get('visit_date') as string || null
  const courseCondition = formData.get('course_condition')
    ? parseInt(formData.get('course_condition') as string)
    : null
  const facilities = formData.get('facilities')
    ? parseInt(formData.get('facilities') as string)
    : null
  const service = formData.get('service')
    ? parseInt(formData.get('service') as string)
    : null
  const valueForMoney = formData.get('value_for_money')
    ? parseInt(formData.get('value_for_money') as string)
    : null

  if (!placeId || !golfCourseName || !rating || !content) {
    return { error: '필수 항목을 모두 입력해주세요.' }
  }

  if (rating < 1 || rating > 5) {
    return { error: '평점은 1-5점 사이여야 합니다.' }
  }

  // 이미 리뷰를 작성했는지 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('golf_course_reviews')
    .select('id')
    .eq('place_id', placeId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return { error: '이미 이 골프장에 리뷰를 작성하셨습니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('golf_course_reviews')
    .insert({
      user_id: user.id,
      place_id: placeId,
      golf_course_name: golfCourseName,
      rating,
      title,
      content,
      visit_date: visitDate,
      course_condition: courseCondition,
      facilities,
      service,
      value_for_money: valueForMoney,
    })

  if (error) {
    console.error('Error creating review:', error)
    return { error: '리뷰 작성에 실패했습니다.' }
  }

  revalidatePath(`/golf-courses/${placeId}`)
  return { success: true }
}

// 리뷰 수정
export async function updateGolfCourseReview(
  reviewId: number,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const rating = parseInt(formData.get('rating') as string)
  const title = formData.get('title') as string || null
  const content = formData.get('content') as string
  const visitDate = formData.get('visit_date') as string || null
  const courseCondition = formData.get('course_condition')
    ? parseInt(formData.get('course_condition') as string)
    : null
  const facilities = formData.get('facilities')
    ? parseInt(formData.get('facilities') as string)
    : null
  const service = formData.get('service')
    ? parseInt(formData.get('service') as string)
    : null
  const valueForMoney = formData.get('value_for_money')
    ? parseInt(formData.get('value_for_money') as string)
    : null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: review } = await (supabase as any)
    .from('golf_course_reviews')
    .select('place_id')
    .eq('id', reviewId)
    .eq('user_id', user.id)
    .single()

  if (!review) {
    return { error: '리뷰를 찾을 수 없거나 수정 권한이 없습니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('golf_course_reviews')
    .update({
      rating,
      title,
      content,
      visit_date: visitDate,
      course_condition: courseCondition,
      facilities,
      service,
      value_for_money: valueForMoney,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating review:', error)
    return { error: '리뷰 수정에 실패했습니다.' }
  }

  revalidatePath(`/golf-courses/${review.place_id}`)
  return { success: true }
}

// 리뷰 삭제
export async function deleteGolfCourseReview(reviewId: number): Promise<{
  error?: string
  success?: boolean
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: review } = await (supabase as any)
    .from('golf_course_reviews')
    .select('place_id')
    .eq('id', reviewId)
    .eq('user_id', user.id)
    .single()

  if (!review) {
    return { error: '리뷰를 찾을 수 없거나 삭제 권한이 없습니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('golf_course_reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting review:', error)
    return { error: '리뷰 삭제에 실패했습니다.' }
  }

  revalidatePath(`/golf-courses/${review.place_id}`)
  return { success: true }
}

// 도움됨 토글
export async function toggleReviewHelpful(reviewId: number): Promise<{
  error?: string
  success?: boolean
  isHelpful?: boolean
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // 이미 도움됨 표시했는지 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('golf_course_review_helpful')
    .select('id')
    .eq('review_id', reviewId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // 취소
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('golf_course_review_helpful')
      .delete()
      .eq('id', existing.id)

    if (error) {
      return { error: '처리에 실패했습니다.' }
    }

    return { success: true, isHelpful: false }
  } else {
    // 추가
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('golf_course_review_helpful')
      .insert({
        review_id: reviewId,
        user_id: user.id,
      })

    if (error) {
      return { error: '처리에 실패했습니다.' }
    }

    return { success: true, isHelpful: true }
  }
}
