import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPost, getComments } from '@/lib/actions/posts'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import CommentSection from './CommentSection'
import PostActions from './PostActions'

const categories = [
  { id: 'qna', name: 'Q&A' },
  { id: 'free', name: '자유게시판' },
  { id: 'review', name: '후기' },
]

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const postId = parseInt(id)

  if (isNaN(postId)) {
    notFound()
  }

  const [post, comments] = await Promise.all([
    getPost(postId),
    getComments(postId),
  ])

  if (!post) {
    notFound()
  }

  // 현재 사용자 확인
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthor = user?.id === post.user_id

  const category = categories.find((c) => c.id === post.category)

  return (
    <div className="py-12">
      <div className="container max-w-3xl">
        {/* 뒤로가기 */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-muted hover:text-primary mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </Link>

        {/* 게시글 */}
        <article className="card mb-8">
          {/* 헤더 */}
          <header className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {category?.name}
              </span>
              <span className="text-muted text-sm">조회 {post.view_count}</span>
            </div>
            <h1 className="text-2xl font-bold mb-3">{post.title}</h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-muted">
                <span className="font-medium text-foreground">
                  {post.profiles?.username || post.profiles?.full_name || '익명'}
                </span>
                <span>·</span>
                <span>{formatDate(post.created_at)}</span>
              </div>
              {isAuthor && <PostActions postId={postId} />}
            </div>
          </header>

          {/* 본문 */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{post.content}</div>
          </div>
        </article>

        {/* 댓글 섹션 */}
        <CommentSection
          postId={postId}
          comments={comments}
          currentUserId={user?.id}
        />
      </div>
    </div>
  )
}
