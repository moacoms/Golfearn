import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.golfearn.com'),
  title: {
    default: 'Golfearn - 늦게 시작해도 괜찮아, 함께라면',
    template: '%s | Golfearn',
  },
  description: '30대 후반~50대 골프 입문자를 위한 올인원 플랫폼. 장비 가이드, 레슨 정보, 커뮤니티, 중고거래, 조인 매칭까지.',
  keywords: ['골프', '골린이', '골프입문', '골프장비', '골프레슨', '중고골프채', '골프조인', '골프장', '골프커뮤니티'],
  authors: [{ name: 'Golfearn' }],
  creator: 'Golfearn',
  publisher: 'Golfearn',
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    title: 'Golfearn - 늦게 시작해도 괜찮아, 함께라면',
    description: '30대 후반~50대 골프 입문자를 위한 올인원 플랫폼. 장비 가이드, 레슨, 커뮤니티, 중고거래, 조인 매칭.',
    url: 'https://www.golfearn.com',
    siteName: 'Golfearn',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Golfearn - 골린이를 위한 골프 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Golfearn - 늦게 시작해도 괜찮아, 함께라면',
    description: '30대 후반~50대 골프 입문자를 위한 올인원 플랫폼',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // TODO: 실제 코드로 교체
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#10B981',
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
