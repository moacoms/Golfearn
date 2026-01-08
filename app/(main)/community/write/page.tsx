'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createPost } from '@/lib/actions/posts'

const categories = [
  { id: 'qna', name: 'Q&A', description: '궁금한 것을 질문하세요' },
  { id: 'free', name: '자유게시판', description: '자유롭게 이야기해요' },
  { id: 'review', name: '후기', description: '경험과 후기를 공유해요' },
]

export default function WritePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createPost(formData)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else if (result.data) {
      router.push(`/community/${result.data.id}`)
    }
  }

  return (
    <div className="py-12">
      <div className="container max-w-2xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </Link>
          <h1 className="text-3xl font-bold">글쓰기</h1>
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
                  className="relative flex flex-col items-center p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.id}
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
              placeholder="내용을 입력하세요"
              className="input min-h-[300px] resize-none"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3">
            <Link href="/community" className="btn btn-outline">
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
