'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type NotificationType = 'join_apply' | 'join_approved' | 'join_rejected' | 'join_cancelled'

export type Notification = {
  id: number
  user_id: string
  type: NotificationType
  title: string
  message: string | null
  link: string | null
  related_id: number | null
  is_read: boolean
  created_at: string
}

// 알림 조회
export async function getNotifications(limit: number = 20): Promise<Notification[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data as Notification[]
}

// 읽지 않은 알림 수 조회
export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return 0
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count, error } = await (supabase as any)
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }

  return count || 0
}

// 알림 읽음 처리
export async function markNotificationAsRead(notificationId: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error marking notification as read:', error)
    return { error: '알림 처리에 실패했습니다.' }
  }

  revalidatePath('/mypage/notifications')
  return { success: true }
}

// 모든 알림 읽음 처리
export async function markAllNotificationsAsRead(): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('Error marking all notifications as read:', error)
    return { error: '알림 처리에 실패했습니다.' }
  }

  revalidatePath('/mypage/notifications')
  return { success: true }
}

// 알림 생성 (내부 함수)
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message?: string,
  link?: string,
  relatedId?: number
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      link,
      related_id: relatedId,
    })

  if (error) {
    console.error('Error creating notification:', error)
    return { error: '알림 생성에 실패했습니다.' }
  }

  return { success: true }
}

// 조인 신청 알림 생성 (호스트에게)
export async function notifyJoinApplication(
  hostId: string,
  applicantName: string,
  joinPostId: number,
  joinPostTitle: string
): Promise<void> {
  await createNotification(
    hostId,
    'join_apply',
    '새로운 조인 신청',
    `${applicantName}님이 "${joinPostTitle}" 조인에 신청했습니다.`,
    `/join/${joinPostId}`,
    joinPostId
  )
}

// 조인 승인 알림 생성 (신청자에게)
export async function notifyJoinApproved(
  applicantId: string,
  joinPostId: number,
  joinPostTitle: string
): Promise<void> {
  await createNotification(
    applicantId,
    'join_approved',
    '조인 신청 승인',
    `"${joinPostTitle}" 조인 신청이 승인되었습니다.`,
    `/join/${joinPostId}`,
    joinPostId
  )
}

// 조인 거절 알림 생성 (신청자에게)
export async function notifyJoinRejected(
  applicantId: string,
  joinPostId: number,
  joinPostTitle: string
): Promise<void> {
  await createNotification(
    applicantId,
    'join_rejected',
    '조인 신청 거절',
    `"${joinPostTitle}" 조인 신청이 거절되었습니다.`,
    `/join/${joinPostId}`,
    joinPostId
  )
}
