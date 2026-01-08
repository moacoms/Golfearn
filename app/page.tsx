import Link from 'next/link'
import PreRegistrationForm from '@/components/PreRegistrationForm'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20 lg:py-32">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            늦게 시작해도 괜찮아,
            <br />
            <span className="text-primary">함께라면</span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-8">
            30대 후반~50대 골프 입문자를 위한 올인원 플랫폼.
            <br />
            장비 선택부터 첫 라운딩까지, 골린이의 모든 여정을 함께합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/guide" className="btn btn-primary text-lg px-8 py-3">
              입문 가이드 보기
            </Link>
            <Link href="/community" className="btn btn-outline text-lg px-8 py-3">
              커뮤니티 참여하기
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            골린이를 위한 <span className="text-primary">4가지 핵심 기능</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon="📚"
              title="입문 가이드"
              description="장비 선택, 레슨, 연습, 라운딩까지 체계적인 로드맵"
            />
            <FeatureCard
              icon="💬"
              title="커뮤니티"
              description="같은 고민을 나누는 골린이들의 따뜻한 공간"
            />
            <FeatureCard
              icon="🛒"
              title="중고거래"
              description="믿을 수 있는 골린이들끼리의 장비 거래"
            />
            <FeatureCard
              icon="🤝"
              title="함께 라운딩"
              description="실력대 비슷한 골린이들과 부담 없이 조인"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-lg opacity-90 mb-8">
            42살에 골프를 시작한 창업자가 직접 경험한 노하우를 공유합니다.
          </p>
          <PreRegistrationForm />
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="card text-center hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted">{description}</p>
    </div>
  )
}

