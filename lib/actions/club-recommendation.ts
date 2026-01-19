'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  GolfClubWithBrand,
  ClubRecommendationInput,
  ClubRecommendation,
  UserClubProfile,
  ClubType,
  MissTendency,
  ShaftFlex,
  ShaftMaterial,
} from '@/types/club'

// =============================================
// AI 추천 알고리즘
// =============================================

/**
 * 실력 레벨 추정 (타수 기반)
 */
function estimateSkillLevel(averageScore?: number, handicap?: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  const score = averageScore || (handicap ? handicap + 72 : 100)

  if (score >= 100) return 'beginner'
  if (score >= 90) return 'intermediate'
  if (score >= 80) return 'advanced'
  return 'expert'
}

/**
 * 스윙 스피드 추정 (없는 경우)
 */
function estimateSwingSpeed(height?: number, skillLevel?: string): number {
  // 기본값: 90mph
  let base = 90

  // 키에 따른 조정
  if (height) {
    if (height >= 185) base += 5
    else if (height >= 175) base += 2
    else if (height < 165) base -= 5
    else if (height < 170) base -= 2
  }

  // 실력에 따른 조정
  switch (skillLevel) {
    case 'beginner':
      base -= 10
      break
    case 'intermediate':
      base -= 5
      break
    case 'advanced':
      base += 0
      break
    case 'expert':
      base += 10
      break
  }

  return Math.max(60, Math.min(130, base))
}

/**
 * 핸디캡 범위 체크
 */
function checkHandicapRange(
  skillLevel: string,
  minHandicap: number | null,
  maxHandicap: number | null
): boolean {
  if (minHandicap === null && maxHandicap === null) return true

  const handicapRanges: Record<string, [number, number]> = {
    beginner: [28, 50],
    intermediate: [18, 28],
    advanced: [8, 18],
    expert: [0, 8],
  }

  const [min, max] = handicapRanges[skillLevel] || [0, 50]

  if (minHandicap !== null && max < minHandicap) return false
  if (maxHandicap !== null && min > maxHandicap) return false

  return true
}

/**
 * 스윙 스피드 범위 체크
 */
function checkSwingSpeedRange(
  swingSpeed: number,
  minSpeed: number | null,
  maxSpeed: number | null
): boolean {
  if (minSpeed === null && maxSpeed === null) return true
  if (minSpeed !== null && swingSpeed < minSpeed) return false
  if (maxSpeed !== null && swingSpeed > maxSpeed) return false
  return true
}

/**
 * 키 범위 체크
 */
function checkHeightRange(
  height: number | undefined,
  minHeight: number | null,
  maxHeight: number | null
): boolean {
  if (!height) return true
  if (minHeight === null && maxHeight === null) return true
  if (minHeight !== null && height < minHeight) return false
  if (maxHeight !== null && height > maxHeight) return false
  return true
}

/**
 * 미스샷 보정 점수
 */
function calculateMissTendencyScore(
  userMiss: MissTendency[] | undefined,
  clubFix: MissTendency[] | null
): number {
  if (!userMiss || userMiss.length === 0 || !clubFix || clubFix.length === 0) {
    return 0
  }

  // 사용자의 미스 성향과 클럽의 보정 기능이 일치하는 개수
  const matches = userMiss.filter(m => clubFix.includes(m)).length
  return matches * 15 // 매칭당 15점
}

/**
 * 추천 점수 계산
 */
function calculateRecommendationScore(
  club: GolfClubWithBrand,
  input: ClubRecommendationInput,
  skillLevel: string,
  swingSpeed: number
): { score: number; reasons: string[]; matchDetails: ClubRecommendation['match_details'] } {
  let score = 0
  const reasons: string[] = []
  const matchDetails = {
    skill_match: 0,
    spec_match: 0,
    budget_match: 0,
    preference_match: 0,
  }

  // 1. 실력 매칭 (최대 30점)
  const handicapMatch = checkHandicapRange(
    skillLevel,
    club.recommended_handicap_min,
    club.recommended_handicap_max
  )
  if (handicapMatch) {
    matchDetails.skill_match += 20
    score += 20
    reasons.push('실력 수준에 적합합니다')
  }

  const speedMatch = checkSwingSpeedRange(
    swingSpeed,
    club.recommended_swing_speed_min,
    club.recommended_swing_speed_max
  )
  if (speedMatch) {
    matchDetails.skill_match += 10
    score += 10
    reasons.push('스윙 스피드에 맞는 샤프트입니다')
  }

  // 2. 스펙 매칭 (최대 25점)
  const heightMatch = checkHeightRange(
    input.height,
    club.recommended_height_min,
    club.recommended_height_max
  )
  if (heightMatch && input.height) {
    matchDetails.spec_match += 10
    score += 10
    reasons.push('체형에 적합한 스펙입니다')
  }

  // 관용성 점수 (골린이에게 높은 관용성 추천)
  if (skillLevel === 'beginner' || skillLevel === 'intermediate') {
    if (club.forgiveness_level >= 4) {
      matchDetails.spec_match += 15
      score += 15
      reasons.push('높은 관용성으로 미스샷에 강합니다')
    } else if (club.forgiveness_level >= 3) {
      matchDetails.spec_match += 10
      score += 10
    }
  }

  // 3. 예산 매칭 (최대 20점)
  if (input.budget && club.current_price) {
    if (club.current_price <= input.budget) {
      const budgetRatio = club.current_price / input.budget
      if (budgetRatio <= 0.5) {
        matchDetails.budget_match += 20
        score += 20
        reasons.push('예산 대비 가성비가 좋습니다')
      } else if (budgetRatio <= 0.8) {
        matchDetails.budget_match += 15
        score += 15
        reasons.push('예산 내에서 선택 가능합니다')
      } else {
        matchDetails.budget_match += 10
        score += 10
      }
    } else if (club.current_price <= input.budget * 1.2) {
      matchDetails.budget_match += 5
      score += 5
      reasons.push('예산보다 약간 높지만 고려해볼만 합니다')
    }
  } else {
    // 예산 정보 없으면 기본 점수
    matchDetails.budget_match += 10
    score += 10
  }

  // 4. 선호도 매칭 (최대 25점)
  // 평점 반영
  if (club.rating >= 4.5) {
    matchDetails.preference_match += 10
    score += 10
    reasons.push(`사용자 평점 ${club.rating}점으로 높은 만족도`)
  } else if (club.rating >= 4.0) {
    matchDetails.preference_match += 7
    score += 7
  } else if (club.rating >= 3.5) {
    matchDetails.preference_match += 5
    score += 5
  }

  // 미스샷 보정
  const missScore = calculateMissTendencyScore(input.miss_tendency, club.miss_tendency_fix)
  if (missScore > 0) {
    matchDetails.preference_match += Math.min(missScore, 15)
    score += Math.min(missScore, 15)

    if (input.miss_tendency?.includes('slice') && club.miss_tendency_fix?.includes('slice')) {
      reasons.push('슬라이스 보정에 도움이 됩니다')
    }
    if (input.miss_tendency?.includes('hook') && club.miss_tendency_fix?.includes('hook')) {
      reasons.push('훅 보정에 도움이 됩니다')
    }
  }

  // 피처드 클럽 보너스
  if (club.is_featured) {
    score += 5
    reasons.push('에디터 추천 모델입니다')
  }

  // 점수 정규화 (0-100)
  score = Math.min(100, Math.max(0, score))

  return { score, reasons, matchDetails }
}

/**
 * AI 클럽 추천
 */
export async function getClubRecommendations(
  input: ClubRecommendationInput
): Promise<Record<ClubType, ClubRecommendation[]>> {
  const supabase = await createClient()

  // 실력 레벨 및 스윙 스피드 추정
  const skillLevel = estimateSkillLevel(input.average_score, input.handicap)
  const swingSpeed = input.swing_speed || estimateSwingSpeed(input.height, skillLevel)

  // 클럽 타입 목록
  const clubTypes: ClubType[] = input.club_type
    ? [input.club_type]
    : ['driver', 'iron', 'hybrid', 'wedge', 'putter']

  const results: Record<ClubType, ClubRecommendation[]> = {
    driver: [],
    wood: [],
    hybrid: [],
    iron: [],
    wedge: [],
    putter: [],
  }

  for (const clubType of clubTypes) {
    // 해당 타입의 클럽 조회
    const { data: clubs, error } = await supabase
      .from('golf_clubs')
      .select(`
        *,
        brand:golf_club_brands(*)
      `)
      .eq('is_active', true)
      .eq('club_type', clubType)

    if (error || !clubs) {
      console.error('Error fetching clubs:', error)
      continue
    }

    // 각 클럽에 대해 추천 점수 계산
    const recommendations: ClubRecommendation[] = (clubs as GolfClubWithBrand[])
      .map(club => {
        const { score, reasons, matchDetails } = calculateRecommendationScore(
          club,
          input,
          skillLevel,
          swingSpeed
        )
        return {
          club,
          score,
          reasons,
          match_details: matchDetails,
        }
      })
      .filter(r => r.score >= 30) // 최소 점수 필터
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // 상위 5개

    results[clubType] = recommendations
  }

  return results
}

/**
 * 빠른 추천 (간단한 입력으로)
 */
export async function getQuickRecommendation(
  averageScore: number,
  budget?: number
): Promise<ClubRecommendation[]> {
  const input: ClubRecommendationInput = {
    average_score: averageScore,
    budget,
  }

  const results = await getClubRecommendations(input)

  // 드라이버 + 아이언 추천
  return [
    ...results.driver.slice(0, 2),
    ...results.iron.slice(0, 2),
    ...results.hybrid.slice(0, 1),
  ]
}

// =============================================
// 사용자 프로필 관리
// =============================================

/**
 * 사용자 클럽 프로필 조회
 */
export async function getUserClubProfile(): Promise<UserClubProfile | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('user_club_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    return null
  }

  return data as UserClubProfile
}

/**
 * 사용자 클럽 프로필 저장/업데이트
 */
export async function saveUserClubProfile(formData: FormData): Promise<{
  error?: string
  data?: UserClubProfile
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const profileData: Partial<UserClubProfile> = {
    user_id: user.id,
    height: formData.get('height') ? parseInt(formData.get('height') as string) : null,
    arm_length: formData.get('arm_length') ? parseInt(formData.get('arm_length') as string) : null,
    handicap: formData.get('handicap') ? parseInt(formData.get('handicap') as string) : null,
    average_score: formData.get('average_score') ? parseInt(formData.get('average_score') as string) : null,
    swing_speed: formData.get('swing_speed') ? parseInt(formData.get('swing_speed') as string) : null,
    miss_tendency: formData.get('miss_tendency') ? JSON.parse(formData.get('miss_tendency') as string) : null,
    priority_factor: formData.get('priority_factor') ? JSON.parse(formData.get('priority_factor') as string) : null,
    preferred_shaft_flex: (formData.get('preferred_shaft_flex') as ShaftFlex) || null,
    preferred_shaft_material: (formData.get('preferred_shaft_material') as ShaftMaterial) || null,
    budget_driver: formData.get('budget_driver') ? parseInt(formData.get('budget_driver') as string) : null,
    budget_iron: formData.get('budget_iron') ? parseInt(formData.get('budget_iron') as string) : null,
    budget_putter: formData.get('budget_putter') ? parseInt(formData.get('budget_putter') as string) : null,
  }

  // 기존 프로필 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('user_club_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let result

  if (existing) {
    // 업데이트
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result = await (supabase as any)
      .from('user_club_profiles')
      .update({ ...profileData, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single()
  } else {
    // 새로 생성
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result = await (supabase as any)
      .from('user_club_profiles')
      .insert(profileData)
      .select()
      .single()
  }

  if (result.error) {
    console.error('Error saving club profile:', result.error)
    return { error: '프로필 저장에 실패했습니다.' }
  }

  revalidatePath('/club-recommend')
  return { data: result.data }
}

// =============================================
// 추천 기반 통계
// =============================================

/**
 * 비슷한 사용자들이 선택한 클럽
 */
export async function getSimilarUserChoices(
  averageScore: number,
  height?: number,
  clubType?: ClubType
): Promise<GolfClubWithBrand[]> {
  const supabase = await createClient()

  // 비슷한 핸디캡 범위의 사용자들이 작성한 리뷰에서
  // 높은 평점을 준 클럽을 찾음
  const scoreRange = 10

  let query = supabase
    .from('golf_club_reviews')
    .select(`
      club_id,
      rating,
      reviewer_handicap,
      golf_clubs (
        *,
        brand:golf_club_brands(*)
      )
    `)
    .gte('reviewer_handicap', (averageScore - 72) - scoreRange)
    .lte('reviewer_handicap', (averageScore - 72) + scoreRange)
    .gte('rating', 4)

  if (clubType) {
    query = query.eq('golf_clubs.club_type', clubType)
  }

  const { data, error } = await query.limit(20)

  if (error || !data) {
    return []
  }

  // 중복 제거 및 클럽 추출
  const clubMap = new Map<number, GolfClubWithBrand>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data.forEach((r: any) => {
    if (r.golf_clubs && !clubMap.has(r.club_id)) {
      clubMap.set(r.club_id, r.golf_clubs)
    }
  })

  return Array.from(clubMap.values()).slice(0, 5)
}
