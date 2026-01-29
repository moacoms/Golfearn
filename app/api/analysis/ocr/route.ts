import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface Subscription {
  plan_type: string
  monthly_ocr_count: number
  monthly_ocr_limit: number
}

interface ExtractedShot {
  clubType: string
  ballSpeed?: number
  clubSpeed?: number
  smashFactor?: number
  launchAngle?: number
  attackAngle?: number
  clubPath?: number
  faceAngle?: number
  spinRate?: number
  carry?: number
  total?: number
  offline?: number
}

function getOCRPrompt(launchMonitor: string, locale: string): string {
  const monitorHints: Record<string, string> = {
    trackman: 'TrackMan launch monitor. Look for metrics like Ball Speed, Club Speed, Launch Angle, Spin Rate, Carry, Total, Attack Angle, Club Path, Face Angle, Smash Factor.',
    golfzon: 'GolfZon simulator. Look for Korean/English labels like 볼스피드/Ball Speed, 클럽스피드/Club Speed, 발사각/Launch Angle, 스핀량/Spin, 캐리/Carry, 토탈/Total.',
    gdr: 'GDR (Golfzon Driving Range). Similar to GolfZon with Korean labels. Look for 비거리, 볼속도, 클럽속도, 발사각, 스핀량.',
    kakao: 'Kakao VX screen golf. Look for Korean metrics: 비거리, 볼스피드, 발사각, 스핀량, 캐리, 토탈.',
    flightscope: 'FlightScope launch monitor. Look for Ball Speed, Club Speed, Launch Angle, Spin Rate, Carry, Total, Smash Factor, Attack Angle, Club Path, Face Angle.',
    other: 'A golf launch monitor or simulator screen. Look for common golf metrics.',
  }

  const hint = monitorHints[launchMonitor] || monitorHints.other

  return `You are a golf launch monitor OCR expert. Extract shot data from this ${hint}

IMPORTANT RULES:
1. Extract ALL visible shots/rows of data from the image.
2. For each shot, identify the club type if visible (driver, 3wood, 5wood, hybrid, 5iron, 6iron, 7iron, 8iron, 9iron, pw, gw, sw, lw). If not identifiable, use "driver" as default.
3. Extract numeric values only. Do not guess values that are not visible.
4. Return data in the exact JSON format below.
5. If a metric is not visible or unclear, omit it (don't include the key).
6. For angles (launchAngle, attackAngle, clubPath, faceAngle), preserve the sign (positive/negative).
7. Pay attention to units - speeds may be in mph or m/s, distances in yards or meters.

Respond ONLY with valid JSON in this exact format:
{
  "shots": [
    {
      "clubType": "driver",
      "ballSpeed": 165.2,
      "clubSpeed": 110.5,
      "smashFactor": 1.50,
      "launchAngle": 12.5,
      "attackAngle": -1.5,
      "clubPath": 2.0,
      "faceAngle": 1.0,
      "spinRate": 2500,
      "carry": 245.0,
      "total": 265.0,
      "offline": 5.0
    }
  ],
  "units": {
    "speed": "mph",
    "distance": "yards"
  },
  "confidence": 0.95,
  "warnings": []
}

- "confidence" is 0.0-1.0 indicating how confident you are in the extraction.
- "warnings" is an array of strings for any issues (e.g., "Some values were partially obscured").
- "units.speed" should be "mph" or "ms" based on what the screen shows.
- "units.distance" should be "yards" or "meters" based on what the screen shows.
- If you cannot extract any data, return: {"shots": [], "confidence": 0, "warnings": ["Could not extract data from this image"]}

${locale === 'ko' ? 'Note: The screen may have Korean text. 한국어 화면일 수 있습니다.' : ''}`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { imageBase64, imageMimeType, launchMonitor, locale } = body

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // OCR quota check
    const { data: subscriptionData } = await (supabase as any)
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single() as { data: Subscription | null; error: unknown }

    const planType = subscriptionData?.plan_type || 'free'
    const ocrLimit = planType === 'free' ? 5 : planType === 'basic' ? 50 : -1
    const currentOcrCount = subscriptionData?.monthly_ocr_count || 0

    if (ocrLimit !== -1 && currentOcrCount >= ocrLimit) {
      return NextResponse.json(
        { error: 'OCR limit reached', code: 'OCR_LIMIT_REACHED' },
        { status: 403 }
      )
    }

    // Call Claude Vision API
    const ocrPrompt = getOCRPrompt(launchMonitor || 'other', locale || 'en')

    const mediaType = (imageMimeType || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: ocrPrompt,
            },
          ],
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse JSON response
    let extractedData: {
      shots: ExtractedShot[]
      units: { speed: string; distance: string }
      confidence: number
      warnings: string[]
    }

    try {
      // Extract JSON from response (handle possible markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      extractedData = JSON.parse(jsonMatch[0])
    } catch {
      console.error('Failed to parse OCR response:', responseText)
      return NextResponse.json(
        {
          shots: [],
          units: { speed: 'mph', distance: 'yards' },
          confidence: 0,
          warnings: ['Failed to parse extracted data. Please enter data manually.'],
        },
        { status: 200 }
      )
    }

    // Add IDs to shots
    const shotsWithIds = extractedData.shots.map((shot, index) => ({
      ...shot,
      id: `ocr-${Date.now()}-${index}`,
    }))

    // Update OCR usage count
    if (subscriptionData) {
      await (supabase as any)
        .from('subscriptions')
        .update({
          monthly_ocr_count: currentOcrCount + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    } else {
      await (supabase as any)
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: 'free',
          status: 'active',
          monthly_analysis_count: 0,
          monthly_analysis_limit: 3,
          monthly_ocr_count: 1,
          monthly_ocr_limit: 5,
        })
    }

    // Log usage
    await (supabase as any).from('usage_logs').insert({
      user_id: user.id,
      usage_type: 'ocr',
      tokens_used: (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0),
      success: extractedData.shots.length > 0,
    })

    return NextResponse.json({
      shots: shotsWithIds,
      units: extractedData.units || { speed: 'mph', distance: 'yards' },
      confidence: extractedData.confidence ?? 0.8,
      warnings: extractedData.warnings || [],
      tokensUsed: (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0),
    })
  } catch (error) {
    console.error('OCR error:', error)
    return NextResponse.json(
      { error: 'OCR failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
