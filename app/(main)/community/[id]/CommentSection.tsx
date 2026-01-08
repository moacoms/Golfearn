'use client'

import { useState } from 'react'
import { createComment, deleteComment } from '@/lib/actions/posts'
import { formatDate } from '@/lib/utils'

type Comment = {
  id: number
  content: string
  created_at: string
  user_id: string
  profiles: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
}

export default function CommentSection({
  postId,
  comments,
  currentUserId,
}: {
  postId: number
  comments: Comment[]
  currentUserId?: string
}) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    setError(null)

    const result = await createComment(postId, content)

    if (result.error) {
      setError(result.error)
    } else {
      setContent('')
    }

    setIsSubmitting(false)
  }

  const handleDelete = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return

    const result = await deleteComment(commentId, postId)

    if (result.error) {
      alert(result.error)
    }
  }

  return (
    <section className="card">
      <h2 className="text-lg font-semibold mb-4">
        댓글 {comments.length}개
      </h2>

      {/* 댓글 작성 폼 */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 입력하세요"
            className="input min-h-[100px] resize-none mb-3"
            disabled={isSubmitting}
          />
          {error && (
            <p className="text-red-500 text-sm mb-3">{error}</p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="btn btn-primary"
            >
              {isSubmitting ? '등록 중...' : '댓글 등록'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
          <p className="text-muted">
            댓글을 작성하려면{' '}
            <a href="/login" className="text-primary hover:underline">
              로그인
            </a>
            이 필요합니다.
          </p>
        </div>
      )}

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <p className="text-muted text-center py-8">
          아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
        </p>
      ) : (
        <div className="divide-y divide-border">
          {comments.map((comment) => (
            <div key={comment.id} className="py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {comment.profiles?.username || comment.profiles?.full_name || '익명'}
                  </span>
                  <span className="text-muted">·</span>
                  <span className="text-muted">{formatDate(comment.created_at)}</span>
                </div>
                {currentUserId === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-sm text-muted hover:text-red-500"
                  >
                    삭제
                  </button>
                )}
              </div>
              <p className="whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
