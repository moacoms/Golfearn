'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PricingPage() {
  const t = useTranslations()
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const [isAnnual, setIsAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email || undefined })
        const { data: sub } = await supabase
          .from('subscriptions' as any)
          .select('plan_type, status')
          .eq('user_id', authUser.id)
          .single()
        if (sub && (sub as any).status === 'active') {
          setCurrentPlan((sub as any).plan_type)
        }
      }
    }
    fetchUser()
  }, [])

  const handleCheckout = useCallback(async (plan: string) => {
    if (!user) {
      router.push(`/${locale}/login?redirect=/${locale}/pricing`)
      return
    }

    setCheckoutLoading(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          billing: isAnnual ? 'annual' : 'monthly',
          locale,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        console.error('Checkout error:', errData)
        return
      }

      const { checkoutUrl } = await res.json()
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setCheckoutLoading(null)
    }
  }, [user, isAnnual, locale, router])

  function getCtaText(planId: string): string {
    if (planId === 'free') return t('pricing.plans.free.cta')
    if (currentPlan === planId) return t('checkout.currentPlan')
    if (planId === 'basic' && currentPlan === 'pro') return t('checkout.downgrade')
    return t(`pricing.plans.${planId}.cta`)
  }

  function isCtaDisabled(planId: string): boolean {
    return currentPlan === planId && planId !== 'free'
  }

  const plans = [
    {
      id: 'free',
      name: t('pricing.plans.free.name'),
      price: t('pricing.plans.free.price'),
      period: t('pricing.plans.free.period'),
      description: t('pricing.plans.free.description'),
      features: t.raw('pricing.plans.free.features') as string[],
      popular: false,
    },
    {
      id: 'basic',
      name: t('pricing.plans.basic.name'),
      price: isAnnual ? (locale === 'ko' ? '₩129,000' : '$99') : t('pricing.plans.basic.price'),
      period: isAnnual ? (locale === 'ko' ? '연간' : 'per year') : t('pricing.plans.basic.period'),
      description: t('pricing.plans.basic.description'),
      features: t.raw('pricing.plans.basic.features') as string[],
      popular: true,
    },
    {
      id: 'pro',
      name: t('pricing.plans.pro.name'),
      price: isAnnual ? (locale === 'ko' ? '₩249,000' : '$199') : t('pricing.plans.pro.price'),
      period: isAnnual ? (locale === 'ko' ? '연간' : 'per year') : t('pricing.plans.pro.period'),
      description: t('pricing.plans.pro.description'),
      features: t.raw('pricing.plans.pro.features') as string[],
      popular: false,
    },
  ]

  const comparisonRows = [
    { feature: locale === 'ko' ? 'AI 분석' : 'AI Analysis', free: '3/mo', basic: locale === 'ko' ? '무제한' : 'Unlimited', pro: locale === 'ko' ? '무제한' : 'Unlimited' },
    { feature: locale === 'ko' ? 'OCR 스캔' : 'OCR Scans', free: '5/mo', basic: '50/mo', pro: locale === 'ko' ? '무제한' : 'Unlimited' },
    { feature: locale === 'ko' ? '히스토리 저장' : 'History', free: '7 days', basic: locale === 'ko' ? '무제한' : 'Unlimited', pro: locale === 'ko' ? '무제한' : 'Unlimited' },
    { feature: locale === 'ko' ? '클럽 통계' : 'Club Stats', free: false, basic: true, pro: true },
    { feature: locale === 'ko' ? '발전 차트' : 'Progress Charts', free: false, basic: true, pro: true },
    { feature: locale === 'ko' ? '목표 관리' : 'Goal Tracking', free: false, basic: false, pro: true },
    { feature: locale === 'ko' ? 'AI 채팅 코치' : 'AI Chat Coach', free: false, basic: false, pro: true },
    { feature: locale === 'ko' ? '영상 분석' : 'Video Analysis', free: false, basic: false, pro: true },
    { feature: locale === 'ko' ? '우선 지원' : 'Priority Support', free: false, basic: false, pro: true },
  ]

  const renderCell = (value: string | boolean, highlight?: boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <span className="text-gray-300">-</span>
      )
    }
    return <span className={`text-sm ${highlight ? 'font-medium text-green-700' : 'text-gray-600'}`}>{value}</span>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-16 pb-8 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-xl text-gray-500 mb-10">
            {t('pricing.subtitle')}
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-gray-100 rounded-full px-1 py-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${!isAnnual ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              {t('pricing.monthly')}
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${isAnnual ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              {t('pricing.annual')}
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {t('pricing.annualSave')}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const disabled = isCtaDisabled(plan.id)
              const loading = checkoutLoading === plan.id

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl p-8 transition-shadow ${
                    plan.popular
                      ? 'border-2 border-green-500 shadow-lg shadow-green-100'
                      : 'border border-gray-200 hover:shadow-md'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                      {t('pricing.plans.basic.popular')}
                    </div>
                  )}

                  {currentPlan === plan.id && plan.id !== 'free' && (
                    <div className="absolute -top-3.5 right-4 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t('checkout.currentPlan')}
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-5">{plan.description}</p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 text-sm">/ {plan.period}</span>
                  </div>

                  {plan.id === 'free' ? (
                    <Link
                      href={`/${locale}/analysis/new`}
                      className="block w-full py-3 rounded-xl text-center font-semibold transition mb-6 bg-gray-100 text-gray-900 hover:bg-gray-200"
                    >
                      {getCtaText(plan.id)}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleCheckout(plan.id)}
                      disabled={disabled || loading}
                      className={`block w-full py-3 rounded-xl text-center font-semibold transition mb-6 ${
                        disabled
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : plan.popular
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {loading
                        ? t('checkout.processing')
                        : getCtaText(plan.id)}
                    </button>
                  )}

                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            {locale === 'ko' ? '상세 기능 비교' : 'Detailed Feature Comparison'}
          </h2>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-5 font-medium text-gray-500 text-sm">
                    {locale === 'ko' ? '기능' : 'Feature'}
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-gray-500 text-sm w-24">Free</th>
                  <th className="text-center py-4 px-4 font-bold text-green-600 text-sm w-24 bg-green-50">Basic</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-500 text-sm w-24">Pro</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className={idx < comparisonRows.length - 1 ? 'border-b border-gray-100' : ''}>
                    <td className="py-3.5 px-5 text-sm text-gray-700">{row.feature}</td>
                    <td className="py-3.5 px-4 text-center">{renderCell(row.free)}</td>
                    <td className="py-3.5 px-4 text-center bg-green-50/50">{renderCell(row.basic, true)}</td>
                    <td className="py-3.5 px-4 text-center">{renderCell(row.pro)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            {t('pricing.faq.title')}
          </h2>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => {
              let question: string
              let answer: string
              try {
                question = t(`pricing.faq.q${i}.question`)
                answer = t(`pricing.faq.q${i}.answer`)
              } catch {
                return null
              }
              return (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition"
                  >
                    <span className="font-medium text-gray-900 text-sm">{question}</span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                      {answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-green-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {locale === 'ko' ? '지금 바로 시작하세요' : 'Start Improving Today'}
          </h2>
          <p className="text-lg text-green-100 mb-8">
            {locale === 'ko'
              ? '무료로 시작하고, 필요할 때 업그레이드하세요.'
              : 'Start for free, upgrade when you need more.'}
          </p>
          <Link
            href={`/${locale}/analysis/new`}
            className="inline-flex items-center bg-white text-green-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition shadow-lg hover:-translate-y-0.5"
          >
            {locale === 'ko' ? '무료로 시작하기' : 'Get Started Free'}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-green-200 text-sm mt-4">
            {locale === 'ko' ? '신용카드 불필요' : 'No credit card required'}
          </p>
        </div>
      </section>
    </div>
  )
}
