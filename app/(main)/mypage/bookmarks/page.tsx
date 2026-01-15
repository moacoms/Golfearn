import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getBookmarkedPosts } from '@/lib/actions/posts'
import { formatDate } from '@/lib/utils'

const categories: { [key: string]: string } = {
  qna: 'Q&A',
  free: '자유게시판',
  review: '후기',
}

export default async function MyBookmarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const bookmarks = await getBookmarkedPosts()

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
          <h1 className="text-3xl font-bold">북마크한 게시글</h1>
        </div>

        {/* 게시글 목록 */}
        {bookmarks.length > 0 ? (
          <div className="space-y-4">
            {bookmarks.map((post) => (
              <Link key={post.id} href={`/community/${post.id}`}>
                <article className="card hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                          {categories[post.category] || post.category}
                        </span>
                      </div>
                      <h2 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-muted text-sm line-clamp-2 mb-3">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted">
                        <span>{post.profiles?.username || post.profiles?.full_name || '익명'}</span>
                        <span>{formatDate(post.created_at)}</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {post.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {post.like_count}
                        </span>
                      </div>
                    </div>
                    {/* 북마크 아이콘 */}
                    <div className="text-primary">
                      <svg className="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted text-lg mb-4">북마크한 게시글이 없습니다</p>
            <Link href="/community" className="btn btn-primary">
              커뮤니티 둘러보기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
