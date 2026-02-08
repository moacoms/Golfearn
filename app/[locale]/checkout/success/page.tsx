'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function CheckoutSuccessPage() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {t('checkout.success.title')}
        </h1>

        <p className="text-gray-500 mb-8">
          {t('checkout.success.description')}
        </p>

        <div className="space-y-3">
          <Link
            href={`/${locale}/analysis/new`}
            className="block w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
          >
            {t('checkout.success.cta')}
          </Link>
          <Link
            href={`/${locale}/analysis`}
            className="block w-full py-3 rounded-xl bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200 transition"
          >
            {t('checkout.success.dashboard')}
          </Link>
        </div>

        <p className="text-sm text-gray-400 mt-8">
          {t('checkout.success.emailNotice')}
        </p>
      </div>
    </div>
  )
}
