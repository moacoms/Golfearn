import Link from 'next/link'
import PreRegistrationForm from '@/components/PreRegistrationForm'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-16 md:py-24 lg:py-32">
        <div className="container text-center">
          <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            30~50대 골프 입문자를 위한 플랫폼
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            늦게 시작해도 괜찮아,
            <br />
            <span className="text-primary">함께라면</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto mb-8 px-4">
            장비 선택부터 첫 라운딩까지,
            <br className="sm:hidden" />
            {' '}골린이의 모든 여정을 함께합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link href="/guide" className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-3">
              입문 가이드 보기
            </Link>
            <Link href="/signup" className="btn btn-outline text-base sm:text-lg px-6 sm:px-8 py-3">
              무료로 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <StatCard number="10+" label="입문 가이드" />
            <StatCard number="100%" label="무료 이용" />
            <StatCard number="42살" label="창업자 시작 나이" />
            <StatCard number="24/7" label="커뮤니티 운영" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20">
        <div className="container">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            골린이를 위한 <span className="text-primary">핵심 기능</span>
          </h2>
          <p className="text-muted text-center mb-10 md:mb-12 max-w-xl mx-auto px-4">
            정보 비대칭, 비용 부담, 심리적 장벽을 해소하는 올인원 서비스
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              title="입문 가이드"
              description="장비 선택부터 첫 라운딩까지 체계적인 로드맵을 제공합니다."
              href="/guide"
              linkText="가이드 보기"
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              }
              title="커뮤니티"
              description="같은 고민을 나누는 골린이들의 따뜻한 소통 공간입니다."
              href="/community"
              linkText="커뮤니티 가기"
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
              title="중고거래"
              description="믿을 수 있는 골린이들끼리 합리적인 가격에 장비를 거래해요."
              href="/market"
              linkText="장터 둘러보기"
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              title="골린이 조인"
              description="100타 이상 초보끼리 부담 없이 함께 라운딩해요."
              href="/join"
              linkText="조인 찾아보기"
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              title="골프장 찾기"
              description="내 주변 골프장과 연습장을 쉽게 찾고 리뷰를 확인하세요."
              href="/golf-courses"
              linkText="골프장 검색"
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              title="맞춤 추천"
              description="체형과 예산에 맞는 클럽, 레슨프로 추천을 받아보세요."
              href="/guide"
              linkText="추천 받기"
              comingSoon
            />
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 md:mb-12">
              왜 <span className="text-primary">Golfearn</span>인가요?
            </h2>
            <div className="space-y-6">
              <WhyCard
                number="01"
                title="진정성 있는 경험"
                description="42살에 골프를 시작한 창업자의 실제 경험을 바탕으로 만들었습니다. 골린이의 어려움을 누구보다 잘 알고 있어요."
              />
              <WhyCard
                number="02"
                title="골린이 전용 공간"
                description="기존 골프 커뮤니티는 고수 위주입니다. 여기서는 초보도 눈치 보지 않고 질문할 수 있어요."
              />
              <WhyCard
                number="03"
                title="비용 절감"
                description="중고 장비 거래, 동반자 찾기, 무료 가이드로 골프 시작 비용을 크게 줄일 수 있습니다."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 md:py-20">
        <div className="container">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 md:mb-12">
            골린이들의 <span className="text-primary">이야기</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <TestimonialCard
              quote="연습장 가기 전에 가이드 읽고 가니까 훨씬 덜 창피했어요. 진짜 도움 많이 됐습니다."
              author="김OO"
              info="45세, 골프 3개월차"
            />
            <TestimonialCard
              quote="중고 클럽을 여기서 구매했는데 판매자분도 초보셔서 편하게 거래했어요."
              author="박OO"
              info="38세, 골프 1개월차"
            />
            <TestimonialCard
              quote="같은 실력끼리 조인해서 라운딩 했는데 진짜 부담 없고 좋았습니다."
              author="이OO"
              info="52세, 골프 6개월차"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark py-16 md:py-20">
        <div className="container text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-base sm:text-lg opacity-90 mb-8 max-w-xl mx-auto px-4">
            골프 시작이 막막하셨나요?
            <br />
            Golfearn이 첫 걸음부터 함께합니다.
          </p>
          <PreRegistrationForm />
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 bg-white">
        <div className="container text-center">
          <p className="text-muted mb-4">아직 고민되시나요?</p>
          <Link href="/guide/42-started-golf" className="text-primary font-medium hover:underline">
            창업자의 골프 시작 이야기 읽어보기 →
          </Link>
        </div>
      </section>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{number}</div>
      <div className="text-sm sm:text-base text-muted">{label}</div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  href,
  linkText,
  comingSoon,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  linkText: string
  comingSoon?: boolean
}) {
  return (
    <div className="card hover:shadow-md transition-shadow relative">
      {comingSoon && (
        <span className="absolute top-4 right-4 px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
          Coming Soon
        </span>
      )}
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted text-sm mb-4">{description}</p>
      <Link href={href} className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1">
        {linkText}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}

function WhyCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-4 md:gap-6 bg-white p-6 rounded-xl shadow-sm">
      <div className="text-3xl md:text-4xl font-bold text-primary/20">{number}</div>
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted text-sm">{description}</p>
      </div>
    </div>
  )
}

function TestimonialCard({ quote, author, info }: { quote: string; author: string; info: string }) {
  return (
    <div className="card">
      <div className="text-primary text-3xl mb-4">"</div>
      <p className="text-foreground mb-4">{quote}</p>
      <div className="border-t pt-4">
        <p className="font-medium">{author}</p>
        <p className="text-sm text-muted">{info}</p>
      </div>
    </div>
  )
}
