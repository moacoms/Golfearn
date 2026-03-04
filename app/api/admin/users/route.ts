import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    // 일반 클라이언트로 현재 사용자 확인
    const supabase = await createClient()
    
    // 현재 사용자가 관리자인지 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Admin 클라이언트 사용하여 전체 사용자 데이터 가져오기
    const adminClient = createAdminClient()
    
    // 프로필 데이터 가져오기 (admin 클라이언트로 RLS 우회)
    const { data: profiles, error: profilesError } = await (adminClient as any)
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
    }

    // auth.users에서 이메일 정보 가져오기 (service role 필요)
    const { data: authData, error: authError } = await adminClient.auth.admin.listUsers()

    if (authError) {
      console.error('Error fetching auth users:', authError)
      // auth.users를 가져올 수 없어도 profiles는 반환
      return NextResponse.json(profiles || [])
    }

    // 디버깅을 위한 로그
    console.log('Auth users count:', authData?.users?.length || 0)
    console.log('Profiles count:', profiles?.length || 0)

    // 프로필과 auth 정보 병합
    const mergedUsers = (profiles || []).map((profile: any) => {
      const authUser = authData?.users?.find(u => u.id === profile.id)
      
      // 디버깅: 첫 번째 사용자의 이메일 확인
      const profilesArray = profiles as any[]
      if (profilesArray && profilesArray.indexOf(profile) === 0) {
        console.log('First user auth data:', authUser?.email || 'No email found')
      }
      
      return {
        ...profile,
        email: authUser?.email || null,
        last_sign_in_at: authUser?.last_sign_in_at || null,
        phone: authUser?.phone || null,
        created_at_auth: authUser?.created_at || null
      }
    })

    return NextResponse.json(mergedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}