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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')
  const display = searchParams.get('display') || '5'
  const sort = searchParams.get('sort') || 'sim' // sim: 정확도순, date: 날짜순, asc: 가격낮은순, dsc: 가격높은순

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
    const apiUrl = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=${display}&sort=${sort}`

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
      title: item.title.replace(/<[^>]*>/g, ''), // HTML 태그 제거
      lprice: parseInt(item.lprice) || 0,
      hprice: parseInt(item.hprice) || 0,
    }))

    return NextResponse.json({
      total: data.total,
      items: cleanedItems,
    })
  } catch (error) {
    console.error('Naver Shopping API Error:', error)
    return NextResponse.json(
      { error: '네이버 쇼핑 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
