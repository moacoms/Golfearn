'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface SubscriptionData {
  plan_type: string
  status: string
  current_period_end: string | null
  cancelled_at: string | null
  monthly_analysis_count: number
  monthly_analysis_limit: number
  monthly_ocr_count: number
  monthly_ocr_limit: number
  lemon_squeezy_subscription_id: string | null
  lemon_squeezy_customer_id: string | null
}

export default function SubscriptionPage() {
  const t = useTranslations()
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string

  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    async function fetchSubscription() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/${locale}/login`)
        return
      }

      const { data } = await supabase
        .from('subscriptions' as any)
        .select('*')
        .eq('user_id', user.id)
        .single()

      setSubscription(data as SubscriptionData | null)
      setLoading(false)
    }
    fetchSubscription()
  }, [locale, router])

  async function handleCancel() {
    if (!subscription?.lemon_squeezy_subscription_id) return
    setCancelling(true)

    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.lemon_squeezy_subscription_id,
        }),
      })

      if (res.ok) {
        setSubscription(prev => prev ? { ...prev, status: 'cancelled', cancelled_at: new Date().toISOString() } : null)
        setShowCancelModal(false)
      }
    } catch (error) {
      console.error('Cancel failed:', error)
    } finally {
      setCancelling(false)
    }
  }

  async function handleManageBilling() {
    if (!subscription?.lemon_squeezy_customer_id) return

    try {
      const res = await fetch('/api/subscription/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: subscription.lemon_squeezy_customer_id,
        }),
      })

      if (res.ok) {
        const { portalUrl } = await res.json()
        window.open(portalUrl, '_blank')
      }
    } catch (error) {
      console.error('Portal error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    )
  }

  const plan = subscription?.plan_type || 'free'
  const status = subscription?.status || 'active'
  const isFree = plan === 'free'
  const isPaid = ['basic', 'pro'].includes(plan) && status === 'active'

  const analysisUsed = subscription?.monthly_analysis_count || 0
  const analysisLimit = subscription?.monthly_analysis_limit || 3
  const ocrUsed = subscription?.monthly_ocr_count || 0
  const ocrLimit = subscription?.monthly_ocr_limit || 5

  const isUnlimitedAnalysis = analysisLimit === -1
  const isUnlimitedOcr = ocrLimit === -1

  const planLabels: Record<string, string> = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    active: { label: locale === 'ko' ? '활성' : 'Active', color: 'bg-green-100 text-green-700' },
    cancelled: { label: locale === 'ko' ? '취소됨' : 'Cancelled', color: 'bg-yellow-100 text-yellow-700' },
    past_due: { label: locale === 'ko' ? '결제 지연' : 'Past Due', color: 'bg-red-100 text-red-700' },
    expired: { label: locale === 'ko' ? '만료됨' : 'Expired', color: 'bg-gray-100 text-gray-700' },
  }

  const statusInfo = statusLabels[status] || statusLabels.active

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          {t('subscription.title')}
        </h1>

        {/* Current Plan */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">{t('subscription.currentPlan')}</p>
              <p className="text-2xl font-bold text-gray-900">{planLabels[plan]}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          {subscription?.current_period_end && isPaid && (
            <p className="text-sm text-gray-500">
              {t('subscription.nextBilling')}: {new Date(subscription.current_period_end).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
            </p>
          )}

          {subscription?.cancelled_at && (
            <p className="text-sm text-yellow-600 mt-2">
              {locale === 'ko'
                ? '구독이 현재 기간 종료 후 해지됩니다.'
                : 'Your subscription will end at the current period.'}
            </p>
          )}
        </div>

        {/* Usage */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('subscription.usage')}</h2>

          <div className="space-y-4">
            {/* Analysis usage */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-gray-600">{t('subscription.analyses')}</span>
                <span className="text-gray-900 font-medium">
                  {isUnlimitedAnalysis
                    ? `${analysisUsed} / ${t('subscription.unlimited')}`
                    : `${analysisUsed} / ${analysisLimit}`}
                </span>
              </div>
              {!isUnlimitedAnalysis && (
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${Math.min((analysisUsed / analysisLimit) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* OCR usage */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-gray-600">{t('subscription.ocrScans')}</span>
                <span className="text-gray-900 font-medium">
                  {isUnlimitedOcr
                    ? `${ocrUsed} / ${t('subscription.unlimited')}`
                    : `${ocrUsed} / ${ocrLimit}`}
                </span>
              </div>
              {!isUnlimitedOcr && (
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${Math.min((ocrUsed / ocrLimit) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {isFree && (
            <Link
              href={`/${locale}/pricing`}
              className="block w-full py-3 rounded-xl bg-green-600 text-white text-center font-semibold hover:bg-green-700 transition"
            >
              {t('subscription.upgrade')}
            </Link>
          )}

          {isPaid && (
            <>
              <button
                onClick={handleManageBilling}
                className="block w-full py-3 rounded-xl bg-gray-100 text-gray-900 text-center font-semibold hover:bg-gray-200 transition"
              >
                {t('subscription.manage')}
              </button>

              <Link
                href={`/${locale}/pricing`}
                className="block w-full py-3 rounded-xl bg-gray-100 text-gray-900 text-center font-semibold hover:bg-gray-200 transition"
              >
                {t('subscription.changePlan')}
              </Link>

              {!subscription?.cancelled_at && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="block w-full py-3 rounded-xl text-red-600 text-center text-sm hover:bg-red-50 transition"
                >
                  {t('subscription.cancel')}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {t('subscription.cancelConfirm')}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {t('subscription.cancelDescription')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                {cancelling
                  ? (locale === 'ko' ? '처리 중...' : 'Processing...')
                  : t('subscription.confirmCancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
