'use client'

import { useState, useTransition } from 'react'
import { togglePostLike, togglePostBookmark } from '@/lib/actions/posts'

interface LikeBookmarkButtonsProps {
  postId: number
  initialLikeCount: number
  initialBookmarkCount: number
  initialIsLiked: boolean
  initialIsBookmarked: boolean
  isLoggedIn: boolean
}

export default function LikeBookmarkButtons({
  postId,
  initialLikeCount,
  initialBookmarkCount,
  initialIsLiked,
  initialIsBookmarked,
  isLoggedIn,
}: LikeBookmarkButtonsProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [bookmarkCount, setBookmarkCount] = useState(initialBookmarkCount)
  const [isPending, startTransition] = useTransition()

  const handleLike = () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.')
      return
    }

    // Optimistic update
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)

    startTransition(async () => {
      const result = await togglePostLike(postId)
      if (result.error) {
        // Rollback on error
        setIsLiked(isLiked)
        setLikeCount(likeCount)
        alert(result.error)
      }
    })
  }

  const handleBookmark = () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.')
      return
    }

    // Optimistic update
    setIsBookmarked(!isBookmarked)
    setBookmarkCount(isBookmarked ? bookmarkCount - 1 : bookmarkCount + 1)

    startTransition(async () => {
      const result = await togglePostBookmark(postId)
      if (result.error) {
        // Rollback on error
        setIsBookmarked(isBookmarked)
        setBookmarkCount(bookmarkCount)
        alert(result.error)
      }
    })
  }

  return (
    <div className="flex items-center gap-4 pt-6 border-t">
      {/* 좋아요 버튼 */}
      <button
        onClick={handleLike}
        disabled={isPending}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          isLiked
            ? 'bg-red-50 text-red-500 hover:bg-red-100'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:opacity-50`}
      >
        <svg
          className="w-5 h-5"
          fill={isLiked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span className="font-medium">좋아요</span>
        <span className="text-sm">{likeCount}</span>
      </button>

      {/* 북마크 버튼 */}
      <button
        onClick={handleBookmark}
        disabled={isPending}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          isBookmarked
            ? 'bg-primary/10 text-primary hover:bg-primary/20'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:opacity-50`}
      >
        <svg
          className="w-5 h-5"
          fill={isBookmarked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        <span className="font-medium">북마크</span>
        <span className="text-sm">{bookmarkCount}</span>
      </button>
    </div>
  )
}
