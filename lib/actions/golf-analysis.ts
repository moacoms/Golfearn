'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 타입 정의
export interface ShotData {
  clubType: string
  ballSpeed?: number
  clubSpeed?: number
  launchAngle?: number
  spinRate?: number
  carry: number
  total?: number
  offline?: number
  attackAngle?: number
  clubPath?: number
  faceAngle?: number
  smashFactor?: number
}

export interface CreateSessionInput {
  sessionDate: string
  sessionType: 'practice' | 'round' | 'fitting'
  dataSource: string
  location?: string
  shots: ShotData[]
}

export interface GolfProfile {
  handicap?: number
  height?: number
  weight?: number
  gender?: string
  handedness?: string
  swingSpeedLevel?: string
  typicalMiss?: string
  primaryGoal?: string
  targetHandicap?: number
  experienceYears?: number
  distanceUnit?: string
  speedUnit?: string
}

// 세션 목록 조회
export async function getSessions(limit: number = 10, offset: number = 0) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { sessions: [], error: 'Unauthorized' }
  }

  const { data: sessions, error } = await (supabase as any)
    .from('swing_sessions')
    .select(`
      *,
      swing_analyses (id, summary, analysis_type)
    `)
    .eq('user_id', user.id)
    .order('session_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Get sessions error:', error)
    return { sessions: [], error: error.message }
  }

  return { sessions: sessions || [], error: null }
}

// 세션 상세 조회
export async function getSession(sessionId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { session: null, error: 'Unauthorized' }
  }

  const { data: session, error } = await (supabase as any)
    .from('swing_sessions')
    .select(`
      *,
      swing_analyses (*),
      shot_data (*)
    `)
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Get session error:', error)
    return { session: null, error: error.message }
  }

  return { session, error: null }
}

// 클럽별 통계 조회
export async function getClubStatistics() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { statistics: [], error: 'Unauthorized' }
  }

  const { data: statistics, error } = await (supabase as any)
    .from('club_statistics')
    .select('*')
    .eq('user_id', user.id)
    .order('total_shots', { ascending: false })

  if (error) {
    console.error('Get club statistics error:', error)
    return { statistics: [], error: error.message }
  }

  return { statistics: statistics || [], error: null }
}

// 골프 프로필 조회
export async function getGolfProfile() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { profile: null, error: 'Unauthorized' }
  }

  const { data: profile, error } = await (supabase as any)
    .from('user_golf_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Get golf profile error:', error)
    return { profile: null, error: error.message }
  }

  return { profile, error: null }
}

// 골프 프로필 업데이트
export async function updateGolfProfile(data: GolfProfile) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const profileData = {
    user_id: user.id,
    height_cm: data.height,
    weight_kg: data.weight,
    gender: data.gender,
    handedness: data.handedness,
    handicap: data.handicap,
    experience_years: data.experienceYears,
    swing_speed_level: data.swingSpeedLevel,
    typical_miss: data.typicalMiss,
    primary_goal: data.primaryGoal,
    target_handicap: data.targetHandicap,
    distance_unit: data.distanceUnit,
    speed_unit: data.speedUnit,
    updated_at: new Date().toISOString(),
  }

  const { error } = await (supabase as any)
    .from('user_golf_profiles')
    .upsert(profileData, { onConflict: 'user_id' })

  if (error) {
    console.error('Update golf profile error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/analysis')
  return { success: true, error: null }
}

// 구독 정보 조회
export async function getSubscription() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { subscription: null, error: 'Unauthorized' }
  }

  const { data: subscription, error } = await (supabase as any)
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Get subscription error:', error)
    return { subscription: null, error: error.message }
  }

  // 구독이 없으면 무료 플랜 기본값 반환
  if (!subscription) {
    return {
      subscription: {
        plan_type: 'free',
        status: 'active',
        monthly_analysis_count: 0,
        monthly_analysis_limit: 3,
        monthly_ocr_count: 0,
        monthly_ocr_limit: 5,
      },
      error: null,
    }
  }

  return { subscription, error: null }
}

// 사용량 로그 조회
export async function getUsageLogs(limit: number = 10) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { logs: [], error: 'Unauthorized' }
  }

  const { data: logs, error } = await (supabase as any)
    .from('usage_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Get usage logs error:', error)
    return { logs: [], error: error.message }
  }

  return { logs: logs || [], error: null }
}

// 목표 조회
export async function getGoals() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { goals: [], error: 'Unauthorized' }
  }

  const { data: goals, error } = await (supabase as any)
    .from('swing_goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Get goals error:', error)
    return { goals: [], error: error.message }
  }

  return { goals: goals || [], error: null }
}

// 목표 생성
export async function createGoal(data: {
  goalType: string
  clubType?: string
  targetValue: number
  targetDate: string
}) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  // 현재 값 조회 (클럽 통계에서)
  let currentValue = 0
  if (data.clubType) {
    const { data: stats } = await (supabase as any)
      .from('club_statistics')
      .select('avg_carry')
      .eq('user_id', user.id)
      .eq('club_type', data.clubType)
      .single()

    currentValue = stats?.avg_carry || 0
  }

  const { error } = await (supabase as any)
    .from('swing_goals')
    .insert({
      user_id: user.id,
      goal_type: data.goalType,
      club_type: data.clubType,
      target_value: data.targetValue,
      current_value: currentValue,
      start_value: currentValue,
      start_date: new Date().toISOString().split('T')[0],
      target_date: data.targetDate,
      status: 'active',
    })

  if (error) {
    console.error('Create goal error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/analysis/goals')
  return { success: true, error: null }
}

// 대시보드 통계 조회
export async function getDashboardStats() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { stats: null, error: 'Unauthorized' }
  }

  // 이번 달 세션 수
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: sessionsThisMonth } = await (supabase as any)
    .from('swing_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('session_date', startOfMonth.toISOString().split('T')[0])

  // 드라이버 평균 거리
  const { data: driverStats } = await (supabase as any)
    .from('club_statistics')
    .select('avg_carry, avg_ball_speed')
    .eq('user_id', user.id)
    .eq('club_type', 'driver')
    .single()

  // 활성 목표
  const { data: goals } = await (supabase as any)
    .from('swing_goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)

  // 지난 달 대비 개선
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)

  const { data: recentShots } = await (supabase as any)
    .from('shot_data')
    .select('carry_distance, created_at')
    .eq('user_id', user.id)
    .eq('club_type', 'driver')
    .gte('created_at', lastMonth.toISOString())
    .order('created_at', { ascending: false })

  let improvement = 0
  if (recentShots && recentShots.length > 10) {
    const recent = recentShots.slice(0, 5)
    const older = recentShots.slice(-5)
    const recentAvg = recent.reduce((sum: number, s: any) => sum + s.carry_distance, 0) / recent.length
    const olderAvg = older.reduce((sum: number, s: any) => sum + s.carry_distance, 0) / older.length
    improvement = Math.round(recentAvg - olderAvg)
  }

  return {
    stats: {
      sessionsThisMonth: sessionsThisMonth || 0,
      driverAvg: driverStats?.avg_carry ? Math.round(driverStats.avg_carry) : null,
      driverBallSpeed: driverStats?.avg_ball_speed ? Math.round(driverStats.avg_ball_speed * 10) / 10 : null,
      activeGoal: goals?.[0] || null,
      improvement,
    },
    error: null,
  }
}

// 클럽 통계 업데이트 (세션 저장 후 호출)
export async function updateClubStatistics(userId: string) {
  const supabase = await createClient()

  // 클럽별 샷 데이터 집계
  const { data: shots } = await (supabase as any)
    .from('shot_data')
    .select('club_type, carry_distance, total_distance, ball_speed_mph, club_speed_mph, launch_angle, back_spin_rpm, smash_factor, offline_distance')
    .eq('user_id', userId)

  if (!shots || shots.length === 0) return

  // 클럽별로 그룹화
  const clubGroups: Record<string, typeof shots> = {}
  shots.forEach((shot: any) => {
    if (!clubGroups[shot.club_type]) {
      clubGroups[shot.club_type] = []
    }
    clubGroups[shot.club_type].push(shot)
  })

  // 각 클럽별 통계 계산 및 저장
  for (const [clubType, clubShots] of Object.entries(clubGroups)) {
    const validCarry = clubShots.filter((s: any) => s.carry_distance)
    const validBallSpeed = clubShots.filter((s: any) => s.ball_speed_mph)
    const validClubSpeed = clubShots.filter((s: any) => s.club_speed_mph)
    const validLaunch = clubShots.filter((s: any) => s.launch_angle)
    const validSpin = clubShots.filter((s: any) => s.back_spin_rpm)
    const validSmash = clubShots.filter((s: any) => s.smash_factor)
    const validOffline = clubShots.filter((s: any) => s.offline_distance !== null)

    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null
    const stdDev = (arr: number[]) => {
      if (arr.length < 2) return null
      const mean = avg(arr)!
      return Math.sqrt(arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length)
    }

    const carries = validCarry.map((s: any) => s.carry_distance)

    const stats = {
      user_id: userId,
      club_type: clubType,
      total_shots: clubShots.length,
      avg_carry: avg(carries),
      avg_total: avg(clubShots.filter((s: any) => s.total_distance).map((s: any) => s.total_distance!)),
      avg_ball_speed: avg(validBallSpeed.map((s: any) => s.ball_speed_mph!)),
      avg_club_speed: avg(validClubSpeed.map((s: any) => s.club_speed_mph!)),
      avg_launch_angle: avg(validLaunch.map((s: any) => s.launch_angle!)),
      avg_back_spin: validSpin.length > 0 ? Math.round(avg(validSpin.map((s: any) => s.back_spin_rpm!))!) : null,
      avg_smash_factor: avg(validSmash.map((s: any) => s.smash_factor!)),
      carry_std_dev: stdDev(carries),
      offline_std_dev: stdDev(validOffline.map((s: any) => s.offline_distance!)),
      max_carry: validCarry.length > 0 ? Math.max(...carries) : null,
      max_ball_speed: validBallSpeed.length > 0 ? Math.max(...validBallSpeed.map((s: any) => s.ball_speed_mph!)) : null,
      last_updated: new Date().toISOString(),
    }

    await (supabase as any)
      .from('club_statistics')
      .upsert(stats, { onConflict: 'user_id,club_type' })
  }
}
