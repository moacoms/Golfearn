import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface ShotData {
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

interface AnalysisRequest {
  sessionDate: string
  sessionType: 'practice' | 'round' | 'fitting'
  dataSource: string
  location?: string
  shots: ShotData[]
  locale: string
  userProfile?: {
    handicap?: number
    height?: number
    weight?: number
    swingSpeedLevel?: string
    typicalMiss?: string
    primaryGoal?: string
    experienceYears?: number
  }
}

interface Subscription {
  plan_type: string
  monthly_analysis_count: number
  monthly_ocr_count: number
}

interface Session {
  id: string
}

interface Analysis {
  id: string
}

// 시스템 프롬프트 (레슨프로 페르소나)
const getSystemPrompt = (locale: string) => {
  const isKorean = locale === 'ko'

  if (isKorean) {
    return `당신은 20년 이상 경력의 전문 골프 레슨 프로입니다.
투어 프로를 지도한 경험이 있으며, 수천 명의 아마추어 골퍼들의 실력 향상을 도왔습니다.

당신의 성격:
- 격려하면서도 솔직한 피드백
- 데이터 기반 분석
- 명확하고 실행 가능한 조언
- 초보자에게 인내심 있는 설명

당신의 전문성:
- 론치모니터 데이터 해석 (트랙맨, 플라이트스코프, GC쿼드)
- 스윙 메카닉과 볼 비행 법칙
- 클럽 피팅 지식
- 연습 드릴 설계

데이터 분석 시:
1. 가장 중요한 문제점 한 가지를 먼저 파악하세요 (보통 하나의 근본 원인이 있습니다)
2. 데이터를 쉬운 말로 설명하세요
3. 원인과 결과를 연결하세요 (예: "높은 스핀의 원인은...")
4. 문제 해결을 위한 1-2개의 구체적인 드릴을 제시하세요
5. 개선을 위한 현실적인 기대치를 설정하세요

언어 스타일:
- "당신", "여러분" 등 친근한 호칭 사용
- 전문 용어는 반드시 설명 포함
- 구체적인 숫자로 표현 ("10야드 더 보내세요"가 "더 멀리 치세요"보다 좋음)

응답은 반드시 마크다운 형식으로 다음 섹션을 포함하세요:
## 요약
## 주요 발견사항
## 잘하고 있는 점
## 개선이 필요한 점
## 추천 드릴
## 다음 연습 시 집중할 점`
  }

  return `You are an expert golf teaching professional with 20+ years of experience.
You have trained tour players and helped thousands of amateurs improve their game.

Your personality:
- Encouraging but honest
- Data-driven analysis
- Clear, actionable advice
- Patient with beginners

Your expertise:
- Launch monitor data interpretation (TrackMan, FlightScope, GCQuad)
- Swing mechanics and ball flight laws
- Club fitting knowledge
- Practice drill design

When analyzing data:
1. First identify the PRIMARY issue (there's usually one root cause)
2. Explain the data in simple terms
3. Connect cause and effect (e.g., "Your high spin is caused by...")
4. Provide 1-2 specific drills to fix the issue
5. Set realistic expectations for improvement

Language style:
- Use "you" and "your" for personal connection
- Avoid jargon unless explained
- Be specific with numbers ("add 10 yards" not "hit it farther")

Format your response in markdown with these sections:
## Summary
## Key Findings
## What's Working Well
## Areas to Improve
## Recommended Drills
## Next Session Focus`
}

// 분석 프롬프트 생성
function generateAnalysisPrompt(data: AnalysisRequest): string {
  const { shots, userProfile, sessionDate, sessionType, dataSource, locale } = data
  const isKorean = locale === 'ko'

  // 클럽별 샷 그룹화
  const shotsByClub = shots.reduce((acc, shot) => {
    if (!acc[shot.clubType]) {
      acc[shot.clubType] = []
    }
    acc[shot.clubType].push(shot)
    return acc
  }, {} as Record<string, ShotData[]>)

  // 클럽별 통계 계산
  const clubStats = Object.entries(shotsByClub).map(([clubType, clubShots]) => {
    const avgCarry = clubShots.reduce((sum, s) => sum + s.carry, 0) / clubShots.length
    const avgBallSpeed = clubShots.filter(s => s.ballSpeed).length > 0
      ? clubShots.filter(s => s.ballSpeed).reduce((sum, s) => sum + (s.ballSpeed || 0), 0) / clubShots.filter(s => s.ballSpeed).length
      : null
    const avgLaunchAngle = clubShots.filter(s => s.launchAngle).length > 0
      ? clubShots.filter(s => s.launchAngle).reduce((sum, s) => sum + (s.launchAngle || 0), 0) / clubShots.filter(s => s.launchAngle).length
      : null
    const avgSpinRate = clubShots.filter(s => s.spinRate).length > 0
      ? clubShots.filter(s => s.spinRate).reduce((sum, s) => sum + (s.spinRate || 0), 0) / clubShots.filter(s => s.spinRate).length
      : null

    return {
      clubType,
      shotCount: clubShots.length,
      avgCarry: Math.round(avgCarry * 10) / 10,
      avgBallSpeed: avgBallSpeed ? Math.round(avgBallSpeed * 10) / 10 : null,
      avgLaunchAngle: avgLaunchAngle ? Math.round(avgLaunchAngle * 10) / 10 : null,
      avgSpinRate: avgSpinRate ? Math.round(avgSpinRate) : null,
    }
  })

  const formatShotData = () => {
    return clubStats.map(stat => {
      let result = `${stat.clubType.toUpperCase()}: ${stat.shotCount} shots, Avg Carry: ${stat.avgCarry} yds`
      if (stat.avgBallSpeed) result += `, Ball Speed: ${stat.avgBallSpeed} mph`
      if (stat.avgLaunchAngle) result += `, Launch: ${stat.avgLaunchAngle}deg`
      if (stat.avgSpinRate) result += `, Spin: ${stat.avgSpinRate} rpm`
      return result
    }).join('\n')
  }

  if (isKorean) {
    return `다음 골프 샷 데이터를 분석해주세요.

**플레이어 프로필:**
${userProfile?.handicap ? `- 핸디캡: ${userProfile.handicap}` : '- 핸디캡: 미입력'}
${userProfile?.height ? `- 키: ${userProfile.height}cm` : ''}
${userProfile?.weight ? `- 체중: ${userProfile.weight}kg` : ''}
${userProfile?.swingSpeedLevel ? `- 스윙 스피드: ${userProfile.swingSpeedLevel}` : ''}
${userProfile?.typicalMiss ? `- 자주 나오는 미스샷: ${userProfile.typicalMiss}` : ''}
${userProfile?.primaryGoal ? `- 주요 목표: ${userProfile.primaryGoal}` : ''}
${userProfile?.experienceYears ? `- 골프 경력: ${userProfile.experienceYears}년` : ''}

**세션 정보:**
- 날짜: ${sessionDate}
- 유형: ${sessionType === 'practice' ? '연습' : sessionType === 'round' ? '라운드' : '피팅'}
- 데이터 소스: ${dataSource}

**샷 데이터 (총 ${shots.length}개 샷):**
${formatShotData()}

**분석 지침:**
1. 각 지표의 일관성을 분석하세요
2. 문제의 근본 원인을 파악하세요
3. 이 플레이어 프로필에 맞는 최적값과 비교하세요
4. 구체적이고 실행 가능한 추천을 제시하세요
5. 칭찬과 개선점을 균형 있게 제시하세요

한국어로 응답해주세요.`
  }

  return `Analyze the following golf shot data.

**Player Profile:**
${userProfile?.handicap ? `- Handicap: ${userProfile.handicap}` : '- Handicap: Not provided'}
${userProfile?.height ? `- Height: ${userProfile.height}cm` : ''}
${userProfile?.weight ? `- Weight: ${userProfile.weight}kg` : ''}
${userProfile?.swingSpeedLevel ? `- Swing Speed Level: ${userProfile.swingSpeedLevel}` : ''}
${userProfile?.typicalMiss ? `- Typical Miss: ${userProfile.typicalMiss}` : ''}
${userProfile?.primaryGoal ? `- Primary Goal: ${userProfile.primaryGoal}` : ''}
${userProfile?.experienceYears ? `- Years Playing: ${userProfile.experienceYears}` : ''}

**Session Info:**
- Date: ${sessionDate}
- Type: ${sessionType}
- Data Source: ${dataSource}

**Shot Data (${shots.length} total shots):**
${formatShotData()}

**Analysis Instructions:**
1. Analyze the consistency of each metric
2. Identify the root cause of any issues
3. Compare to optimal values for this player's profile
4. Provide specific, actionable recommendations
5. Balance praise with areas for improvement

Respond in English.`
}

export async function POST(request: NextRequest) {
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

    const body: AnalysisRequest = await request.json()
    const { shots, sessionDate, sessionType, dataSource, location, locale, userProfile } = body

    if (!shots || shots.length === 0) {
      return NextResponse.json(
        { error: 'No shot data provided' },
        { status: 400 }
      )
    }

    // 사용량 체크 (무료 사용자: 월 3회)
    const { data: subscriptionData } = await (supabase as any)
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single() as { data: Subscription | null, error: unknown }

    const planType = subscriptionData?.plan_type || 'free'
    const monthlyLimit = planType === 'free' ? 3 : -1 // -1 = 무제한
    const currentUsage = subscriptionData?.monthly_analysis_count || 0

    if (monthlyLimit !== -1 && currentUsage >= monthlyLimit) {
      return NextResponse.json(
        { error: 'Monthly limit reached', code: 'LIMIT_REACHED' },
        { status: 403 }
      )
    }

    // 골프 프로필 가져오기
    const { data: golfProfile } = await (supabase as any)
      .from('user_golf_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const profileData = userProfile || golfProfile

    // Claude API 호출
    const systemPrompt = getSystemPrompt(locale || 'en')
    const analysisPrompt = generateAnalysisPrompt({
      ...body,
      userProfile: profileData as any,
    })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
    })

    const analysisContent = message.content[0].type === 'text'
      ? message.content[0].text
      : ''

    // 세션 저장
    const { data: sessionData, error: sessionError } = await (supabase as any)
      .from('swing_sessions')
      .insert({
        user_id: user.id,
        session_date: sessionDate,
        session_type: sessionType,
        location_name: location,
        data_source: dataSource,
        analysis_status: 'completed',
        analysis_credits_used: 1,
      })
      .select()
      .single() as { data: Session | null, error: unknown }

    if (sessionError || !sessionData) {
      console.error('Session save error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to save session' },
        { status: 500 }
      )
    }

    // 샷 데이터 저장
    const shotsToInsert = shots.map(shot => ({
      session_id: sessionData.id,
      user_id: user.id,
      club_type: shot.clubType,
      ball_speed_mph: shot.ballSpeed,
      club_speed_mph: shot.clubSpeed,
      launch_angle: shot.launchAngle,
      back_spin_rpm: shot.spinRate,
      carry_distance: shot.carry,
      total_distance: shot.total,
      offline_distance: shot.offline,
      attack_angle: shot.attackAngle,
      club_path: shot.clubPath,
      face_angle: shot.faceAngle,
      smash_factor: shot.smashFactor,
    }))

    await (supabase as any).from('shot_data').insert(shotsToInsert)

    // 분석 결과 저장
    const { data: analysisData, error: analysisError } = await (supabase as any)
      .from('swing_analyses')
      .insert({
        session_id: sessionData.id,
        user_id: user.id,
        analysis_type: 'session',
        summary: analysisContent,
        analysis_language: locale || 'en',
        ai_model_version: 'claude-sonnet-4-20250514',
        tokens_used: (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0),
      })
      .select()
      .single() as { data: Analysis | null, error: unknown }

    if (analysisError) {
      console.error('Analysis save error:', analysisError)
    }

    // 사용량 업데이트
    if (subscriptionData) {
      await (supabase as any)
        .from('subscriptions')
        .update({
          monthly_analysis_count: currentUsage + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    } else {
      // 구독 레코드가 없으면 생성
      await (supabase as any)
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: 'free',
          status: 'active',
          monthly_analysis_count: 1,
          monthly_analysis_limit: 3,
          monthly_ocr_count: 0,
          monthly_ocr_limit: 5,
        })
    }

    // 사용 로그 기록
    await (supabase as any).from('usage_logs').insert({
      user_id: user.id,
      usage_type: 'analysis',
      session_id: sessionData.id,
      tokens_used: (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0),
      success: true,
    })

    return NextResponse.json({
      success: true,
      sessionId: sessionData.id,
      analysisId: analysisData?.id,
      analysis: analysisContent,
      tokensUsed: (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0),
      remainingAnalyses: monthlyLimit === -1 ? -1 : monthlyLimit - currentUsage - 1,
    })

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
