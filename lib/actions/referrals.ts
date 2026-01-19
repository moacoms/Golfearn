'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ReferralCode {
  id: string
  user_id: string
  code: string
  uses_count: number
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  referral_code: string
  reward_given: boolean
  created_at: string
}

export interface ReferralStats {
  referrer_id: string
  referrer_email: string
  total_referrals: number
  rewarded_referrals: number
  referral_code: string
}

/**
 * 현재 사용자의 추천 코드 가져오기
 */
export async function getMyReferralCode(): Promise<{ data: ReferralCode | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { data: null, error: '로그인이 필요합니다.' }
    }

    const { data, error } = await (supabase.from('referral_codes') as any).select('*').eq('user_id', user.id).single()

    if (error) {
      console.error('Error fetching referral code:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { data: null, error: '추천 코드를 가져오는 중 오류가 발생했습니다.' }
  }
}

/**
 * 추천 코드로 회원가입 시 추천 관계 생성
 */
export async function applyReferralCode(referralCode: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 추천 코드 확인
    const { data: referralCodeData, error: codeError } = await (supabase.from('referral_codes') as any)
      .select('*')
      .eq('code', referralCode.toUpperCase())
      .single() as { data: ReferralCode | null; error: any }

    if (codeError || !referralCodeData) {
      return { success: false, error: '유효하지 않은 추천 코드입니다.' }
    }

    // 자기 자신을 추천할 수 없음
    if (referralCodeData.user_id === user.id) {
      return { success: false, error: '본인의 추천 코드는 사용할 수 없습니다.' }
    }

    // 이미 추천받은 사용자인지 확인
    const { data: existingReferral } = await (supabase.from('referrals') as any).select('*').eq('referred_id', user.id).single()

    if (existingReferral) {
      return { success: false, error: '이미 추천을 받으신 계정입니다.' }
    }

    // 추천 관계 생성
    const { error: insertError } = await (supabase.from('referrals') as any).insert({
      referrer_id: referralCodeData.user_id,
      referred_id: user.id,
      referral_code: referralCode.toUpperCase(),
      reward_given: false,
    })

    if (insertError) {
      console.error('Error creating referral:', insertError)
      return { success: false, error: '추천 등록 중 오류가 발생했습니다.' }
    }

    // 추천 코드 사용 횟수 증가
    await (supabase.from('referral_codes') as any)
      .update({ uses_count: referralCodeData.uses_count + 1 })
      .eq('id', referralCodeData.id)

    // 추천인에게 포인트 지급 (5,000P)
    await (supabase.from('point_transactions') as any).insert({
      user_id: referralCodeData.user_id,
      type: 'earn',
      amount: 5000,
      category: 'referral',
      description: '친구 추천 보너스',
      reference_id: user.id,
      reference_type: 'user',
    })

    // 신규 가입자에게 추가 포인트 지급 (기본 3,000P + 추천 3,000P)
    await (supabase.from('point_transactions') as any).insert({
      user_id: user.id,
      type: 'earn',
      amount: 3000,
      category: 'referral_join',
      description: '추천 가입 보너스',
      reference_id: referralCodeData.user_id,
      reference_type: 'user',
    })

    // 보상 지급 완료 표시
    await (supabase.from('referrals') as any).update({ reward_given: true }).eq('referred_id', user.id)

    revalidatePath('/')
    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '추천 코드 적용 중 오류가 발생했습니다.' }
  }
}

/**
 * 내 추천 통계 가져오기
 */
export async function getMyReferralStats(): Promise<{ data: ReferralStats | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { data: null, error: '로그인이 필요합니다.' }
    }

    const { data, error } = await (supabase.from('referral_stats') as any).select('*').eq('referrer_id', user.id).single()

    if (error) {
      // 아직 추천한 사람이 없는 경우
      if (error.code === 'PGRST116') {
        const { data: codeData } = await (supabase.from('referral_codes') as any).select('code').eq('user_id', user.id).single()

        return {
          data: {
            referrer_id: user.id,
            referrer_email: user.email || '',
            total_referrals: 0,
            rewarded_referrals: 0,
            referral_code: codeData?.code || '',
          },
          error: null,
        }
      }

      console.error('Error fetching referral stats:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { data: null, error: '추천 통계를 가져오는 중 오류가 발생했습니다.' }
  }
}

/**
 * 내가 추천한 사람들 목록
 */
export async function getMyReferrals(): Promise<{ data: Referral[]; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { data: [], error: '로그인이 필요합니다.' }
    }

    const { data, error } = await (supabase.from('referrals') as any).select('*').eq('referrer_id', user.id).order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching referrals:', error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { data: [], error: '추천 목록을 가져오는 중 오류가 발생했습니다.' }
  }
}

/**
 * 추천인 리더보드 가져오기
 */
export async function getReferralLeaderboard(limit: number = 10): Promise<{ data: any[]; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data, error } = await (supabase.from('referral_leaderboard') as any).select('*').limit(limit)

    if (error) {
      console.error('Error fetching referral leaderboard:', error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { data: [], error: '리더보드를 가져오는 중 오류가 발생했습니다.' }
  }
}
