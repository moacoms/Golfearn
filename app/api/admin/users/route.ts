import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // 현재 사용자가 관리자인지 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 프로필 데이터와 auth.users 데이터 조인
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    // auth.users에서 이메일 정보 가져오기
    // 이 부분은 서버 사이드에서 실행되므로 RLS를 우회할 수 있습니다
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers()

    // 프로필과 auth 정보 병합
    const mergedUsers = (profiles || []).map(profile => {
      const authUser = authUsers?.find(u => u.id === profile.id)
      return {
        ...profile,
        email: authUser?.email || null,
        last_sign_in_at: authUser?.last_sign_in_at || null,
        phone: authUser?.phone || null
      }
    })

    return NextResponse.json(mergedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}