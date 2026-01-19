'use server'

import { createClient } from '@/lib/supabase/server'
import type { GolfClubPriceHistory, ProductCondition, UsedPriceGuide } from '@/types/club'

// =============================================
// 시세 가이드
// =============================================

/**
 * 클럽 시세 가이드 조회
 */
export async function getClubPriceGuide(clubId: number): Promise<UsedPriceGuide | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('golf_clubs' as any)
    .select('used_price_guide, current_price, release_price')
    .eq('id', clubId)
    .single()

  if (error || !data) {
    return null
  }

  return (data as any).used_price_guide as UsedPriceGuide
}

/**
 * 클럽 시세 히스토리 조회
 */
export async function getClubPriceHistory(
  clubId: number,
  options?: { condition?: ProductCondition; limit?: number }
): Promise<GolfClubPriceHistory[]> {
  const supabase = await createClient()

  let query = (supabase as any)
    .from('golf_club_price_history')
    .select('*')
    .eq('club_id', clubId)
    .order('recorded_at', { ascending: false })

  if (options?.condition) {
    query = query.eq('condition', options.condition)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching price history:', error)
    return []
  }

  return data as GolfClubPriceHistory[]
}

/**
 * 조건별 평균 시세 조회
 */
export async function getAveragePriceByCondition(clubId: number): Promise<Record<ProductCondition, { avg: number; count: number }>> {
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('golf_club_price_history')
    .select('condition, price')
    .eq('club_id', clubId)

  if (error || !data || data.length === 0) {
    return {
      S: { avg: 0, count: 0 },
      A: { avg: 0, count: 0 },
      B: { avg: 0, count: 0 },
      C: { avg: 0, count: 0 },
    }
  }

  const result: Record<ProductCondition, { prices: number[]; avg: number; count: number }> = {
    S: { prices: [], avg: 0, count: 0 },
    A: { prices: [], avg: 0, count: 0 },
    B: { prices: [], avg: 0, count: 0 },
    C: { prices: [], avg: 0, count: 0 },
  }

  ;(data as any[]).forEach((item: any) => {
    const condition = item.condition as ProductCondition
    if (result[condition]) {
      result[condition].prices.push(item.price)
    }
  })

  // 평균 계산
  Object.keys(result).forEach(key => {
    const condition = key as ProductCondition
    const prices = result[condition].prices
    result[condition].count = prices.length
    result[condition].avg = prices.length > 0
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : 0
  })

  return {
    S: { avg: result.S.avg, count: result.S.count },
    A: { avg: result.A.avg, count: result.A.count },
    B: { avg: result.B.avg, count: result.B.count },
    C: { avg: result.C.avg, count: result.C.count },
  }
}

/**
 * 시세 추이 조회 (월별)
 */
export async function getPriceTrend(
  clubId: number,
  months = 6
): Promise<{ month: string; avgPrice: number; count: number }[]> {
  const supabase = await createClient()

  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  const { data, error } = await (supabase as any)
    .from('golf_club_price_history')
    .select('price, recorded_at')
    .eq('club_id', clubId)
    .gte('recorded_at', startDate.toISOString())
    .order('recorded_at', { ascending: true })

  if (error || !data) {
    return []
  }

  // 월별 그룹핑
  const monthlyData: Record<string, number[]> = {}

  ;(data as any[]).forEach((item: any) => {
    const date = new Date(item.recorded_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = []
    }
    monthlyData[monthKey].push(item.price)
  })

  return Object.entries(monthlyData).map(([month, prices]) => ({
    month,
    avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    count: prices.length,
  }))
}

/**
 * 최근 거래 가격 조회
 */
export async function getRecentSalePrices(
  clubId: number,
  limit = 5
): Promise<{ price: number; condition: ProductCondition; date: string }[]> {
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('golf_club_price_history')
    .select('price, condition, recorded_at')
    .eq('club_id', clubId)
    .eq('source', 'golfearn')
    .order('recorded_at', { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return (data as any[]).map((item: any) => ({
    price: item.price,
    condition: item.condition as ProductCondition,
    date: item.recorded_at,
  }))
}

/**
 * 시세 대비 가격 평가
 */
export async function evaluatePrice(
  clubId: number,
  price: number,
  condition: ProductCondition
): Promise<{
  evaluation: 'great' | 'good' | 'fair' | 'high'
  avgPrice: number
  difference: number
  percentDiff: number
}> {
  const priceGuide = await getClubPriceGuide(clubId)

  if (!priceGuide || !priceGuide[condition]) {
    return {
      evaluation: 'fair',
      avgPrice: 0,
      difference: 0,
      percentDiff: 0,
    }
  }

  const avgPrice = priceGuide[condition] as number
  const difference = price - avgPrice
  const percentDiff = Math.round((difference / avgPrice) * 100)

  let evaluation: 'great' | 'good' | 'fair' | 'high'

  if (percentDiff <= -20) {
    evaluation = 'great'
  } else if (percentDiff <= -5) {
    evaluation = 'good'
  } else if (percentDiff <= 10) {
    evaluation = 'fair'
  } else {
    evaluation = 'high'
  }

  return {
    evaluation,
    avgPrice,
    difference,
    percentDiff,
  }
}

// =============================================
// Golfearn 거래 기반 시세 업데이트
// =============================================

/**
 * 거래 완료 시 시세 기록 (트리거로 자동 호출되지만 수동으로도 가능)
 */
export async function recordSalePrice(
  clubId: number,
  price: number,
  condition: ProductCondition,
  productId?: number
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('golf_club_price_history')
    .insert({
      club_id: clubId,
      condition,
      price,
      source: 'golfearn',
      source_id: productId?.toString(),
    })

  if (error) {
    console.error('Error recording sale price:', error)
    return { error: '시세 기록에 실패했습니다.' }
  }

  return { success: true }
}

// =============================================
// 시세 비교
// =============================================

/**
 * 비슷한 클럽들의 시세 비교
 */
export async function comparePrices(
  clubId: number
): Promise<{
  club: { id: number; name: string; price: number }
  similar: { id: number; name: string; price: number }[]
}> {
  const supabase = await createClient()

  // 현재 클럽 조회
  const { data: club, error: clubError } = await (supabase as any)
    .from('golf_clubs')
    .select('id, name, name_ko, current_price, club_type, brand_id')
    .eq('id', clubId)
    .single()

  if (clubError || !club) {
    return {
      club: { id: 0, name: '', price: 0 },
      similar: [],
    }
  }

  // 같은 타입의 다른 클럽들 조회
  const { data: similar, error: similarError } = await (supabase as any)
    .from('golf_clubs')
    .select('id, name, name_ko, current_price')
    .eq('club_type', club.club_type)
    .neq('id', clubId)
    .eq('is_active', true)
    .not('current_price', 'is', null)
    .order('current_price', { ascending: true })
    .limit(5)

  if (similarError) {
    return {
      club: {
        id: club.id,
        name: club.name_ko || club.name,
        price: club.current_price || 0,
      },
      similar: [],
    }
  }

  return {
    club: {
      id: club.id,
      name: club.name_ko || club.name,
      price: club.current_price || 0,
    },
    similar: ((similar || []) as any[]).map((s: any) => ({
      id: s.id,
      name: s.name_ko || s.name,
      price: s.current_price || 0,
    })),
  }
}
