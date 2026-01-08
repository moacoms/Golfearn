'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type PostWithAuthor = {
  id: number
  category: string
  title: string
  content: string
  view_count: number
  created_at: string
  updated_at: string
  user_id: string
  profiles: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
  comment_count?: number
}

// 게시글 목록 조회
export async function getPosts(category?: string, search?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('posts')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  // 검색어 필터 (제목 또는 내용에서 검색)
  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }

  return data as PostWithAuthor[]
}

// 게시글 상세 조회
export async function getPost(id: number) {
  const supabase = await createClient()

  // 조회수 증가
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).rpc('increment_post_view', { post_id: id })

  const { data, error } = await supabase
    .from('posts')
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
    console.error('Error fetching post:', error)
    return null
  }

  return data as PostWithAuthor
}

// 게시글 작성
export async function createPost(formData: FormData): Promise<{ error?: string; data?: { id: number } }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const category = formData.get('category') as string

  if (!title || !content || !category) {
    return { error: '모든 필드를 입력해주세요.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('posts')
    .insert({
      user_id: user.id,
      title,
      content,
      category,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating post:', error)
    return { error: '게시글 작성에 실패했습니다.' }
  }

  revalidatePath('/community')
  return { data: { id: data.id } }
}

// 게시글 수정
export async function updatePost(id: number, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const category = formData.get('category') as string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('posts')
    .update({ title, content, category })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating post:', error)
    return { error: '게시글 수정에 실패했습니다.' }
  }

  revalidatePath('/community')
  revalidatePath(`/community/${id}`)
  return { success: true }
}

// 게시글 삭제
export async function deletePost(id: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting post:', error)
    return { error: '게시글 삭제에 실패했습니다.' }
  }

  revalidatePath('/community')
  return { success: true }
}

// 댓글 조회
export async function getComments(postId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  return data
}

// 댓글 작성
export async function createComment(postId: number, content: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  if (!content.trim()) {
    return { error: '댓글 내용을 입력해주세요.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content,
    })

  if (error) {
    console.error('Error creating comment:', error)
    return { error: '댓글 작성에 실패했습니다.' }
  }

  revalidatePath(`/community/${postId}`)
  return { success: true }
}

// 댓글 삭제
export async function deleteComment(commentId: number, postId: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting comment:', error)
    return { error: '댓글 삭제에 실패했습니다.' }
  }

  revalidatePath(`/community/${postId}`)
  return { success: true }
}
