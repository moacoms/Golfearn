'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface PointWallet {
  id: string
  user_id: string
  balance: number
  total_earned: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface PointTransaction {
  id: string
  user_id: string
  type: 'earn' | 'spend'
  amount: number
  category: string
  description: string | null
  reference_id: string | null
  reference_type: string | null
  created_at: string
}

export interface UserExperience {
  id: string
  user_id: string
  level: number
  xp: number
  total_xp: number
  created_at: string
  updated_at: string
}

export interface Badge {
  id: string
  name: string
  description: string | null
  icon: string | null
  category: string | null
  requirement_type: string | null
  requirement_value: number | null
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge: Badge
}

/**
 * 내 포인트 지갑 정보 가져오기
 */
export async function getMyPointWallet(): Promise<{ data: PointWallet | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { data: null, error: '로그인이 필요합니다.' }
    }

    const { data, error } = await (supabase.from('point_wallets') as any).select('*').eq('user_id', user.id).single()

    if (error) {
      console.error('Error fetching point wallet:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { data: null, error: '포인트 정보를 가져오는 중 오류가 발생했습니다.' }
  }
}

/**
 * 포인트 거래 내역 가져오기
 */
export async function getPointTransactions(
  limit: number = 20,
  offset: number = 0
): Promise<{ data: PointTransaction[]; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { data: [], error: '로그인이 필요합니다.' }
    }

    const { data, error } = await (supabase.from('point_transactions') as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching point transactions:', error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { data: [], error: '거래 내역을 가져오는 중 오류가 발생했습니다.' }
  }
}

/**
 * 포인트 적립 (활동 보상)
 */
export async function earnPoints(
  amount: number,
  category: string,
  description: string,
  referenceId?: string,
  referenceType?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const { error } = await (supabase.from('point_transactions') as any).insert({
      user_id: user.id,
      type: 'earn',
      amount,
      category,
      description,
      reference_id: referenceId || null,
      reference_type: referenceType || null,
    })

    if (error) {
      console.error('Error earning points:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '포인트 적립 중 오류가 발생했습니다.' }
  }
}

/**
 * 포인트 사용
 */
export async function spendPoints(
  amount: number,
  category: string,
  description: string,
  referenceId?: string,
  referenceType?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 잔액 확인
    const { data: wallet } = await (supabase.from('point_wallets') as any).select('balance').eq('user_id', user.id).single()

    if (!wallet || wallet.balance < amount) {
      return { success: false, error: '포인트가 부족합니다.' }
    }

    const { error } = await (supabase.from('point_transactions') as any).insert({
      user_id: user.id,
      type: 'spend',
      amount,
      category,
      description,
      reference_id: referenceId || null,
      reference_type: referenceType || null,
    })

    if (error) {
      console.error('Error spending points:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '포인트 사용 중 오류가 발생했습니다.' }
  }
}

/**
 * 내 경험치 정보 가져오기
 */
export async function getMyExperience(): Promise<{ data: UserExperience | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { data: null, error: '로그인이 필요합니다.' }
    }

    const { data, error } = await (supabase.from('user_experience') as any).select('*').eq('user_id', user.id).single()

    if (error) {
      console.error('Error fetching user experience:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { data: null, error: '경험치 정보를 가져오는 중 오류가 발생했습니다.' }
  }
}

/**
 * 경험치 획득
 */
export async function earnExperience(
  amount: number,
  category: string,
  description: string,
  referenceId?: string,
  referenceType?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 경험치 거래 내역 추가
    const { error: txError } = await (supabase.from('xp_transactions') as any).insert({
      user_id: user.id,
      amount,
      category,
      description,
      reference_id: referenceId || null,
      reference_type: referenceType || null,
    })

    if (txError) {
      console.error('Error adding XP transaction:', txError)
      return { success: false, error: txError.message }
    }

    // 경험치 업데이트
    const { data: currentXp } = await (supabase.from('user_experience') as any).select('xp, total_xp').eq('user_id', user.id).single()

    if (currentXp) {
      await (supabase.from('user_experience') as any)
        .update({
          xp: currentXp.xp + amount,
          total_xp: currentXp.total_xp + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    }

    revalidatePath('/')
    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '경험치 획득 중 오류가 발생했습니다.' }
  }
}

/**
 * 모든 뱃지 목록 가져오기
 */
export async function getAllBadges(): Promise<{ data: Badge[]; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data, error } = await (supabase.from('badges') as any).select('*').order('requirement_value', { ascending: true })

    if (error) {
      console.error('Error fetching badges:', error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { data: [], error: '뱃지 목록을 가져오는 중 오류가 발생했습니다.' }
  }
}

/**
 * 내 뱃지 가져오기
 */
export async function getMyBadges(): Promise<{ data: UserBadge[]; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { data: [], error: '로그인이 필요합니다.' }
    }

    const { data, error } = await (supabase.from('user_badges') as any)
      .select('*, badge:badges(*)')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })

    if (error) {
      console.error('Error fetching user badges:', error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { data: [], error: '뱃지를 가져오는 중 오류가 발생했습니다.' }
  }
}

/**
 * 뱃지 획득
 */
export async function earnBadge(badgeId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 이미 획득한 뱃지인지 확인
    const { data: existing } = await (supabase.from('user_badges') as any).select('*').eq('user_id', user.id).eq('badge_id', badgeId).single()

    if (existing) {
      return { success: false, error: '이미 획득한 뱃지입니다.' }
    }

    const { error } = await (supabase.from('user_badges') as any).insert({
      user_id: user.id,
      badge_id: badgeId,
    })

    if (error) {
      console.error('Error earning badge:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '뱃지 획득 중 오류가 발생했습니다.' }
  }
}

/**
 * 경험치 리더보드
 */
export async function getXpLeaderboard(limit: number = 10): Promise<{ data: any[]; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data, error } = await (supabase.from('xp_leaderboard') as any).select('*').limit(limit)

    if (error) {
      console.error('Error fetching XP leaderboard:', error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { data: [], error: '리더보드를 가져오는 중 오류가 발생했습니다.' }
  }
}

/**
 * 출석 체크
 */
export async function checkIn(): Promise<{ success: boolean; consecutiveDays: number; points: number; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, consecutiveDays: 0, points: 0, error: '로그인이 필요합니다.' }
    }

    const today = new Date().toISOString().split('T')[0]

    // 오늘 이미 출석했는지 확인
    const { data: todayCheckIn } = await (supabase.from('daily_check_ins') as any).select('*').eq('user_id', user.id).eq('check_in_date', today).single()

    if (todayCheckIn) {
      return { success: false, consecutiveDays: todayCheckIn.consecutive_days, points: 0, error: '오늘 이미 출석했습니다.' }
    }

    // 어제 출석 기록 확인
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayDate = yesterday.toISOString().split('T')[0]

    const { data: yesterdayCheckIn } = await (supabase.from('daily_check_ins') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('check_in_date', yesterdayDate)
      .single()

    const consecutiveDays = yesterdayCheckIn ? yesterdayCheckIn.consecutive_days + 1 : 1

    // 연속 출석 보너스 계산
    let rewardPoints = 100
    if (consecutiveDays >= 7) rewardPoints = 500
    else if (consecutiveDays >= 3) rewardPoints = 200

    // 출석 기록 추가
    const { error: checkInError } = await (supabase.from('daily_check_ins') as any).insert({
      user_id: user.id,
      check_in_date: today,
      consecutive_days: consecutiveDays,
      reward_points: rewardPoints,
    })

    if (checkInError) {
      console.error('Error checking in:', checkInError)
      return { success: false, consecutiveDays: 0, points: 0, error: checkInError.message }
    }

    // 포인트 지급
    await earnPoints(rewardPoints, 'check_in', `출석 체크 (${consecutiveDays}일 연속)`)

    // 경험치 지급
    await earnExperience(100, 'check_in', '출석 체크')

    // 7일 연속 출석 뱃지 체크
    if (consecutiveDays === 7) {
      const { data: badge } = await (supabase.from('badges') as any).select('id').eq('name', '7일 연속 출석').single()

      if (badge) {
        await earnBadge(badge.id)
      }
    }

    revalidatePath('/')
    return { success: true, consecutiveDays, points: rewardPoints, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, consecutiveDays: 0, points: 0, error: '출석 체크 중 오류가 발생했습니다.' }
  }
}

/**
 * 오늘 출석 여부 확인
 */
export async function getTodayCheckIn(): Promise<{ checked: boolean; consecutiveDays: number; error: string | null }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { checked: false, consecutiveDays: 0, error: '로그인이 필요합니다.' }
    }

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await (supabase.from('daily_check_ins') as any).select('*').eq('user_id', user.id).eq('check_in_date', today).single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching check-in:', error)
      return { checked: false, consecutiveDays: 0, error: error.message }
    }

    return { checked: !!data, consecutiveDays: data?.consecutive_days || 0, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { checked: false, consecutiveDays: 0, error: '출석 정보를 가져오는 중 오류가 발생했습니다.' }
  }
}
