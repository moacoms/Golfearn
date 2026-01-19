'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Event {
  id: string
  title: string
  description: string | null
  event_type: string
  status: string
  start_date: string | null
  end_date: string | null
  banner_image: string | null
  terms: string | null
  reward_type: string | null
  reward_value: any
  max_participants: number | null
  current_participants: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface EventParticipant {
  id: string
  event_id: string
  user_id: string
  status: string
  submission_data: any
  reward_claimed: boolean
  participated_at: string
}

export interface PromoCode {
  id: string
  code: string
  description: string | null
  discount_type: string
  discount_value: number
  usage_limit: number | null
  usage_count: number
  valid_from: string | null
  valid_until: string | null
  applicable_to: string | null
  is_active: boolean
  created_at: string
}

/**
 * 활성화된 이벤트 목록 가져오기
 */
export async function getActiveEvents(): Promise<{ data: Event[]; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data, error } = await (supabase.from('events') as any).select('*').eq('status', 'active').order('start_date', { ascending: false })

    if (error) {
      console.error('Error fetching active events:', error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { data: [], error: '이벤트를 가져오는 중 오류가 발생했습니다.' }
  }
}

/**
 * 이벤트 상세 정보 가져오기
 */
export async function getEvent(eventId: string): Promise<{ data: Event | null; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data, error } = await (supabase.from('events') as any).select('*').eq('id', eventId).single()

    if (error) {
      console.error('Error fetching event:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { data: null, error: '이벤트 정보를 가져오는 중 오류가 발생했습니다.' }
  }
}

/**
 * 이벤트 참가하기
 */
export async function participateInEvent(
  eventId: string,
  submissionData?: any
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 이벤트 정보 확인
    const { data: event, error: eventError } = await (supabase.from('events') as any).select('*').eq('id', eventId).single() as { data: Event | null; error: any }

    if (eventError || !event) {
      return { success: false, error: '이벤트를 찾을 수 없습니다.' }
    }

    if (event.status !== 'active') {
      return { success: false, error: '진행 중인 이벤트가 아닙니다.' }
    }

    // 참가 인원 제한 확인
    if (event.max_participants && event.current_participants >= event.max_participants) {
      return { success: false, error: '참가 인원이 마감되었습니다.' }
    }

    // 이미 참가했는지 확인
    const { data: existing } = await (supabase.from('event_participants') as any).select('*').eq('event_id', eventId).eq('user_id', user.id).single()

    if (existing) {
      return { success: false, error: '이미 참가한 이벤트입니다.' }
    }

    // 참가 신청
    const { error: participateError } = await (supabase.from('event_participants') as any).insert({
      event_id: eventId,
      user_id: user.id,
      submission_data: submissionData || null,
      status: 'pending',
    })

    if (participateError) {
      console.error('Error participating in event:', participateError)
      return { success: false, error: participateError.message }
    }

    // 현재 참가자 수 증가
    await (supabase.from('events') as any)
      .update({ current_participants: event.current_participants + 1 })
      .eq('id', eventId)

    // 참가 보상 (포인트)
    if (event.reward_type === 'points' && event.reward_value?.signup_points) {
      await (supabase.from('point_transactions') as any).insert({
        user_id: user.id,
        type: 'earn',
        amount: event.reward_value.signup_points,
        category: 'event',
        description: `${event.title} 참가 보상`,
        reference_id: eventId,
        reference_type: 'event',
      })
    }

    revalidatePath('/')
    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '이벤트 참가 중 오류가 발생했습니다.' }
  }
}

/**
 * 내 참가 이벤트 목록
 */
export async function getMyEventParticipations(): Promise<{ data: (EventParticipant & { event: Event })[]; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { data: [], error: '로그인이 필요합니다.' }
    }

    const { data, error } = await (supabase.from('event_participants') as any)
      .select('*, event:events(*)')
      .eq('user_id', user.id)
      .order('participated_at', { ascending: false })

    if (error) {
      console.error('Error fetching event participations:', error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { data: [], error: '참가 이벤트를 가져오는 중 오류가 발생했습니다.' }
  }
}

/**
 * 프로모션 코드 검증 및 적용
 */
export async function applyPromoCode(code: string): Promise<{ success: boolean; discount: number; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, discount: 0, error: '로그인이 필요합니다.' }
    }

    // 프로모션 코드 확인
    const { data: promoCode, error: codeError } = await (supabase.from('promo_codes') as any)
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single() as { data: PromoCode | null; error: any }

    if (codeError || !promoCode) {
      return { success: false, discount: 0, error: '유효하지 않은 프로모션 코드입니다.' }
    }

    // 유효 기간 확인
    const now = new Date()
    if (promoCode.valid_from && new Date(promoCode.valid_from) > now) {
      return { success: false, discount: 0, error: '아직 사용할 수 없는 프로모션 코드입니다.' }
    }
    if (promoCode.valid_until && new Date(promoCode.valid_until) < now) {
      return { success: false, discount: 0, error: '기간이 만료된 프로모션 코드입니다.' }
    }

    // 사용 제한 확인
    if (promoCode.usage_limit && promoCode.usage_count >= promoCode.usage_limit) {
      return { success: false, discount: 0, error: '사용 횟수가 초과된 프로모션 코드입니다.' }
    }

    // 이미 사용했는지 확인 (사용자별)
    const { data: existingUsage } = await (supabase.from('promo_code_usage') as any)
      .select('*')
      .eq('promo_code_id', promoCode.id)
      .eq('user_id', user.id)
      .single()

    if (existingUsage) {
      return { success: false, discount: 0, error: '이미 사용한 프로모션 코드입니다.' }
    }

    return { success: true, discount: promoCode.discount_value, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, discount: 0, error: '프로모션 코드 확인 중 오류가 발생했습니다.' }
  }
}

/**
 * 프로모션 코드 사용 기록
 */
export async function recordPromoCodeUsage(
  promoCodeId: string,
  orderType: string,
  orderId: string,
  discountAmount: number
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 사용 기록 추가
    const { error: usageError } = await (supabase.from('promo_code_usage') as any).insert({
      promo_code_id: promoCodeId,
      user_id: user.id,
      order_type: orderType,
      order_id: orderId,
      discount_amount: discountAmount,
    })

    if (usageError) {
      console.error('Error recording promo code usage:', usageError)
      return { success: false, error: usageError.message }
    }

    // 사용 횟수 증가
    const { data: promoCode } = await (supabase.from('promo_codes') as any).select('usage_count').eq('id', promoCodeId).single() as { data: { usage_count: number } | null }

    if (promoCode) {
      await (supabase.from('promo_codes') as any)
        .update({ usage_count: promoCode.usage_count + 1 })
        .eq('id', promoCodeId)
    }

    revalidatePath('/')
    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '프로모션 코드 사용 기록 중 오류가 발생했습니다.' }
  }
}

/**
 * 이벤트 생성 (관리자용)
 */
export async function createEvent(eventData: Partial<Event>): Promise<{ success: boolean; eventId: string | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, eventId: null, error: '로그인이 필요합니다.' }
    }

    const { data, error } = await (supabase.from('events') as any)
      .insert({
        ...eventData,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return { success: false, eventId: null, error: error.message }
    }

    revalidatePath('/')
    return { success: true, eventId: data.id, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, eventId: null, error: '이벤트 생성 중 오류가 발생했습니다.' }
  }
}
