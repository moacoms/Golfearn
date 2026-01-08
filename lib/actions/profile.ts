'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  height: number | null
  golf_started_at: string | null
  average_score: number | null
  location: string | null
  created_at: string
}

// 프로필 조회
export async function getProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data as Profile
}

// 프로필 업데이트
export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const username = formData.get('username') as string
  const full_name = formData.get('full_name') as string
  const height = formData.get('height') ? parseInt(formData.get('height') as string) : null
  const golf_started_at = formData.get('golf_started_at') as string || null
  const average_score = formData.get('average_score') ? parseInt(formData.get('average_score') as string) : null
  const location = formData.get('location') as string || null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .upsert({
      id: user.id,
      username,
      full_name,
      height,
      golf_started_at,
      average_score,
      location,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Error updating profile:', error)
    return { error: '프로필 수정에 실패했습니다.' }
  }

  revalidatePath('/mypage')
  revalidatePath('/mypage/profile')
  return { success: true }
}

// 내 게시글 조회
export async function getMyPosts() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching my posts:', error)
    return []
  }

  return data
}

// 내 상품 조회
export async function getMyProducts() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching my products:', error)
    return []
  }

  return data
}

// 찜한 상품 조회
export async function getMyFavorites() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('favorites')
    .select(`
      id,
      product_id,
      products (
        id,
        title,
        price,
        condition,
        location,
        images,
        status
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching my favorites:', error)
    return []
  }

  return data
}
