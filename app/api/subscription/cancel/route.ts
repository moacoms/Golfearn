import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cancelSubscription } from '@/lib/lemonsqueezy'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscriptionId } = await request.json()
    if (!subscriptionId) {
      return NextResponse.json({ error: 'Missing subscriptionId' }, { status: 400 })
    }

    // Verify the subscription belongs to this user
    const { data: sub } = await supabase
      .from('subscriptions' as any)
      .select('lemon_squeezy_subscription_id')
      .eq('user_id', user.id)
      .single()

    if (!sub || (sub as any).lemon_squeezy_subscription_id !== subscriptionId) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    await cancelSubscription(subscriptionId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
