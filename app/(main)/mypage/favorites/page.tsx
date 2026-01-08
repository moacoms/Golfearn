import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyFavorites } from '@/lib/actions/profile'
import { formatPrice } from '@/lib/utils'

type FavoriteWithProduct = {
  id: number
  product_id: number
  products: {
    id: number
    title: string
    price: number
    condition: string | null
    location: string | null
    images: string[] | null
    status: string
  } | null
}

const statusLabels: { [key: string]: { text: string; color: string } } = {
  selling: { text: '판매중', color: 'bg-green-500' },
  reserved: { text: '예약중', color: 'bg-yellow-500' },
  sold: { text: '판매완료', color: 'bg-gray-500' },
}

export default async function MyFavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const favorites = await getMyFavorites()

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
          <h1 className="text-3xl font-bold">관심 상품</h1>
        </div>

        {/* 상품 목록 */}
        {favorites.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {(favorites as FavoriteWithProduct[]).map((favorite) => {
              const product = favorite.products
              if (!product) return null

              const statusInfo = statusLabels[product.status] || statusLabels.selling
              const hasImage = product.images && product.images.length > 0

              return (
                <Link key={favorite.id} href={`/market/${product.id}`}>
                  <article className="card p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex">
                      {/* 이미지 */}
                      <div className="relative w-32 h-32 bg-gray-100 flex-shrink-0">
                        {hasImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.images![0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {product.status !== 'selling' && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className={`px-2 py-1 ${statusInfo.color} text-white text-xs rounded`}>
                              {statusInfo.text}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 정보 */}
                      <div className="flex-1 p-4">
                        <h2 className="font-medium truncate mb-1">{product.title}</h2>
                        <p className="text-lg font-bold text-primary mb-2">
                          {formatPrice(product.price)}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted">
                          {product.condition && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded">
                              {product.condition}급
                            </span>
                          )}
                          {product.location && <span>{product.location}</span>}
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted text-lg mb-4">찜한 상품이 없습니다</p>
            <Link href="/market" className="btn btn-primary">
              상품 둘러보기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
