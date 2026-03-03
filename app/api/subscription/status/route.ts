import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface DailyLimitResult {
  can_analyze: boolean
  remaining_today: number
  plan_type: string
  is_unlimited: boolean
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 일일 분석 제한 체크 (PostgreSQL 함수 호출)
    const { data: limitData, error: limitError } = await (supabase as any)
      .rpc('check_daily_analysis_limit', { p_user_id: user.id })
      .single() as { data: DailyLimitResult | null, error: unknown }

    if (limitError) {
      // 함수가 없을 경우 fallback: subscriptions 테이블 직접 조회
      const { data: subscription } = await (supabase as any)
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!subscription) {
        // 구독 레코드가 없으면 생성
        await (supabase as any)
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan_type: 'free',
            status: 'active',
            monthly_analysis_limit: 30,
            monthly_ocr_limit: 5,
            daily_analysis_count: 0,
            last_analysis_date: null,
          })

        return NextResponse.json({
          canAnalyze: true,
          remainingToday: 1,
          planType: 'free',
          isUnlimited: false,
          dailyLimit: 1,
        })
      }

      // 날짜 체크 - 오늘과 last_analysis_date 비교
      const today = new Date().toISOString().split('T')[0]
      const lastDate = subscription.last_analysis_date

      let dailyCount = subscription.daily_analysis_count || 0
      if (!lastDate || lastDate < today) {
        dailyCount = 0
      }

      const isUnlimited = subscription.monthly_analysis_limit === -1
      const canAnalyze = isUnlimited || dailyCount < 1
      const remainingToday = isUnlimited ? -1 : Math.max(0, 1 - dailyCount)

      return NextResponse.json({
        canAnalyze,
        remainingToday,
        planType: subscription.plan_type,
        isUnlimited,
        dailyLimit: isUnlimited ? -1 : 1,
      })
    }

    if (!limitData) {
      return NextResponse.json({
        canAnalyze: true,
        remainingToday: 1,
        planType: 'free',
        isUnlimited: false,
        dailyLimit: 1,
      })
    }

    return NextResponse.json({
      canAnalyze: limitData.can_analyze,
      remainingToday: limitData.remaining_today,
      planType: limitData.plan_type,
      isUnlimited: limitData.is_unlimited,
      dailyLimit: limitData.is_unlimited ? -1 : 1,
    })

  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}
