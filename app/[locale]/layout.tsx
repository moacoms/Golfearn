import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/lib/i18n/config'
import Link from 'next/link'
import '@/app/globals.css'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

function LocaleFooter({ locale }: { locale: string }) {
  const isKo = locale === 'ko'

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="3" />
                  <path d="M12 8c-1 0-2 .5-2.5 1.5L7 16h3l1 6h2l1-6h3l-2.5-6.5C14 8.5 13 8 12 8z" />
                </svg>
              </div>
              <span className="text-xl font-bold">Golfearn</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {isKo
                ? '늦게 시작해도 괜찮아, 함께라면.\nAI 코치와 함께 골프 실력을 키워보세요.'
                : 'It\'s okay to start late.\nImprove your golf game with AI coaching.'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-200">{isKo ? 'AI 분석' : 'AI Analysis'}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href={`/${locale}/analysis`} className="hover:text-green-400 transition">{isKo ? '대시보드' : 'Dashboard'}</Link></li>
              <li><Link href={`/${locale}/analysis/new`} className="hover:text-green-400 transition">{isKo ? '새 분석' : 'New Analysis'}</Link></li>
              <li><Link href={`/${locale}/pricing`} className="hover:text-green-400 transition">{isKo ? '요금제' : 'Pricing'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-200">{isKo ? '커뮤니티' : 'Community'}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/community" className="hover:text-green-400 transition">{isKo ? '게시판' : 'Forum'}</Link></li>
              <li><Link href="/join" className="hover:text-green-400 transition">{isKo ? '조인 매칭' : 'Join Match'}</Link></li>
              <li><Link href="/market" className="hover:text-green-400 transition">{isKo ? '중고거래' : 'Marketplace'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-200">{isKo ? '고객지원' : 'Support'}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/guide" className="hover:text-green-400 transition">{isKo ? '입문 가이드' : 'Beginner Guide'}</Link></li>
              <li><Link href="/terms" className="hover:text-green-400 transition">{isKo ? '이용약관' : 'Terms'}</Link></li>
              <li><Link href="/privacy" className="hover:text-green-400 transition">{isKo ? '개인정보처리방침' : 'Privacy'}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Golfearn. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
            <span>Powered by AI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className="flex flex-col min-h-screen bg-gray-50">
        <NextIntlClientProvider messages={messages}>
          <div className="flex-grow">
            {children}
          </div>
          <LocaleFooter locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
