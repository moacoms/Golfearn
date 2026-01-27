'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function LandingPage() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            {t('landing.hero.title')}
          </h1>
          <p className="text-2xl md:text-3xl text-green-600 font-medium mb-6">
            {t('landing.hero.subtitle')}
          </p>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            {t('landing.hero.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href={`/${locale}/analysis/new`}
              className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition shadow-lg shadow-green-200"
            >
              {t('landing.hero.cta')}
            </Link>
            <button className="bg-white text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition border border-gray-200">
              {t('landing.hero.watchDemo')}
            </button>
          </div>

          <p className="text-sm text-gray-500">
            {t('landing.hero.supportedDevices')}
          </p>

          {/* Device logos */}
          <div className="flex justify-center items-center gap-8 mt-8 opacity-60">
            <span className="text-gray-400 font-medium">TrackMan</span>
            <span className="text-gray-400 font-medium">GolfZon</span>
            <span className="text-gray-400 font-medium">GDR</span>
            <span className="text-gray-400 font-medium">FlightScope</span>
            <span className="text-gray-400 font-medium">Mevo+</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            {t('landing.features.title')}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Upload */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📸</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('landing.features.upload.title')}
              </h3>
              <p className="text-gray-600">
                {t('landing.features.upload.description')}
              </p>
            </div>

            {/* Analyze */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('landing.features.analyze.title')}
              </h3>
              <p className="text-gray-600">
                {t('landing.features.analyze.description')}
              </p>
            </div>

            {/* Track */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('landing.features.track.title')}
              </h3>
              <p className="text-gray-600">
                {t('landing.features.track.description')}
              </p>
            </div>

            {/* Improve */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('landing.features.improve.title')}
              </h3>
              <p className="text-gray-600">
                {t('landing.features.improve.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            {t('landing.comparison.title')}
          </h2>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-100">
              <div className="p-4"></div>
              <div className="p-4 text-center font-semibold text-gray-600">
                {t('landing.comparison.traditional')}
              </div>
              <div className="p-4 text-center font-semibold text-green-600 bg-green-50">
                {t('landing.comparison.golfearn')}
              </div>
            </div>

            {/* Price */}
            <div className="grid grid-cols-3 border-b">
              <div className="p-4 font-medium text-gray-900">💰 Price</div>
              <div className="p-4 text-center text-gray-600">
                {t('landing.comparison.price.traditional')}
              </div>
              <div className="p-4 text-center text-green-600 font-semibold bg-green-50">
                {t('landing.comparison.price.golfearn')}
              </div>
            </div>

            {/* Availability */}
            <div className="grid grid-cols-3 border-b">
              <div className="p-4 font-medium text-gray-900">
                🕐 {t('landing.comparison.availability.label')}
              </div>
              <div className="p-4 text-center text-gray-600">
                {t('landing.comparison.availability.traditional')}
              </div>
              <div className="p-4 text-center text-green-600 font-semibold bg-green-50">
                {t('landing.comparison.availability.golfearn')}
              </div>
            </div>

            {/* Tracking */}
            <div className="grid grid-cols-3 border-b">
              <div className="p-4 font-medium text-gray-900">
                📊 {t('landing.comparison.tracking.label')}
              </div>
              <div className="p-4 text-center text-gray-600">
                {t('landing.comparison.tracking.traditional')}
              </div>
              <div className="p-4 text-center text-green-600 font-semibold bg-green-50">
                {t('landing.comparison.tracking.golfearn')}
              </div>
            </div>

            {/* Feedback */}
            <div className="grid grid-cols-3">
              <div className="p-4 font-medium text-gray-900">
                💬 {t('landing.comparison.feedback.label')}
              </div>
              <div className="p-4 text-center text-gray-600">
                {t('landing.comparison.feedback.traditional')}
              </div>
              <div className="p-4 text-center text-green-600 font-semibold bg-green-50">
                {t('landing.comparison.feedback.golfearn')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            {t('landing.testimonials.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-2xl">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6">
                  "{t(`landing.testimonials.testimonial${i}.text`)}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">
                    {t(`landing.testimonials.testimonial${i}.author`)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t(`landing.testimonials.testimonial${i}.role`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('landing.cta.title')}
          </h2>
          <p className="text-xl text-green-100 mb-10">
            {t('landing.cta.description')}
          </p>
          <Link
            href={`/${locale}/analysis/new`}
            className="inline-block bg-white text-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            {t('landing.cta.button')}
          </Link>
          <p className="text-green-100 mt-4 text-sm">
            {t('landing.cta.noCard')}
          </p>
        </div>
      </section>

    </div>
  )
}
