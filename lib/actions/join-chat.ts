'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type JoinMessage = {
  id: number
  join_post_id: number
  user_id: string
  content: string
  created_at: string
  profiles?: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
}

// 조인 채팅 메시지 조회
export async function getJoinMessages(joinPostId: number): Promise<JoinMessage[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('join_messages')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('join_post_id', joinPostId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching join messages:', error)
    return []
  }

  return data as JoinMessage[]
}

// 조인 채팅 메시지 전송
export async function sendJoinMessage(
  joinPostId: number,
  content: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  if (!content.trim()) {
    return { error: '메시지를 입력해주세요.' }
  }

  // 권한 확인: 호스트이거나 승인된 참가자인지 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: post } = await (supabase as any)
    .from('join_posts')
    .select('user_id')
    .eq('id', joinPostId)
    .single()

  if (!post) {
    return { error: '조인 게시글을 찾을 수 없습니다.' }
  }

  const isHost = post.user_id === user.id

  if (!isHost) {
    // 승인된 참가자인지 확인
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: participant } = await (supabase as any)
      .from('join_participants')
      .select('status')
      .eq('join_post_id', joinPostId)
      .eq('user_id', user.id)
      .single()

    if (!participant || participant.status !== 'approved') {
      return { error: '채팅 권한이 없습니다.' }
    }
  }

  // 메시지 저장
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('join_messages')
    .insert({
      join_post_id: joinPostId,
      user_id: user.id,
      content: content.trim(),
    })

  if (error) {
    console.error('Error sending join message:', error)
    return { error: '메시지 전송에 실패했습니다.' }
  }

  revalidatePath(`/join/${joinPostId}`)
  return { success: true }
}

// 조인 채팅 읽음 시간 업데이트
export async function updateJoinChatReadTime(
  joinPostId: number
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('join_chat_reads')
    .upsert({
      join_post_id: joinPostId,
      user_id: user.id,
      last_read_at: new Date().toISOString(),
    }, {
      onConflict: 'join_post_id,user_id',
    })

  if (error) {
    console.error('Error updating read time:', error)
    return { error: '읽음 처리에 실패했습니다.' }
  }

  return { success: true }
}

// 조인 채팅 안읽은 메시지 수 조회
export async function getJoinUnreadCount(joinPostId: number): Promise<number> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return 0
  }

  // 마지막 읽은 시간 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: readInfo } = await (supabase as any)
    .from('join_chat_reads')
    .select('last_read_at')
    .eq('join_post_id', joinPostId)
    .eq('user_id', user.id)
    .single()

  const lastReadAt = readInfo?.last_read_at || '1970-01-01'

  // 읽지 않은 메시지 수 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count, error } = await (supabase as any)
    .from('join_messages')
    .select('*', { count: 'exact', head: true })
    .eq('join_post_id', joinPostId)
    .neq('user_id', user.id)
    .gt('created_at', lastReadAt)

  if (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }

  return count || 0
}

// 채팅 권한 확인
export async function checkJoinChatAccess(joinPostId: number): Promise<{
  hasAccess: boolean
  isHost: boolean
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { hasAccess: false, isHost: false }
  }

  // 호스트인지 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: post } = await (supabase as any)
    .from('join_posts')
    .select('user_id')
    .eq('id', joinPostId)
    .single()

  if (!post) {
    return { hasAccess: false, isHost: false }
  }

  if (post.user_id === user.id) {
    return { hasAccess: true, isHost: true }
  }

  // 승인된 참가자인지 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: participant } = await (supabase as any)
    .from('join_participants')
    .select('status')
    .eq('join_post_id', joinPostId)
    .eq('user_id', user.id)
    .single()

  if (participant?.status === 'approved') {
    return { hasAccess: true, isHost: false }
  }

  return { hasAccess: false, isHost: false }
}
