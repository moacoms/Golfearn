'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  getJoinMessages,
  sendJoinMessage,
  checkJoinChatAccess,
  updateJoinChatReadTime,
  JoinMessage,
} from '@/lib/actions/join-chat'

type JoinPost = {
  id: number
  title: string
  golf_course_name: string
  round_date: string
  round_time: string
  status: string
}

export default function JoinChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [joinPostId, setJoinPostId] = useState<number>(0)
  const [messages, setMessages] = useState<JoinMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [joinPost, setJoinPost] = useState<JoinPost | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // 초기 데이터 로드
  useEffect(() => {
    const init = async () => {
      const { id } = await params
      const postId = parseInt(id)
      setJoinPostId(postId)

      if (isNaN(postId)) {
        router.push('/join')
        return
      }

      // 현재 사용자 확인
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setCurrentUserId(user.id)

      // 채팅 권한 확인
      const accessResult = await checkJoinChatAccess(postId)
      if (!accessResult.hasAccess) {
        router.push(`/join/${postId}`)
        return
      }
      setHasAccess(true)

      // 조인 정보 로드
      const { data: postData } = await supabase
        .from('join_posts')
        .select('id, title, golf_course_name, round_date, round_time, status')
        .eq('id', postId)
        .single()

      if (postData) {
        setJoinPost(postData as JoinPost)
      }

      // 메시지 로드
      const loadedMessages = await getJoinMessages(postId)
      setMessages(loadedMessages)

      // 읽음 처리
      await updateJoinChatReadTime(postId)

      setIsLoading(false)
    }

    init()
  }, [params, router, supabase])

  // 실시간 구독
  useEffect(() => {
    if (!joinPostId || !currentUserId || !hasAccess) return

    const channel = supabase
      .channel(`join_messages:${joinPostId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'join_messages',
          filter: `join_post_id=eq.${joinPostId}`,
        },
        async (payload) => {
          const newMsg = payload.new as JoinMessage

          // 프로필 정보 가져오기
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('id', newMsg.user_id)
            .single()

          setMessages((prev) => [...prev, { ...newMsg, profiles: profile }])

          // 읽음 처리
          await updateJoinChatReadTime(joinPostId)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [joinPostId, currentUserId, hasAccess, supabase])

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const result = await sendJoinMessage(joinPostId, newMessage)

    if (!result.error) {
      setNewMessage('')
    }
    setIsSending(false)
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatRoundDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-muted">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <Link
          href={`/join/${joinPostId}`}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">{joinPost?.title || '조인 채팅'}</h1>
          {joinPost && (
            <p className="text-sm text-muted truncate">
              {formatRoundDate(joinPost.round_date)} {joinPost.round_time.slice(0, 5)} · {joinPost.golf_course_name}
            </p>
          )}
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted py-10">
            <p>아직 대화가 없습니다.</p>
            <p className="text-sm mt-1">첫 메시지를 보내보세요!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMyMessage = message.user_id === currentUserId
            return (
              <div
                key={message.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                {/* 상대방 아바타 */}
                {!isMyMessage && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mr-2 overflow-hidden">
                    {message.profiles?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={message.profiles.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                )}

                <div className={`max-w-[70%] ${isMyMessage ? 'order-2' : ''}`}>
                  {/* 발신자 이름 (상대방 메시지인 경우) */}
                  {!isMyMessage && (
                    <p className="text-xs text-gray-500 mb-1">
                      {message.profiles?.username || message.profiles?.full_name || '익명'}
                    </p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isMyMessage
                        ? 'bg-primary text-white rounded-br-md'
                        : 'bg-white border rounded-bl-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <p className={`text-xs text-muted mt-1 ${isMyMessage ? 'text-right' : ''}`}>
                    {formatMessageTime(message.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <form onSubmit={handleSend} className="bg-white border-t p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요"
            className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:border-primary"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
