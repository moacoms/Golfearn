import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckout, getVariantId } from '@/lib/lemonsqueezy'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan, billing, locale } = body as {
      plan: string
      billing: string
      locale: string
    }

    if (!['basic', 'pro'].includes(plan) || !['monthly', 'annual'].includes(billing)) {
      return NextResponse.json({ error: 'Invalid plan or billing period' }, { status: 400 })
    }

    const variantId = getVariantId(plan, billing)
    if (!variantId) {
      return NextResponse.json(
        { error: 'Variant not configured. Please set environment variables.' },
        { status: 500 }
      )
    }

    const checkoutUrl = await createCheckout({
      variantId,
      userId: user.id,
      userEmail: user.email || '',
      locale: locale || 'en',
    })

    return NextResponse.json({ checkoutUrl })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
