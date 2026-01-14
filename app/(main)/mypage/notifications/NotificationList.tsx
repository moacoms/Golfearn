'use client'

import { useRouter } from 'next/navigation'
import { Notification, markNotificationAsRead } from '@/lib/actions/notifications'

interface NotificationListProps {
  notifications: Notification[]
}

const notificationIcons: Record<string, React.ReactNode> = {
  join_apply: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  join_approved: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  join_rejected: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  join_cancelled: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const notificationColors: Record<string, string> = {
  join_apply: 'bg-blue-100 text-blue-600',
  join_approved: 'bg-green-100 text-green-600',
  join_rejected: 'bg-red-100 text-red-600',
  join_cancelled: 'bg-yellow-100 text-yellow-600',
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return '방금 전'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}일 전`
  }

  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export default function NotificationList({ notifications }: NotificationListProps) {
  const router = useRouter()

  const handleClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleClick(notification)}
          className={`
            card p-4 cursor-pointer transition-all
            ${notification.is_read ? 'bg-white' : 'bg-primary/5 border-primary/20'}
            hover:shadow-md
          `}
        >
          <div className="flex items-start gap-4">
            {/* 아이콘 */}
            <div className={`p-2 rounded-full ${notificationColors[notification.type] || 'bg-gray-100 text-gray-600'}`}>
              {notificationIcons[notification.type] || (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              )}
            </div>

            {/* 내용 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-medium ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                  {notification.title}
                </h3>
                {!notification.is_read && (
                  <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                )}
              </div>
              {notification.message && (
                <p className="text-sm text-muted line-clamp-2">{notification.message}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {formatTimeAgo(notification.created_at)}
              </p>
            </div>

            {/* 화살표 */}
            {notification.link && (
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
