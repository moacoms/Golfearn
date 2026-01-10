'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ProductWithSeller = {
  id: number
  category: string
  title: string
  description: string | null
  price: number
  condition: string | null
  images: string[] | null
  status: string
  location: string | null
  location_dong: string | null
  location_gu: string | null
  location_city: string | null
  location_lat: number | null
  location_lng: number | null
  created_at: string
  user_id: string
  profiles: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
    location_dong: string | null
    location_gu: string | null
  } | null
  distance?: number // 계산된 거리 (km)
}

// Haversine 거리 계산 (km)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // 지구 반지름 (km)
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// 상품 목록 조회
export async function getProducts(filters?: {
  category?: string
  status?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  location?: {
    lat: number
    lng: number
    range: number
  }
}) {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url,
        location_dong,
        location_gu
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.minPrice) {
    query = query.gte('price', filters.minPrice)
  }

  if (filters?.maxPrice) {
    query = query.lte('price', filters.maxPrice)
  }

  // 검색어 필터 (제목 또는 설명에서 검색)
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  let products = data as ProductWithSeller[]

  // 위치 기반 필터링 및 거리 계산
  if (filters?.location) {
    const { lat, lng, range } = filters.location

    products = products
      .map((product) => {
        // 상품 위치가 없으면 판매자 프로필에서 가져오기 시도
        const productLat = product.location_lat
        const productLng = product.location_lng

        if (productLat && productLng) {
          const distance = calculateDistance(lat, lng, productLat, productLng)
          return { ...product, distance }
        }

        return { ...product, distance: undefined }
      })
      .filter((product) => {
        // 위치 정보가 있고 범위 내인 상품만
        if (product.distance !== undefined) {
          return product.distance <= range
        }
        // 위치 정보가 없는 상품도 포함 (전국 매물)
        return true
      })
      .sort((a, b) => {
        // 거리순 정렬 (가까운 것 먼저, 위치 없는 것은 뒤로)
        if (a.distance === undefined && b.distance === undefined) return 0
        if (a.distance === undefined) return 1
        if (b.distance === undefined) return -1
        return a.distance - b.distance
      })
  }

  return products
}

// 상품 상세 조회
export async function getProduct(id: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data as ProductWithSeller
}

// 상품 등록
export async function createProduct(formData: FormData): Promise<{ error?: string; data?: { id: number } }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const price = parseInt(formData.get('price') as string)
  const condition = formData.get('condition') as string
  const location = formData.get('location') as string
  const imagesJson = formData.get('images') as string
  const images = imagesJson ? JSON.parse(imagesJson) : []

  // 위치 정보
  const locationAddress = formData.get('location_address') as string || null
  const locationDong = formData.get('location_dong') as string || null
  const locationGu = formData.get('location_gu') as string || null
  const locationCity = formData.get('location_city') as string || null
  const locationLat = formData.get('location_lat') as string
  const locationLng = formData.get('location_lng') as string
  const useSellerLocation = formData.get('use_seller_location') === 'true'

  if (!title || !category || !price) {
    return { error: '필수 항목을 모두 입력해주세요.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('products')
    .insert({
      user_id: user.id,
      title,
      description,
      category,
      price,
      condition,
      location,
      images,
      location_address: locationAddress,
      location_dong: locationDong,
      location_gu: locationGu,
      location_city: locationCity,
      location_lat: locationLat ? parseFloat(locationLat) : null,
      location_lng: locationLng ? parseFloat(locationLng) : null,
      use_seller_location: useSellerLocation,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return { error: '상품 등록에 실패했습니다.' }
  }

  revalidatePath('/market')
  return { data: { id: data.id } }
}

// 상품 수정
export async function updateProduct(id: number, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const price = parseInt(formData.get('price') as string)
  const condition = formData.get('condition') as string
  const location = formData.get('location') as string
  const imagesJson = formData.get('images') as string
  const images = imagesJson ? JSON.parse(imagesJson) : []

  // 위치 정보
  const locationAddress = formData.get('location_address') as string || null
  const locationDong = formData.get('location_dong') as string || null
  const locationGu = formData.get('location_gu') as string || null
  const locationCity = formData.get('location_city') as string || null
  const locationLat = formData.get('location_lat') as string
  const locationLng = formData.get('location_lng') as string
  const useSellerLocation = formData.get('use_seller_location') === 'true'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('products')
    .update({
      title,
      description,
      category,
      price,
      condition,
      location,
      images,
      location_address: locationAddress,
      location_dong: locationDong,
      location_gu: locationGu,
      location_city: locationCity,
      location_lat: locationLat ? parseFloat(locationLat) : null,
      location_lng: locationLng ? parseFloat(locationLng) : null,
      use_seller_location: useSellerLocation,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating product:', error)
    return { error: '상품 수정에 실패했습니다.' }
  }

  revalidatePath('/market')
  revalidatePath(`/market/${id}`)
  return { success: true }
}

// 상품 상태 변경
export async function updateProductStatus(id: number, status: 'selling' | 'reserved' | 'sold') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('products')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating product status:', error)
    return { error: '상태 변경에 실패했습니다.' }
  }

  revalidatePath('/market')
  revalidatePath(`/market/${id}`)
  return { success: true }
}

// 상품 삭제
export async function deleteProduct(id: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting product:', error)
    return { error: '상품 삭제에 실패했습니다.' }
  }

  revalidatePath('/market')
  return { success: true }
}

// 이미지 업로드
export async function uploadProductImage(file: File): Promise<{ error?: string; url?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('products')
    .upload(fileName, file)

  if (error) {
    console.error('Error uploading image:', error)
    return { error: '이미지 업로드에 실패했습니다.' }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(fileName)

  return { url: publicUrl }
}

// 찜하기/취소
export async function toggleFavorite(productId: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // 찜 여부 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('favorites')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // 찜 취소
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('favorites')
      .delete()
      .eq('id', existing.id)

    if (error) {
      console.error('Error removing favorite:', error)
      return { error: '찜 취소에 실패했습니다.' }
    }

    return { success: true, isFavorite: false }
  } else {
    // 찜하기
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('favorites')
      .insert({
        product_id: productId,
        user_id: user.id,
      })

    if (error) {
      console.error('Error adding favorite:', error)
      return { error: '찜하기에 실패했습니다.' }
    }

    return { success: true, isFavorite: true }
  }
}

// 찜 여부 확인
export async function checkFavorite(productId: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { isFavorite: false }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('favorites')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .single()

  return { isFavorite: !!data }
}
