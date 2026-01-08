import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyPosts } from '@/lib/actions/profile'
import { formatDate } from '@/lib/utils'

type Post = {
  id: number
  category: string
  title: string
  content: string
  view_count: number
  created_at: string
}

const categories: { [key: string]: string } = {
  qna: 'Q&A',
  free: '자유게시판',
  review: '후기',
}

export default async function MyPostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const posts = await getMyPosts()

  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/mypage"
            className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            마이페이지
          </Link>
          <h1 className="text-3xl font-bold">내 게시글</h1>
        </div>

        {/* 게시글 목록 */}
        {posts.length > 0 ? (
          <div className="space-y-4">
            {(posts as Post[]).map((post) => (
              <Link key={post.id} href={`/community/${post.id}`}>
                <article className="card hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                          {categories[post.category] || post.category}
                        </span>
                      </div>
                      <h2 className="font-medium truncate mb-1">{post.title}</h2>
                      <p className="text-sm text-muted line-clamp-2">{post.content}</p>
                    </div>
                    <div className="text-sm text-muted text-right whitespace-nowrap">
                      <p>{formatDate(post.created_at)}</p>
                      <p>조회 {post.view_count}</p>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted text-lg mb-4">작성한 게시글이 없습니다</p>
            <Link href="/community/write" className="btn btn-primary">
              첫 글 작성하기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
