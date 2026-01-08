import Link from 'next/link'
import { getProducts, ProductWithSeller } from '@/lib/actions/products'
import { formatPrice } from '@/lib/utils'
import MarketFilters from './MarketFilters'

const categories = [
  { id: 'all', name: '전체' },
  { id: 'driver', name: '드라이버' },
  { id: 'iron', name: '아이언' },
  { id: 'putter', name: '퍼터' },
  { id: 'wedge', name: '웨지' },
  { id: 'set', name: '풀세트' },
  { id: 'etc', name: '기타' },
]

function ProductCard({ product }: { product: ProductWithSeller }) {
  const hasImage = product.images && product.images.length > 0

  return (
    <Link href={`/market/${product.id}`}>
      <article className="card p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images![0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {product.status === 'reserved' && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded">
              예약중
            </div>
          )}
          {product.status === 'sold' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">판매완료</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
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
      </article>
    </Link>
  )
}

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string }>
}) {
  const params = await searchParams
  const products = await getProducts({
    category: params.category,
    status: params.status,
  })

  return (
    <div className="py-12">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">중고거래</h1>
            <p className="text-muted">골린이들끼리 믿고 거래하는 장터입니다</p>
          </div>
          <Link href="/market/sell" className="btn btn-primary">
            판매하기
          </Link>
        </div>

        {/* Filters */}
        <MarketFilters categories={categories} />

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted text-lg mb-4">아직 등록된 상품이 없습니다</p>
            <Link href="/market/sell" className="btn btn-primary">
              첫 상품 등록하기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
