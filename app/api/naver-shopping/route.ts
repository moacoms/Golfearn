import { NextRequest, NextResponse } from 'next/server'

// 네이버 쇼핑 검색 API 응답 타입
interface NaverShoppingItem {
  title: string
  link: string
  image: string
  lprice: string
  hprice: string
  mallName: string
  productId: string
  productType: string
  brand: string
  maker: string
  category1: string
  category2: string
  category3: string
  category4: string
}

interface NaverShoppingResponse {
  lastBuildDate: string
  total: number
  start: number
  display: number
  items: NaverShoppingItem[]
}

// 부속품/악세서리 키워드 (필터링 대상)
const ACCESSORY_KEYWORDS = [
  '추', '웨이트', 'weight', '슬리브', 'sleeve', '어댑터', 'adapter',
  '그립', 'grip', '샤프트', 'shaft', '헤드커버', '커버', 'cover',
  '스티커', '렌치', '공구', '볼마커', '골프공', '골프볼', '장갑',
  '티', 'tee', '가방', '백', 'bag', '우산', '양말', '모자', '캡',
  '교체용', '리페어', '수리', '부품', '악세사리', '액세서리',
  '연습용', '스윙', '트레이너', '연습기', '퍼팅매트',
  '3g', '5g', '7g', '10g', '12g', '14g', '15g', '20g'
]

// 본품 확인을 위한 최소 가격 (원)
const MIN_CLUB_PRICES: Record<string, number> = {
  driver: 150000,
  wood: 100000,
  hybrid: 80000,
  iron: 300000,    // 아이언 세트
  wedge: 80000,
  putter: 80000,
  default: 100000
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')
  const display = searchParams.get('display') || '10' // 필터링을 위해 더 많이 가져옴
  const sort = searchParams.get('sort') || 'sim'
  const clubType = searchParams.get('clubType') || 'default'
  const minPrice = searchParams.get('minPrice')

  if (!query) {
    return NextResponse.json(
      { error: '검색어가 필요합니다.' },
      { status: 400 }
    )
  }

  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: '네이버 API 키가 설정되지 않았습니다.' },
      { status: 500 }
    )
  }

  try {
    // 더 많은 결과를 가져와서 필터링 후 반환
    const fetchCount = Math.min(parseInt(display) * 3, 30)
    const apiUrl = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=${fetchCount}&sort=${sort}`

    const response = await fetch(apiUrl, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Naver API Error:', errorText)
      return NextResponse.json(
        { error: '네이버 API 요청 실패' },
        { status: response.status }
      )
    }

    const data: NaverShoppingResponse = await response.json()

    // HTML 태그 제거 및 데이터 정제
    const cleanedItems = data.items.map((item) => ({
      ...item,
      title: item.title.replace(/<[^>]*>/g, ''),
      lprice: parseInt(item.lprice) || 0,
      hprice: parseInt(item.hprice) || 0,
    }))

    // 부속품 필터링
    const filteredItems = cleanedItems.filter((item) => {
      const titleLower = item.title.toLowerCase()

      // 1. 부속품 키워드가 포함된 상품 제외
      const isAccessory = ACCESSORY_KEYWORDS.some(keyword =>
        titleLower.includes(keyword.toLowerCase())
      )
      if (isAccessory) return false

      // 2. 최소 가격 체크 (본품은 일정 가격 이상)
      const minimumPrice = minPrice
        ? parseInt(minPrice)
        : MIN_CLUB_PRICES[clubType] || MIN_CLUB_PRICES.default
      if (item.lprice < minimumPrice) return false

      // 3. 카테고리 체크 (스포츠/레저 > 골프 카테고리인지)
      if (item.category1 && !item.category1.includes('스포츠')) return false

      return true
    })

    // 요청한 개수만큼 반환
    const resultItems = filteredItems.slice(0, parseInt(display))

    return NextResponse.json({
      total: data.total,
      filteredTotal: filteredItems.length,
      items: resultItems,
    })
  } catch (error) {
    console.error('Naver Shopping API Error:', error)
    return NextResponse.json(
      { error: '네이버 쇼핑 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
