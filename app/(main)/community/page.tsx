import Link from 'next/link'
import { getPosts } from '@/lib/actions/posts'
import { formatDate } from '@/lib/utils'

const categories = [
  { id: 'all', name: '전체' },
  { id: 'qna', name: 'Q&A' },
  { id: 'free', name: '자유게시판' },
  { id: 'review', name: '후기' },
]

export const metadata = {
  title: '커뮤니티 | Golfearn',
  description: '골린이들의 따뜻한 소통 공간. Q&A, 자유게시판, 후기를 공유하세요.',
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const currentCategory = category || 'all'
  const posts = await getPosts(currentCategory)

  return (
    <div className="py-12">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">커뮤니티</h1>
            <p className="text-muted">골린이들의 따뜻한 소통 공간입니다</p>
          </div>
          <Link href="/community/write" className="btn btn-primary">
            글쓰기
          </Link>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.id === 'all' ? '/community' : `/community?category=${cat.id}`}
              className={`btn whitespace-nowrap ${
                currentCategory === cat.id ? 'btn-primary' : 'btn-outline'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Posts List */}
        <div className="card">
          {posts.length === 0 ? (
            <div className="py-12 text-center text-muted">
              <p className="text-lg mb-2">아직 게시글이 없습니다</p>
              <p>첫 번째 글을 작성해보세요!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/community/${post.id}`}
                  className="block py-4 hover:bg-gray-50 -mx-6 px-6 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-muted mb-1">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                          {categories.find((c) => c.id === post.category)?.name}
                        </span>
                      </div>
                      <h2 className="font-medium truncate hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <div className="flex items-center gap-3 text-sm text-muted mt-1">
                        <span>{post.profiles?.username || post.profiles?.full_name || '익명'}</span>
                        <span>·</span>
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <span>조회 {post.view_count}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Empty State CTA */}
        {posts.length === 0 && (
          <div className="mt-8 text-center">
            <Link href="/community/write" className="btn btn-primary">
              첫 글 작성하기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
