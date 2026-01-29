'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function LandingPage() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMGI5ODEiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Text */}
              <div className="text-left">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {t('landing.hero.badge')}
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  {t('landing.hero.title')}
                </h1>
                <p className="text-xl sm:text-2xl text-green-600 font-semibold mb-4">
                  {t('landing.hero.subtitle')}
                </p>
                <p className="text-lg text-gray-600 mb-8 max-w-lg">
                  {t('landing.hero.description')}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <Link
                    href={`/${locale}/analysis/new`}
                    className="inline-flex items-center justify-center bg-green-600 text-white px-7 py-3.5 rounded-xl text-lg font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-600/25 hover:shadow-green-600/40 hover:-translate-y-0.5"
                  >
                    {t('landing.hero.cta')}
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href={`/${locale}/pricing`}
                    className="inline-flex items-center justify-center bg-white text-gray-700 px-7 py-3.5 rounded-xl text-lg font-semibold hover:bg-gray-50 transition border border-gray-200"
                  >
                    {t('landing.hero.viewPricing')}
                  </Link>
                </div>

                <p className="text-sm text-gray-400">
                  {t('landing.hero.supportedDevices')}
                </p>
              </div>

              {/* Right: Mock Analysis Preview */}
              <div className="relative hidden lg:block">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="ml-2 text-xs text-gray-400">Golfearn AI Analysis</span>
                  </div>
                  {/* Mock Driver Data */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Driver</span>
                      <div className="flex gap-4">
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Carry</div>
                          <div className="text-sm font-bold text-gray-900">245 yds</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Ball Speed</div>
                          <div className="text-sm font-bold text-gray-900">152 mph</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Spin</div>
                          <div className="text-sm font-bold text-gray-900">2,450 rpm</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">7 Iron</span>
                      <div className="flex gap-4">
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Carry</div>
                          <div className="text-sm font-bold text-gray-900">162 yds</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Ball Speed</div>
                          <div className="text-sm font-bold text-gray-900">118 mph</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Spin</div>
                          <div className="text-sm font-bold text-gray-900">6,200 rpm</div>
                        </div>
                      </div>
                    </div>
                    {/* AI Feedback Preview */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🤖</span>
                        <span className="text-sm font-semibold text-green-700">AI Coach Feedback</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {t('landing.hero.mockFeedback')}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-2 flex items-center gap-2">
                  <span className="text-green-500 text-lg">+15</span>
                  <span className="text-xs text-gray-500">{t('landing.hero.yardGain')}</span>
                </div>
              </div>
            </div>

            {/* Device logos */}
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 mt-16 pt-8 border-t border-gray-100">
              {['TrackMan', 'GolfZon', 'GDR', 'FlightScope', 'Mevo+', 'GCQuad'].map((device) => (
                <span key={device} className="text-gray-300 font-semibold text-sm tracking-wider uppercase">
                  {device}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-green-400">500+</div>
              <div className="text-sm text-gray-400 mt-1">{t('landing.stats.users')}</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-green-400">2,000+</div>
              <div className="text-sm text-gray-400 mt-1">{t('landing.stats.analyses')}</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-green-400">+12 yds</div>
              <div className="text-sm text-gray-400 mt-1">{t('landing.stats.improvement')}</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-green-400">4.8/5</div>
              <div className="text-sm text-gray-400 mt-1">{t('landing.stats.rating')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1: Upload */}
            <div className="relative group">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <span className="text-2xl">📸</span>
                </div>
                <div className="text-xs font-bold text-green-600 mb-2">STEP 1</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('landing.features.upload.title')}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('landing.features.upload.description')}
                </p>
              </div>
            </div>

            {/* Step 2: Analyze */}
            <div className="relative group">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <span className="text-2xl">🤖</span>
                </div>
                <div className="text-xs font-bold text-blue-600 mb-2">STEP 2</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('landing.features.analyze.title')}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('landing.features.analyze.description')}
                </p>
              </div>
            </div>

            {/* Step 3: Track */}
            <div className="relative group">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="text-xs font-bold text-purple-600 mb-2">STEP 3</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('landing.features.track.title')}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('landing.features.track.description')}
                </p>
              </div>
            </div>

            {/* Step 4: Improve */}
            <div className="relative group">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="text-xs font-bold text-orange-600 mb-2">STEP 4</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('landing.features.improve.title')}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('landing.features.improve.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            {t('landing.comparison.title')}
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            {t('landing.comparison.subtitle')}
          </p>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="grid grid-cols-3">
              <div className="p-4 sm:p-5 bg-gray-50 border-b" />
              <div className="p-4 sm:p-5 text-center font-semibold text-gray-500 bg-gray-50 border-b text-sm sm:text-base">
                {t('landing.comparison.traditional')}
              </div>
              <div className="p-4 sm:p-5 text-center font-bold text-green-600 bg-green-50 border-b text-sm sm:text-base">
                {t('landing.comparison.golfearn')}
              </div>
            </div>

            {(['price', 'availability', 'tracking', 'feedback'] as const).map((key, idx) => (
              <div key={key} className={`grid grid-cols-3 ${idx < 3 ? 'border-b border-gray-100' : ''}`}>
                <div className="p-4 sm:p-5 font-medium text-gray-900 text-sm sm:text-base flex items-center gap-2">
                  {key === 'price' && '💰'}
                  {key === 'availability' && '🕐'}
                  {key === 'tracking' && '📊'}
                  {key === 'feedback' && '💬'}
                  <span className="hidden sm:inline">
                    {key === 'price' ? 'Price' : t(`landing.comparison.${key}.label`)}
                  </span>
                </div>
                <div className="p-4 sm:p-5 text-center text-gray-500 text-sm flex items-center justify-center">
                  {t(`landing.comparison.${key}.traditional`)}
                </div>
                <div className="p-4 sm:p-5 text-center text-green-600 font-semibold bg-green-50/50 text-sm flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t(`landing.comparison.${key}.golfearn`)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            {t('landing.testimonials.title')}
          </h2>
          <p className="text-center text-gray-500 mb-12">
            {t('landing.testimonials.subtitle')}
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-100 p-6 rounded-2xl hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  &ldquo;{t(`landing.testimonials.testimonial${i}.text`)}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-bold text-sm">
                      {t(`landing.testimonials.testimonial${i}.author`).charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {t(`landing.testimonials.testimonial${i}.author`)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t(`landing.testimonials.testimonial${i}.role`)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-lg text-gray-500">
              {t('pricing.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900">{t('pricing.plans.free.name')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('pricing.plans.free.description')}</p>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-gray-900">{t('pricing.plans.free.price')}</span>
                <span className="text-gray-400 ml-1">/ {t('pricing.plans.free.period')}</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {(t.raw('pricing.plans.free.features') as string[]).map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/analysis/new`}
                className="block w-full text-center py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
              >
                {t('pricing.plans.free.cta')}
              </Link>
            </div>

            {/* Basic - Popular */}
            <div className="bg-white rounded-2xl border-2 border-green-500 p-6 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {t('pricing.plans.basic.popular')}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{t('pricing.plans.basic.name')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('pricing.plans.basic.description')}</p>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-gray-900">{t('pricing.plans.basic.price')}</span>
                <span className="text-gray-400 ml-1">/ {t('pricing.plans.basic.period')}</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {(t.raw('pricing.plans.basic.features') as string[]).map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/pricing`}
                className="block w-full text-center py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition text-sm"
              >
                {t('pricing.plans.basic.cta')}
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900">{t('pricing.plans.pro.name')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('pricing.plans.pro.description')}</p>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-gray-900">{t('pricing.plans.pro.price')}</span>
                <span className="text-gray-400 ml-1">/ {t('pricing.plans.pro.period')}</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {(t.raw('pricing.plans.pro.features') as string[]).map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/pricing`}
                className="block w-full text-center py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
              >
                {t('pricing.plans.pro.cta')}
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            {t('landing.cta.noCard')}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            {t('pricing.faq.title')}
          </h2>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => {
              const questionKey = `pricing.faq.q${i}.question`
              const answerKey = `pricing.faq.q${i}.answer`
              let question: string
              let answer: string
              try {
                question = t(questionKey)
                answer = t(answerKey)
              } catch {
                return null
              }
              return (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition"
                  >
                    <span className="font-medium text-gray-900">{question}</span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
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

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-700 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            {t('landing.cta.description')}
          </p>
          <Link
            href={`/${locale}/analysis/new`}
            className="inline-flex items-center bg-white text-green-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition shadow-lg hover:-translate-y-0.5"
          >
            {t('landing.cta.button')}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-green-200 mt-4 text-sm">
            {t('landing.cta.noCard')}
          </p>
        </div>
      </section>
    </div>
  )
}
