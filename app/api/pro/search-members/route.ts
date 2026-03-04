import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.trim().length < 1) {
      return NextResponse.json({ users: [] })
    }

    // 일반 클라이언트로 현재 사용자 확인 (레슨프로인지)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 레슨프로 권한 확인
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('is_lesson_pro')
      .eq('id', user.id)
      .single()

    if (!profile?.is_lesson_pro) {
      return NextResponse.json({ error: 'Forbidden - Lesson Pro only' }, { status: 403 })
    }

    // Admin 클라이언트로 사용자 검색
    const adminClient = createAdminClient()
    
    // 1. auth.users에서 이메일로 검색
    const { data: authData } = await adminClient.auth.admin.listUsers()
    
    // 2. profiles 테이블에서 이름으로 검색
    const { data: profiles } = await (adminClient as any)
      .from('profiles')
      .select('id, full_name, avatar_url')
      
    if (!profiles || !authData?.users) {
      return NextResponse.json({ users: [] })
    }
    
    // 3. 검색 쿼리와 매칭 (이름 또는 이메일)
    const searchLower = query.toLowerCase()
    const matchedUsers = profiles.filter((profile: any) => {
      // 이름으로 검색
      if (profile.full_name && profile.full_name.toLowerCase().includes(searchLower)) {
        return true
      }
      
      // 이메일로 검색 (auth.users에서)
      const authUser = authData.users.find(u => u.id === profile.id)
      if (authUser?.email && authUser.email.toLowerCase().includes(searchLower)) {
        return true
      }
      
      return false
    }).map((profile: any) => {
      const authUser = authData.users.find(u => u.id === profile.id)
      return {
        ...profile,
        email: authUser?.email || null
      }
    })
    
    // 최대 10개까지만 반환
    const results = matchedUsers.slice(0, 10)
    
    return NextResponse.json({ users: results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}