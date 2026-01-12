import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProduct, checkFavorite } from '@/lib/actions/products'
import { formatPrice, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import ProductActions from './ProductActions'
import ProductImageGallery from './ProductImageGallery'
import FavoriteButton from './FavoriteButton'
import ChatButton from './ChatButton'
import ProductLocation from './ProductLocation'

const categories: { [key: string]: string } = {
  driver: '드라이버',
  iron: '아이언',
  putter: '퍼터',
  wedge: '웨지',
  set: '풀세트',
  etc: '기타',
}

const conditions: { [key: string]: string } = {
  S: 'S급 (거의 새것)',
  A: 'A급 (상태 좋음)',
  B: 'B급 (사용감 있음)',
  C: 'C급 (사용감 많음)',
}

const statusLabels: { [key: string]: { text: string; color: string } } = {
  selling: { text: '판매중', color: 'bg-green-500' },
  reserved: { text: '예약중', color: 'bg-yellow-500' },
  sold: { text: '판매완료', color: 'bg-gray-500' },
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const productId = parseInt(id)

  if (isNaN(productId)) {
    notFound()
  }

  const product = await getProduct(productId)

  if (!product) {
    notFound()
  }

  // 현재 사용자 확인
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === product.user_id

  // 찜 여부 확인
  const { isFavorite } = await checkFavorite(productId)

  const statusInfo = statusLabels[product.status] || statusLabels.selling

  return (
    <div className="py-12">
      <div className="container max-w-5xl">
        {/* 뒤로가기 */}
        <Link
          href="/market"
          className="inline-flex items-center gap-2 text-muted hover:text-primary mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 이미지 갤러리 */}
          <ProductImageGallery images={product.images} title={product.title} />

          {/* 상품 정보 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {categories[product.category] || product.category}
              </span>
              <span className={`px-3 py-1 ${statusInfo.color} text-white rounded-full text-sm font-medium`}>
                {statusInfo.text}
              </span>
            </div>

            <h1 className="text-2xl font-bold mb-4">{product.title}</h1>

            <p className="text-3xl font-bold text-primary mb-6">
              {formatPrice(product.price)}
            </p>

            {/* 상품 상세 정보 */}
            <div className="space-y-3 mb-6">
              {product.condition && (
                <div className="flex items-center gap-3">
                  <span className="text-muted w-20">상태</span>
                  <span className="font-medium">{conditions[product.condition] || product.condition}</span>
                </div>
              )}
              {product.location && (
                <div className="flex items-center gap-3">
                  <span className="text-muted w-20">지역</span>
                  <span className="font-medium">{product.location}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-muted w-20">등록일</span>
                <span className="font-medium">{formatDate(product.created_at)}</span>
              </div>
            </div>

            {/* 판매자 정보 */}
            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">
                    {product.profiles?.username || product.profiles?.full_name || '판매자'}
                  </p>
                  <p className="text-sm text-muted">판매자</p>
                </div>
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="flex gap-3">
              {isOwner ? (
                <ProductActions productId={productId} currentStatus={product.status} />
              ) : (
                <>
                  <FavoriteButton productId={productId} initialIsFavorite={isFavorite} />
                  <ChatButton productId={productId} sellerId={product.user_id} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* 상품 설명 */}
        {product.description && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">상품 설명</h2>
            <div className="card">
              <p className="whitespace-pre-wrap">{product.description}</p>
            </div>
          </div>
        )}

        {/* 거래 희망 장소 */}
        {(product.latitude || product.location) && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">거래 희망 장소</h2>
            <ProductLocation
              latitude={product.latitude}
              longitude={product.longitude}
              address={product.location}
            />
          </div>
        )}
      </div>
    </div>
  )
}
