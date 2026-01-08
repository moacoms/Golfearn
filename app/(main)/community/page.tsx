import Link from 'next/link'

const categories = [
  { id: 'all', name: '전체' },
  { id: 'qna', name: 'Q&A' },
  { id: 'free', name: '자유게시판' },
  { id: 'review', name: '후기' },
]

const mockPosts = [
  {
    id: 1,
    category: 'qna',
    title: '드라이버 슬라이스 고치는 방법 있나요?',
    author: '골린이1호',
    date: '2024-01-07',
    views: 128,
    comments: 5,
  },
  {
    id: 2,
    category: 'review',
    title: '테일러메이드 SIM2 MAX 3개월 사용 후기',
    author: '장비덕후',
    date: '2024-01-06',
    views: 256,
    comments: 12,
  },
  {
    id: 3,
    category: 'free',
    title: '오늘 처음으로 100 깼습니다!',
    author: '늦깎이골퍼',
    date: '2024-01-06',
    views: 89,
    comments: 23,
  },
  {
    id: 4,
    category: 'qna',
    title: '아이언 연습 어떻게 하시나요?',
    author: '초보탈출',
    date: '2024-01-05',
    views: 67,
    comments: 8,
  },
  {
    id: 5,
    category: 'review',
    title: '강남 OO 연습장 솔직 후기',
    author: '연습벌레',
    date: '2024-01-05',
    views: 312,
    comments: 15,
  },
]

export default function CommunityPage() {
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
          {categories.map((category) => (
            <button
              key={category.id}
              className={`btn whitespace-nowrap ${
                category.id === 'all' ? 'btn-primary' : 'btn-outline'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Posts List */}
        <div className="card">
          <div className="divide-y divide-border">
            {mockPosts.map((post) => (
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
                      <span>{post.author}</span>
                      <span>·</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span>조회 {post.views}</span>
                    <span>댓글 {post.comments}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-8">
          <button className="btn btn-outline">이전</button>
          <button className="btn btn-primary">1</button>
          <button className="btn btn-outline">2</button>
          <button className="btn btn-outline">3</button>
          <button className="btn btn-outline">다음</button>
        </div>
      </div>
    </div>
  )
}
