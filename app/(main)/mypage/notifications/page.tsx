import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getNotifications } from '@/lib/actions/notifications'
import NotificationList from './NotificationList'
import MarkAllReadButton from './MarkAllReadButton'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const notifications = await getNotifications(50)
  const hasUnread = notifications.some(n => !n.is_read)

  return (
    <div className="py-12">
      <div className="container max-w-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/mypage"
              className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              마이페이지
            </Link>
            <h1 className="text-3xl font-bold">알림</h1>
          </div>
          {hasUnread && <MarkAllReadButton />}
        </div>

        {/* 알림 목록 */}
        {notifications.length > 0 ? (
          <NotificationList notifications={notifications} />
        ) : (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-muted text-lg">알림이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
