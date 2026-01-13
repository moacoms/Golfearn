import Link from 'next/link'
import { guides, categories, getGuidesByCategory } from '@/lib/guides'

export const metadata = {
  title: '입문 가이드 | Golfearn',
  description: '골프를 처음 시작하는 분들을 위한 체계적인 가이드. 42살에 골프를 시작한 경험을 바탕으로 작성했습니다.',
}

export default async function GuidePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const selectedCategory = category || 'all'
  const filteredGuides = getGuidesByCategory(selectedCategory)

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
          <Link
            href="/guide"
            className={`btn ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
          >
            전체
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/guide?category=${cat.id}`}
              className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-outline'}`}
            >
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>

        {/* Guide Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <Link key={guide.slug} href={`/guide/${guide.slug}`}>
              <article className="card h-full hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center gap-2 text-sm text-muted mb-3">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                    {categories.find((c) => c.id === guide.category)?.name}
                  </span>
                  <span>·</span>
                  <span>{guide.readTime} 읽기</span>
                </div>
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {guide.title}
                </h2>
                <p className="text-muted">{guide.description}</p>
              </article>
            </Link>
          ))}
        </div>

        {/* More Content Coming */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-primary/5 rounded-2xl p-8">
            <p className="text-2xl mb-2">🏌️‍♂️</p>
            <p className="text-lg font-medium mb-2">더 많은 가이드가 준비 중입니다</p>
            <p className="text-muted">
              매주 새로운 콘텐츠가 업데이트됩니다.
              <br />
              궁금한 주제가 있다면 커뮤니티에서 알려주세요!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
