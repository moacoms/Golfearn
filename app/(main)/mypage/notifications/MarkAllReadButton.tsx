'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { markAllNotificationsAsRead } from '@/lib/actions/notifications'

export default function MarkAllReadButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await markAllNotificationsAsRead()
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-sm text-primary hover:underline disabled:opacity-50"
    >
      {loading ? '처리 중...' : '모두 읽음'}
    </button>
  )
}
