import Link from 'next/link'
import Image from 'next/image'

const categories = [
  { id: 'all', name: '전체' },
  { id: 'driver', name: '드라이버' },
  { id: 'iron', name: '아이언' },
  { id: 'putter', name: '퍼터' },
  { id: 'wedge', name: '웨지' },
  { id: 'set', name: '풀세트' },
  { id: 'etc', name: '기타' },
]

const conditions = [
  { id: 'S', name: 'S급 (거의 새것)' },
  { id: 'A', name: 'A급 (상태 좋음)' },
  { id: 'B', name: 'B급 (사용감 있음)' },
  { id: 'C', name: 'C급 (사용감 많음)' },
]

const mockProducts = [
  {
    id: 1,
    title: '테일러메이드 스텔스2 드라이버 10.5도',
    price: 350000,
    condition: 'A',
    location: '서울 강남',
    imageUrl: '/images/placeholder.jpg',
    status: 'selling',
  },
  {
    id: 2,
    title: '캘러웨이 패러다임 아이언 5-PW',
    price: 800000,
    condition: 'S',
    location: '경기 성남',
    imageUrl: '/images/placeholder.jpg',
    status: 'selling',
  },
  {
    id: 3,
    title: '타이틀리스트 보키 웨지 52/56/60',
    price: 250000,
    condition: 'B',
    location: '서울 송파',
    imageUrl: '/images/placeholder.jpg',
    status: 'reserved',
  },
  {
    id: 4,
    title: '스코티캐머런 스페셜 셀렉트 퍼터',
    price: 450000,
    condition: 'A',
    location: '인천 연수',
    imageUrl: '/images/placeholder.jpg',
    status: 'selling',
  },
]

export default function MarketPage() {
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
        <div className="card mb-8">
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-2">카테고리</label>
              <select className="input">
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Condition Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-2">상태</label>
              <select className="input">
                <option value="">전체</option>
                {conditions.map((cond) => (
                  <option key={cond.id} value={cond.id}>{cond.name}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-2">가격대</label>
              <select className="input">
                <option value="">전체</option>
                <option value="0-100000">10만원 이하</option>
                <option value="100000-300000">10~30만원</option>
                <option value="300000-500000">30~50만원</option>
                <option value="500000-1000000">50~100만원</option>
                <option value="1000000-">100만원 이상</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-2">검색</label>
              <input
                type="text"
                placeholder="상품명 검색"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <Link key={product.id} href={`/market/${product.id}`}>
              <article className="card p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                {/* Image */}
                <div className="relative aspect-square bg-gray-100">
                  <div className="absolute inset-0 flex items-center justify-center text-muted">
                    이미지
                  </div>
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
                    {product.price.toLocaleString()}원
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <span className="px-2 py-0.5 bg-gray-100 rounded">
                      {product.condition}급
                    </span>
                    <span>{product.location}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
