import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getChatRooms } from '@/lib/actions/chat'
import { formatDate } from '@/lib/utils'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const chatRooms = await getChatRooms()

  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/mypage"
            className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            마이페이지
          </Link>
          <h1 className="text-3xl font-bold">채팅</h1>
        </div>

        {/* 채팅방 목록 */}
        {chatRooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">채팅 내역이 없습니다</h2>
            <p className="text-muted mb-6">
              중고거래 상품에서 채팅을 시작해보세요!
            </p>
            <Link href="/market" className="btn btn-outline">
              상품 둘러보기
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {chatRooms.map((room) => (
              <Link
                key={`${room.product_id}-${room.other_user_id}`}
                href={`/mypage/messages/${room.product_id}/${room.other_user_id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-lg border hover:border-primary transition-colors"
              >
                {/* 상품 이미지 */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {room.product?.images && room.product.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={room.product.images[0]}
                      alt={room.product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* 채팅 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">
                      {room.other_user?.username || room.other_user?.full_name || '알 수 없음'}
                    </span>
                    {room.unread_count > 0 && (
                      <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                        {room.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted truncate">
                    {room.product?.title}
                  </p>
                  {room.last_message && (
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {room.last_message.content}
                    </p>
                  )}
                </div>

                {/* 시간 & 상태 */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {room.last_message && (
                    <span className="text-xs text-muted">
                      {formatDate(room.last_message.created_at)}
                    </span>
                  )}
                  {room.product?.status !== 'selling' && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      room.product?.status === 'sold'
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {room.product?.status === 'sold' ? '판매완료' : '예약중'}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
