'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ChatRoom = {
  product_id: number
  other_user_id: string
  other_user: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
  product: {
    id: number
    title: string
    price: number
    images: string[] | null
    status: string
  } | null
  last_message: {
    content: string
    created_at: string
    is_read: boolean
    sender_id: string
  } | null
  unread_count: number
}

export type Message = {
  id: number
  product_id: number
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
  sender?: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
}

// 채팅방 목록 조회
export async function getChatRooms(): Promise<ChatRoom[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // 내가 참여한 모든 메시지에서 unique한 (product_id, other_user_id) 조합 찾기
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: messages, error } = await (supabase as any)
    .from('messages')
    .select(`
      product_id,
      sender_id,
      receiver_id,
      content,
      created_at,
      is_read,
      products (
        id,
        title,
        price,
        images,
        status
      )
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error || !messages) {
    console.error('Error fetching chat rooms:', error)
    return []
  }

  // 채팅방별로 그룹화
  const roomsMap = new Map<string, ChatRoom>()

  for (const msg of messages) {
    const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
    const roomKey = `${msg.product_id}-${otherUserId}`

    if (!roomsMap.has(roomKey)) {
      // 상대방 프로필 조회
      const { data: otherUser } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', otherUserId)
        .single()

      // 안읽은 메시지 수 계산
      const unreadCount = messages.filter(
        (m: Message) =>
          m.product_id === msg.product_id &&
          m.sender_id === otherUserId &&
          m.receiver_id === user.id &&
          !m.is_read
      ).length

      roomsMap.set(roomKey, {
        product_id: msg.product_id,
        other_user_id: otherUserId,
        other_user: otherUser,
        product: msg.products,
        last_message: {
          content: msg.content,
          created_at: msg.created_at,
          is_read: msg.is_read,
          sender_id: msg.sender_id,
        },
        unread_count: unreadCount,
      })
    }
  }

  return Array.from(roomsMap.values())
}

// 특정 상품의 채팅 메시지 조회
export async function getMessages(productId: number, otherUserId: string): Promise<Message[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('product_id', productId)
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data as Message[]
}

// 메시지 전송
export async function sendMessage(productId: number, receiverId: string, content: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  if (!content.trim()) {
    return { error: '메시지를 입력해주세요.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('messages')
    .insert({
      product_id: productId,
      sender_id: user.id,
      receiver_id: receiverId,
      content: content.trim(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return { error: '메시지 전송에 실패했습니다.' }
  }

  revalidatePath('/mypage/messages')
  return { success: true, data }
}

// 메시지 읽음 처리
export async function markMessagesAsRead(productId: number, senderId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('messages')
    .update({ is_read: true })
    .eq('product_id', productId)
    .eq('sender_id', senderId)
    .eq('receiver_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('Error marking messages as read:', error)
    return { error: '읽음 처리에 실패했습니다.' }
  }

  return { success: true }
}

// 채팅 시작 (첫 메시지 없이 채팅방 생성용)
export async function startChat(productId: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.', redirect: '/login' }
  }

  // 상품 정보 및 판매자 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: product, error: productError } = await (supabase as any)
    .from('products')
    .select('user_id')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    return { error: '상품을 찾을 수 없습니다.' }
  }

  if (product.user_id === user.id) {
    return { error: '본인 상품에는 채팅할 수 없습니다.' }
  }

  return {
    success: true,
    data: {
      productId,
      sellerId: product.user_id,
    },
  }
}
