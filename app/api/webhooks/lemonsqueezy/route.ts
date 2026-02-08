import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { getPlanFromVariantId, getPlanLimits } from '@/lib/lemonsqueezy'

// Use service role client for webhook operations (no user session)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
  if (!secret) return false

  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(rawBody).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

interface LemonSqueezyWebhookEvent {
  meta: {
    event_name: string
    custom_data?: {
      user_id?: string
    }
  }
  data: {
    id: string
    type: string
    attributes: {
      store_id: number
      customer_id: number
      order_id: number
      variant_id: number
      status: string
      cancelled: boolean
      renews_at: string | null
      ends_at: string | null
      created_at: string
      updated_at: string
      first_subscription_item?: {
        price_id: number
      }
    }
  }
}

async function upsertSubscription(
  userId: string,
  event: LemonSqueezyWebhookEvent,
  planType: string,
  status: string,
) {
  const supabase = getServiceClient()
  const attrs = event.data.attributes
  const limits = getPlanLimits(planType)

  const { error } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        lemon_squeezy_customer_id: String(attrs.customer_id),
        lemon_squeezy_subscription_id: String(event.data.id),
        lemon_squeezy_order_id: String(attrs.order_id),
        plan_type: planType,
        status,
        current_period_end: attrs.renews_at || attrs.ends_at,
        monthly_analysis_limit: limits.monthly_analysis_limit,
        monthly_ocr_limit: limits.monthly_ocr_limit,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('Failed to upsert subscription:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-signature')

    if (!signature || !verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event: LemonSqueezyWebhookEvent = JSON.parse(rawBody)
    const eventName = event.meta.event_name
    const userId = event.meta.custom_data?.user_id

    if (!userId) {
      console.error('Webhook missing user_id in custom_data')
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    const variantId = String(event.data.attributes.variant_id)
    const planInfo = getPlanFromVariantId(variantId)
    const planType = planInfo?.plan || 'free'

    switch (eventName) {
      case 'subscription_created': {
        await upsertSubscription(userId, event, planType, 'active')
        break
      }

      case 'subscription_updated': {
        const status = event.data.attributes.cancelled ? 'cancelled' : 'active'
        await upsertSubscription(userId, event, planType, status)
        break
      }

      case 'subscription_cancelled': {
        const supabase = getServiceClient()
        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
        break
      }

      case 'subscription_resumed': {
        const supabase = getServiceClient()
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            cancelled_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
        break
      }

      case 'subscription_expired': {
        const freeLimits = getPlanLimits('free')
        const supabase = getServiceClient()
        await supabase
          .from('subscriptions')
          .update({
            status: 'expired',
            plan_type: 'free',
            monthly_analysis_limit: freeLimits.monthly_analysis_limit,
            monthly_ocr_limit: freeLimits.monthly_ocr_limit,
            lemon_squeezy_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
        break
      }

      case 'subscription_payment_failed': {
        const supabase = getServiceClient()
        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
        break
      }

      default:
        console.log(`Unhandled webhook event: ${eventName}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
