import Link from 'next/link'

const categories = [
  { id: 'start', name: '시작하기', icon: '🚀' },
  { id: 'equipment', name: '장비', icon: '🏌️' },
  { id: 'lesson', name: '레슨', icon: '📚' },
  { id: 'practice', name: '연습', icon: '⛳' },
  { id: 'round', name: '라운딩', icon: '🏆' },
]

const guides = [
  {
    slug: '42-started-golf',
    title: '42살에 골프 시작한 이유',
    category: 'start',
    readTime: '5분',
    description: '늦은 나이에 골프를 시작하게 된 계기와 첫 경험을 공유합니다.',
  },
  {
    slug: 'first-club-budget',
    title: '골린이 첫 클럽 세트, 얼마짜리 사야 할까?',
    category: 'equipment',
    readTime: '8분',
    description: '예산별 추천 클럽 세트와 선택 기준을 알려드립니다.',
  },
  {
    slug: 'used-vs-new',
    title: '중고채 vs 새 클럽, 뭐가 나을까?',
    category: 'equipment',
    readTime: '6분',
    description: '중고 클럽과 새 클럽의 장단점을 비교해봅니다.',
  },
  {
    slug: 'choosing-lesson-pro',
    title: '레슨프로 고르는 5가지 기준',
    category: 'lesson',
    readTime: '7분',
    description: '좋은 레슨프로를 만나기 위한 체크리스트입니다.',
  },
  {
    slug: 'first-practice',
    title: '연습장 처음 가면 뭐부터 해야 하나?',
    category: 'practice',
    readTime: '5분',
    description: '연습장에서의 첫 날, 당황하지 않기 위한 가이드입니다.',
  },
  {
    slug: 'golf-cost-reality',
    title: '골프 시작 비용 총정리 (현실 버전)',
    category: 'start',
    readTime: '10분',
    description: '장비, 레슨, 연습장, 라운딩까지 실제 비용을 공개합니다.',
  },
]

export default function GuidePage() {
  return (
    <div className="py-12">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">입문 가이드</h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            골프를 처음 시작하는 분들을 위한 체계적인 가이드입니다.
            <br />
            42살에 골프를 시작한 경험을 바탕으로 작성했습니다.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button className="btn btn-primary">전체</button>
          {categories.map((category) => (
            <button
              key={category.id}
              className="btn btn-outline"
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        {/* Guide Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <Link key={guide.slug} href={`/guide/${guide.slug}`}>
              <article className="card h-full hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-muted mb-3">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                    {categories.find((c) => c.id === guide.category)?.name}
                  </span>
                  <span>·</span>
                  <span>{guide.readTime} 읽기</span>
                </div>
                <h2 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                  {guide.title}
                </h2>
                <p className="text-muted">{guide.description}</p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
