import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCustomerPortalUrl } from '@/lib/lemonsqueezy'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { customerId } = await request.json()
    if (!customerId) {
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 })
    }

    // Verify the customer belongs to this user
    const { data: sub } = await supabase
      .from('subscriptions' as any)
      .select('lemon_squeezy_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!sub || (sub as any).lemon_squeezy_customer_id !== customerId) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const portalUrl = await getCustomerPortalUrl(customerId)

    return NextResponse.json({ portalUrl })
  } catch (error) {
    console.error('Portal URL error:', error)
    return NextResponse.json({ error: 'Failed to get portal URL' }, { status: 500 })
  }
}
