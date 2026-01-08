import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Golfearn - 늦게 시작해도 괜찮아, 함께라면',
  description: '30대 후반~50대 골프 입문자를 위한 올인원 플랫폼. 장비 가이드, 레슨 정보, 커뮤니티, 중고거래까지.',
  keywords: ['골프', '골린이', '골프입문', '골프장비', '골프레슨', '중고골프채'],
  openGraph: {
    title: 'Golfearn - 늦게 시작해도 괜찮아, 함께라면',
    description: '30대 후반~50대 골프 입문자를 위한 올인원 플랫폼',
    url: 'https://golfearn.com',
    siteName: 'Golfearn',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
