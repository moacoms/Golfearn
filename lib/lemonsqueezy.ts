const LEMON_SQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1'

const VARIANT_IDS: Record<string, string | undefined> = {
  basic_monthly: process.env.LEMON_SQUEEZY_BASIC_MONTHLY_VARIANT_ID,
  basic_annual: process.env.LEMON_SQUEEZY_BASIC_ANNUAL_VARIANT_ID,
  pro_monthly: process.env.LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID,
  pro_annual: process.env.LEMON_SQUEEZY_PRO_ANNUAL_VARIANT_ID,
}

function getHeaders() {
  return {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
  }
}

export function getVariantId(plan: string, billing: string): string | undefined {
  return VARIANT_IDS[`${plan}_${billing}`]
}

export function getPlanFromVariantId(variantId: string): { plan: string; billing: string } | null {
  for (const [key, id] of Object.entries(VARIANT_IDS)) {
    if (id === variantId) {
      const [plan, billing] = key.split('_')
      return { plan, billing }
    }
  }
  return null
}

export function getPlanLimits(planType: string): {
  monthly_analysis_limit: number
  monthly_ocr_limit: number
} {
  switch (planType) {
    case 'basic':
      return { monthly_analysis_limit: -1, monthly_ocr_limit: 50 }
    case 'pro':
      return { monthly_analysis_limit: -1, monthly_ocr_limit: -1 }
    default:
      return { monthly_analysis_limit: 3, monthly_ocr_limit: 5 }
  }
}

export async function createCheckout({
  variantId,
  userId,
  userEmail,
  locale,
}: {
  variantId: string
  userId: string
  userEmail: string
  locale: string
}): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.golfearn.com'

  const res = await fetch(`${LEMON_SQUEEZY_API_URL}/checkouts`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: {
              user_id: userId,
            },
          },
          product_options: {
            redirect_url: `${siteUrl}/${locale}/checkout/success`,
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: process.env.LEMON_SQUEEZY_STORE_ID,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId,
            },
          },
        },
      },
    }),
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`Lemon Squeezy checkout creation failed: ${res.status} ${errorBody}`)
  }

  const data = await res.json()
  return data.data.attributes.url as string
}

export async function getSubscription(subscriptionId: string) {
  const res = await fetch(`${LEMON_SQUEEZY_API_URL}/subscriptions/${subscriptionId}`, {
    headers: getHeaders(),
  })

  if (!res.ok) {
    throw new Error(`Failed to get subscription: ${res.status}`)
  }

  const data = await res.json()
  return data.data
}

export async function cancelSubscription(subscriptionId: string) {
  const res = await fetch(`${LEMON_SQUEEZY_API_URL}/subscriptions/${subscriptionId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      data: {
        type: 'subscriptions',
        id: subscriptionId,
        attributes: {
          cancelled: true,
        },
      },
    }),
  })

  if (!res.ok) {
    throw new Error(`Failed to cancel subscription: ${res.status}`)
  }

  const data = await res.json()
  return data.data
}

export async function resumeSubscription(subscriptionId: string) {
  const res = await fetch(`${LEMON_SQUEEZY_API_URL}/subscriptions/${subscriptionId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      data: {
        type: 'subscriptions',
        id: subscriptionId,
        attributes: {
          cancelled: false,
        },
      },
    }),
  })

  if (!res.ok) {
    throw new Error(`Failed to resume subscription: ${res.status}`)
  }

  const data = await res.json()
  return data.data
}

export async function getCustomerPortalUrl(customerId: string): Promise<string> {
  const res = await fetch(`${LEMON_SQUEEZY_API_URL}/customers/${customerId}`, {
    headers: getHeaders(),
  })

  if (!res.ok) {
    throw new Error(`Failed to get customer: ${res.status}`)
  }

  const data = await res.json()
  return data.data.attributes.urls.customer_portal as string
}
