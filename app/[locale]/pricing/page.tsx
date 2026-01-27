'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'

export default function PricingPage() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      id: 'free',
      name: t('pricing.plans.free.name'),
      price: t('pricing.plans.free.price'),
      period: t('pricing.plans.free.period'),
      description: t('pricing.plans.free.description'),
      features: [
        locale === 'ko' ? '월 3회 분석' : '3 analyses per month',
        locale === 'ko' ? '기본 AI 피드백' : 'Basic AI feedback',
        locale === 'ko' ? '수동 데이터 입력' : 'Manual data entry',
        locale === 'ko' ? '7일 히스토리' : '7-day history',
      ],
      cta: t('pricing.plans.free.cta'),
      href: `/${locale}/signup`,
      popular: false,
    },
    {
      id: 'basic',
      name: t('pricing.plans.basic.name'),
      price: isAnnual ? '$99' : t('pricing.plans.basic.price'),
      period: isAnnual ? (locale === 'ko' ? '연간' : 'per year') : t('pricing.plans.basic.period'),
      description: t('pricing.plans.basic.description'),
      features: [
        locale === 'ko' ? '무제한 분석' : 'Unlimited analyses',
        locale === 'ko' ? '전체 AI 인사이트' : 'Full AI insights',
        locale === 'ko' ? '사진 OCR (월 50회)' : 'Photo OCR (50/month)',
        locale === 'ko' ? '무제한 히스토리' : 'Unlimited history',
        locale === 'ko' ? '클럽별 통계' : 'Club statistics',
        locale === 'ko' ? '발전 차트' : 'Progress charts',
      ],
      cta: t('pricing.plans.basic.cta'),
      href: `/${locale}/signup?plan=basic`,
      popular: true,
    },
    {
      id: 'pro',
      name: t('pricing.plans.pro.name'),
      price: isAnnual ? '$199' : t('pricing.plans.pro.price'),
      period: isAnnual ? (locale === 'ko' ? '연간' : 'per year') : t('pricing.plans.pro.period'),
      description: t('pricing.plans.pro.description'),
      features: [
        locale === 'ko' ? 'Basic의 모든 기능' : 'Everything in Basic',
        locale === 'ko' ? '무제한 OCR' : 'Unlimited OCR',
        locale === 'ko' ? '영상 스윙 분석' : 'Video swing analysis',
        locale === 'ko' ? 'AI 채팅 코치' : 'AI Chat Coach',
        locale === 'ko' ? '목표 관리' : 'Goal tracking',
        locale === 'ko' ? '우선 지원' : 'Priority support',
      ],
      cta: t('pricing.plans.pro.cta'),
      href: `/${locale}/signup?plan=pro`,
      popular: false,
    },
  ]

  const faqs = [
    {
      question: t('pricing.faq.q1.question'),
      answer: t('pricing.faq.q1.answer'),
    },
    {
      question: t('pricing.faq.q2.question'),
      answer: t('pricing.faq.q2.answer'),
    },
    {
      question: t('pricing.faq.q3.question'),
      answer: t('pricing.faq.q3.answer'),
    },
    {
      question: locale === 'ko' ? '환불 정책은 어떻게 되나요?' : 'What is your refund policy?',
      answer: locale === 'ko'
        ? '첫 7일 이내에 만족하지 못하시면 전액 환불해 드립니다.'
        : 'If you\'re not satisfied within the first 7 days, we offer a full refund.',
    },
    {
      question: locale === 'ko' ? '플랜을 변경할 수 있나요?' : 'Can I change plans?',
      answer: locale === 'ko'
        ? '네, 언제든지 업그레이드하거나 다운그레이드할 수 있습니다. 변경은 다음 결제 주기부터 적용됩니다.'
        : 'Yes, you can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle.',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <span className="text-2xl">🏌️</span>
              <span className="text-xl font-bold text-gray-900">Golfearn</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href={`/${locale}`} className="text-gray-600 hover:text-gray-900">
                {t('nav.home')}
              </Link>
              <Link href={`/${locale}/analysis`} className="text-gray-600 hover:text-gray-900">
                {t('nav.analysis')}
              </Link>
              <Link href={`/${locale}/pricing`} className="text-green-600 font-medium">
                {t('nav.pricing')}
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link
                href={`/${locale}/login`}
                className="text-gray-600 hover:text-gray-900"
              >
                {t('common.signIn')}
              </Link>
              <Link
                href={`/${locale}/signup`}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                {t('common.signUp')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('pricing.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('pricing.subtitle')}
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                {t('pricing.monthly')}
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative w-14 h-7 rounded-full transition-colors ${isAnnual ? 'bg-green-600' : 'bg-gray-300'}`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isAnnual ? 'translate-x-8' : 'translate-x-1'}`}
                />
              </button>
              <span className={`text-sm ${isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                {t('pricing.annual')}
              </span>
              {isAnnual && (
                <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                  {t('pricing.annualSave')}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-8 -mt-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl shadow-sm border ${
                    plan.popular ? 'border-green-500 ring-2 ring-green-500' : 'border-gray-200'
                  } p-8`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                      {t('pricing.plans.basic.popular')}
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-500">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`block w-full py-3 px-4 rounded-lg text-center font-medium transition ${
                      plan.popular
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
              {locale === 'ko' ? '기능 비교' : 'Feature Comparison'}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-medium text-gray-500">
                      {locale === 'ko' ? '기능' : 'Feature'}
                    </th>
                    <th className="text-center py-4 px-4 font-medium text-gray-900">Free</th>
                    <th className="text-center py-4 px-4 font-medium text-green-600">Basic</th>
                    <th className="text-center py-4 px-4 font-medium text-gray-900">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: locale === 'ko' ? 'AI 분석' : 'AI Analysis', free: '3/mo', basic: locale === 'ko' ? '무제한' : 'Unlimited', pro: locale === 'ko' ? '무제한' : 'Unlimited' },
                    { feature: locale === 'ko' ? 'OCR 스캔' : 'OCR Scans', free: '5/mo', basic: '50/mo', pro: locale === 'ko' ? '무제한' : 'Unlimited' },
                    { feature: locale === 'ko' ? '히스토리 저장' : 'History Storage', free: '7 days', basic: locale === 'ko' ? '무제한' : 'Unlimited', pro: locale === 'ko' ? '무제한' : 'Unlimited' },
                    { feature: locale === 'ko' ? '클럽 통계' : 'Club Statistics', free: false, basic: true, pro: true },
                    { feature: locale === 'ko' ? '발전 차트' : 'Progress Charts', free: false, basic: true, pro: true },
                    { feature: locale === 'ko' ? '목표 관리' : 'Goal Tracking', free: false, basic: false, pro: true },
                    { feature: locale === 'ko' ? 'AI 채팅 코치' : 'AI Chat Coach', free: false, basic: false, pro: true },
                    { feature: locale === 'ko' ? '영상 분석' : 'Video Analysis', free: false, basic: false, pro: true },
                    { feature: locale === 'ko' ? '우선 지원' : 'Priority Support', free: false, basic: false, pro: true },
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4 px-4 text-sm text-gray-700">{row.feature}</td>
                      <td className="py-4 px-4 text-center">
                        {typeof row.free === 'boolean' ? (
                          row.free ? (
                            <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )
                        ) : (
                          <span className="text-sm text-gray-600">{row.free}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center bg-green-50">
                        {typeof row.basic === 'boolean' ? (
                          row.basic ? (
                            <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )
                        ) : (
                          <span className="text-sm font-medium text-green-700">{row.basic}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {typeof row.pro === 'boolean' ? (
                          row.pro ? (
                            <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )
                        ) : (
                          <span className="text-sm text-gray-600">{row.pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
              {t('pricing.faq.title')}
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="bg-white rounded-lg shadow-sm">
                  <summary className="px-6 py-4 cursor-pointer text-lg font-medium text-gray-900 hover:bg-gray-50">
                    {faq.question}
                  </summary>
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-green-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {locale === 'ko' ? '지금 바로 시작하세요' : 'Start Improving Today'}
            </h2>
            <p className="text-xl text-green-100 mb-8">
              {locale === 'ko'
                ? '무료로 시작하고, 필요할 때 업그레이드하세요.'
                : 'Start for free, upgrade when you need more.'}
            </p>
            <Link
              href={`/${locale}/signup`}
              className="inline-block bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              {locale === 'ko' ? '무료로 시작하기' : 'Get Started Free'}
            </Link>
            <p className="text-green-100 text-sm mt-4">
              {locale === 'ko' ? '신용카드 불필요' : 'No credit card required'}
            </p>
          </div>
        </section>
      </main>

    </div>
  )
}
