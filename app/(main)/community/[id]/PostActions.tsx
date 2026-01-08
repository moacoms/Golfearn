'use client'

import { useRouter } from 'next/navigation'
import { deletePost } from '@/lib/actions/posts'

export default function PostActions({ postId }: { postId: number }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return

    const result = await deletePost(postId)

    if (result.error) {
      alert(result.error)
    } else {
      router.push('/community')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => router.push(`/community/${postId}/edit`)}
        className="text-sm text-muted hover:text-primary"
      >
        수정
      </button>
      <button
        onClick={handleDelete}
        className="text-sm text-muted hover:text-red-500"
      >
        삭제
      </button>
    </div>
  )
}
