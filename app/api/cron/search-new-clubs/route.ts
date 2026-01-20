import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase 클라이언트 (서비스 롤 키 사용)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Anthropic API (Claude)
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

// 검색할 브랜드 목록
const BRANDS = [
  'TaylorMade',
  'Callaway',
  'Titleist',
  'PING',
  'Mizuno',
  'Srixon',
  'Cobra',
  'Cleveland',
]

// 클럽 타입
const CLUB_TYPES = ['driver', 'iron', 'wood', 'hybrid', 'wedge', 'putter']

export async function GET(request: NextRequest) {
  // Cron 시크릿 확인 (Vercel Cron 보안)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // 개발 환경에서는 허용
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const startTime = Date.now()
  let logId: number | null = null

  try {
    // 검색 로그 시작
    const { data: logData } = await supabase
      .from('club_search_logs')
      .insert({
        search_type: 'scheduled',
        search_query: 'New golf clubs 2025-2026',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    logId = logData?.id

    // AI로 새 클럽 정보 검색
    const newClubs = await searchNewClubsWithAI()

    // 기존 클럽과 중복 체크
    const uniqueClubs = await filterExistingClubs(newClubs)

    // pending_clubs에 저장
    let addedCount = 0
    for (const club of uniqueClubs) {
      const { error } = await supabase.from('pending_clubs').insert(club)
      if (!error) addedCount++
    }

    // 검색 로그 완료
    const duration = Date.now() - startTime
    if (logId) {
      await supabase
        .from('club_search_logs')
        .update({
          clubs_found: newClubs.length,
          clubs_added: addedCount,
          completed_at: new Date().toISOString(),
          duration_ms: duration,
        })
        .eq('id', logId)
    }

    // 관리자 알림 생성 (새 클럽이 있는 경우)
    if (addedCount > 0) {
      await supabase.from('admin_notifications').insert({
        type: 'new_pending_club',
        title: `새로운 클럽 ${addedCount}개 발견`,
        message: `AI가 ${addedCount}개의 새로운 클럽을 발견했습니다. 검토가 필요합니다.`,
        related_table: 'pending_clubs',
      })
    }

    return NextResponse.json({
      success: true,
      found: newClubs.length,
      added: addedCount,
      duration_ms: duration,
    })
  } catch (error: any) {
    console.error('Club search error:', error)

    // 에러 로그 업데이트
    if (logId) {
      await supabase
        .from('club_search_logs')
        .update({
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
          error_message: error.message,
        })
        .eq('id', logId)
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// AI를 사용한 새 클럽 검색
async function searchNewClubsWithAI(): Promise<any[]> {
  if (!ANTHROPIC_API_KEY) {
    console.log('ANTHROPIC_API_KEY not set, using mock data')
    return getMockNewClubs()
  }

  try {
    const currentYear = new Date().getFullYear()
    const prompt = `You are a golf equipment expert. Search for NEW golf clubs released in ${currentYear} and ${currentYear + 1} from major brands: ${BRANDS.join(', ')}.

For each new club, provide the following information in JSON format:
{
  "brand_name": "brand name",
  "club_name": "club model name in English",
  "club_name_ko": "Korean name if known",
  "model_year": ${currentYear},
  "club_type": "driver|iron|wood|hybrid|wedge|putter",
  "release_price": price in KRW (number),
  "loft": "comma separated loft values",
  "shaft_flex": "comma separated flex options like SR,R,S",
  "shaft_material": "steel,graphite",
  "recommended_handicap_range": "min-max like 15-36",
  "recommended_swing_speed_range": "min-max like 85-105",
  "forgiveness_level": 1-5,
  "distance_level": 1-5,
  "control_level": 1-5,
  "feel_level": 1-5,
  "description": "brief description in Korean",
  "features": ["feature 1", "feature 2", "feature 3"],
  "source_url": "official product page URL if available"
}

Return ONLY a JSON array of clubs. Focus on clubs released in the past 6 months. Maximum 10 clubs.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content[0]?.text

    // JSON 추출
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.log('No JSON found in response')
      return []
    }

    const clubs = JSON.parse(jsonMatch[0])

    // 메타데이터 추가
    return clubs.map((club: any) => ({
      ...club,
      ai_confidence: 0.75, // Haiku 모델 기본 신뢰도
      ai_model: 'claude-3-haiku-20240307',
      raw_data: club,
      status: 'pending',
    }))
  } catch (error) {
    console.error('AI search error:', error)
    return getMockNewClubs()
  }
}

// 기존 클럽과 중복 체크
async function filterExistingClubs(clubs: any[]): Promise<any[]> {
  const uniqueClubs: any[] = []

  for (const club of clubs) {
    // golf_clubs에서 중복 체크
    const { data: existing } = await supabase
      .from('golf_clubs')
      .select('id')
      .ilike('name', club.club_name)
      .limit(1)

    if (existing && existing.length > 0) continue

    // pending_clubs에서 중복 체크
    const { data: pending } = await supabase
      .from('pending_clubs')
      .select('id')
      .eq('club_name', club.club_name)
      .eq('brand_name', club.brand_name)
      .limit(1)

    if (pending && pending.length > 0) continue

    uniqueClubs.push(club)
  }

  return uniqueClubs
}

// Mock 데이터 (API 키 없을 때 테스트용)
function getMockNewClubs(): any[] {
  return [
    {
      brand_name: 'TaylorMade',
      club_name: 'Qi35 Max',
      club_name_ko: 'Qi35 맥스',
      model_year: 2026,
      club_type: 'driver',
      release_price: 899000,
      loft: '9.0, 10.5, 12.0',
      shaft_flex: 'SR,R,S',
      shaft_material: 'graphite',
      recommended_handicap_range: '15-36',
      recommended_swing_speed_range: '80-100',
      forgiveness_level: 5,
      distance_level: 5,
      control_level: 3,
      feel_level: 4,
      description: '2026년 신형 Qi35 시리즈의 최대 관용성 모델. AI 설계 페이스와 새로운 카본 구조.',
      features: ['AI 설계 페이스', '카본 크라운 2.0', '최대 MOI', 'Speed Pocket 플러스'],
      source_url: 'https://www.taylormadegolf.com',
      ai_confidence: 0.6,
      ai_model: 'mock',
      status: 'pending',
    },
    {
      brand_name: 'Callaway',
      club_name: 'Paradym X2',
      club_name_ko: '패러다임 X2',
      model_year: 2026,
      club_type: 'iron',
      release_price: 1499000,
      loft: '21.0, 24.0, 27.0, 31.0, 36.0, 41.0, 46.0',
      shaft_flex: 'SR,R,S',
      shaft_material: 'steel,graphite',
      recommended_handicap_range: '15-36',
      recommended_swing_speed_range: '75-95',
      forgiveness_level: 5,
      distance_level: 5,
      control_level: 3,
      feel_level: 4,
      description: '2세대 AI Smoke 기술을 적용한 최대 관용성 아이언.',
      features: ['AI Smoke 2.0 페이스', '텅스텐 웨이팅', '광폭 솔', 'Speed Frame'],
      source_url: 'https://www.callawaygolf.com',
      ai_confidence: 0.6,
      ai_model: 'mock',
      status: 'pending',
    },
  ]
}

// POST 요청도 지원 (수동 실행)
export async function POST(request: NextRequest) {
  return GET(request)
}
