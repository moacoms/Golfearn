'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getMessages, sendMessage, markMessagesAsRead, Message } from '@/lib/actions/chat'
import { formatPrice } from '@/lib/utils'

type Product = {
  id: number
  title: string
  price: number
  images: string[] | null
  status: string
}

type OtherUser = {
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

export default function ChatRoomPage({
  params,
}: {
  params: Promise<{ productId: string; userId: string }>
}) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [productId, setProductId] = useState<number>(0)
  const [otherUserId, setOtherUserId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // 초기 데이터 로드
  useEffect(() => {
    const init = async () => {
      const { productId: pId, userId: uId } = await params
      const numProductId = parseInt(pId)
      setProductId(numProductId)
      setOtherUserId(uId)

      // 현재 사용자 확인
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setCurrentUserId(user.id)

      // 상품 정보 로드
      const { data: productData } = await supabase
        .from('products')
        .select('id, title, price, images, status')
        .eq('id', numProductId)
        .single()

      if (productData) {
        setProduct(productData as Product)
      }

      // 상대방 정보 로드
      const { data: userData } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', uId)
        .single()

      if (userData) {
        setOtherUser(userData as OtherUser)
      }

      // 메시지 로드
      const loadedMessages = await getMessages(numProductId, uId)
      setMessages(loadedMessages)

      // 읽음 처리
      await markMessagesAsRead(numProductId, uId)

      setIsLoading(false)
    }

    init()
  }, [params, router, supabase])

  // 실시간 구독
  useEffect(() => {
    if (!productId || !currentUserId || !otherUserId) return

    const channel = supabase
      .channel(`messages:${productId}:${currentUserId}:${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `product_id=eq.${productId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message
          // 이 채팅방 관련 메시지인지 확인
          if (
            (newMsg.sender_id === currentUserId && newMsg.receiver_id === otherUserId) ||
            (newMsg.sender_id === otherUserId && newMsg.receiver_id === currentUserId)
          ) {
            // 보낸 사람 정보 추가
            const { data: senderData } = await supabase
              .from('profiles')
              .select('username, full_name, avatar_url')
              .eq('id', newMsg.sender_id)
              .single()

            setMessages((prev) => [...prev, { ...newMsg, sender: senderData }])

            // 상대방이 보낸 메시지면 읽음 처리
            if (newMsg.sender_id === otherUserId) {
              await markMessagesAsRead(productId, otherUserId)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [productId, currentUserId, otherUserId, supabase])

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const result = await sendMessage(productId, otherUserId, newMessage)

    if (!result.error) {
      setNewMessage('')
    }
    setIsSending(false)
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
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
          href="/mypage/messages"
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">
            {otherUser?.username || otherUser?.full_name || '알 수 없음'}
          </h1>
          {product && (
            <p className="text-sm text-muted truncate">{product.title}</p>
          )}
        </div>
      </div>

      {/* 상품 정보 */}
      {product && (
        <Link
          href={`/market/${product.id}`}
          className="bg-white border-b px-4 py-3 flex items-center gap-3 hover:bg-gray-50"
        >
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {product.images && product.images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {product.status !== 'selling' && (
                <span className={`text-xs px-2 py-0.5 rounded ${
                  product.status === 'sold'
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {product.status === 'sold' ? '판매완료' : '예약중'}
                </span>
              )}
              <span className="text-sm truncate">{product.title}</span>
            </div>
            <p className="font-semibold">{formatPrice(product.price)}</p>
          </div>
          <svg className="w-5 h-5 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted py-10">
            <p>아직 대화가 없습니다.</p>
            <p className="text-sm mt-1">첫 메시지를 보내보세요!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMyMessage = message.sender_id === currentUserId
            return (
              <div
                key={message.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isMyMessage ? 'order-2' : ''}`}>
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
