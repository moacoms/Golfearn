'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getPost, updatePost } from '@/lib/actions/posts'

const categories = [
  { id: 'qna', name: 'Q&A', description: '궁금한 것을 질문하세요' },
  { id: 'free', name: '자유게시판', description: '자유롭게 이야기해요' },
  { id: 'review', name: '후기', description: '경험과 후기를 공유해요' },
]

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [postId, setPostId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
  })

  useEffect(() => {
    const loadPost = async () => {
      const { id } = await params
      const numId = parseInt(id)
      setPostId(numId)

      if (isNaN(numId)) {
        setError('잘못된 게시글입니다.')
        setIsLoading(false)
        return
      }

      const post = await getPost(numId)

      if (!post) {
        setError('게시글을 찾을 수 없습니다.')
        setIsLoading(false)
        return
      }

      setFormData({
        title: post.title,
        content: post.content,
        category: post.category,
      })
      setIsLoading(false)
    }

    loadPost()
  }, [params])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!postId) return

    setIsSubmitting(true)
    setError(null)

    const form = new FormData()
    form.append('title', formData.title)
    form.append('content', formData.content)
    form.append('category', formData.category)

    const result = await updatePost(postId, form)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      router.push(`/community/${postId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="container max-w-2xl">
          <div className="text-center text-muted">로딩 중...</div>
        </div>
      </div>
    )
  }

  if (error && !formData.title) {
    return (
      <div className="py-12">
        <div className="container max-w-2xl">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Link href="/community" className="btn btn-outline">
              목록으로
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="container max-w-2xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href={`/community/${postId}`}
            className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            돌아가기
          </Link>
          <h1 className="text-3xl font-bold">글 수정</h1>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="card">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* 카테고리 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">카테고리</label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className={`relative flex flex-col items-center p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors ${
                    formData.category === cat.id ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.id}
                    checked={formData.category === cat.id}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="sr-only"
                    required
                  />
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-xs text-muted text-center mt-1">
                    {cat.description}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              제목
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="제목을 입력하세요"
              className="input"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 내용 */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              내용
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="내용을 입력하세요"
              className="input min-h-[300px] resize-none"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3">
            <Link href={`/community/${postId}`} className="btn btn-outline">
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? '수정 중...' : '수정하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
