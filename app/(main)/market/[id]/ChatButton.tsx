'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { startChat } from '@/lib/actions/chat'

type ChatButtonProps = {
  productId: number
  sellerId: string
}

export default function ChatButton({ productId, sellerId }: ChatButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setIsLoading(true)
    setError(null)

    const result = await startChat(productId)

    if (result.error) {
      if (result.redirect) {
        router.push(result.redirect)
      } else {
        setError(result.error)
        setIsLoading(false)
      }
    } else if (result.success) {
      router.push(`/mypage/messages/${productId}/${sellerId}`)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="btn btn-primary flex-1 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            채팅하기
          </>
        )}
      </button>
      {error && (
        <div className="mt-2 text-sm text-red-500 text-center">
          {error}
        </div>
      )}
    </>
  )
}
