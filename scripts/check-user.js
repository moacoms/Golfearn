// 현재 사용자 정보 확인 스크립트
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkUsers() {
  // 모든 프로필 조회
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('\n=== 최근 가입한 사용자 10명 ===\n')
  profiles.forEach((profile, index) => {
    console.log(`${index + 1}. ${profile.full_name || profile.avatar_url || 'User ' + (index + 1)}`)
    console.log(`   ID: ${profile.id}`)
    console.log(`   레슨프로: ${profile.is_lesson_pro ? '✅ YES' : '❌ NO'}`)
    console.log(`   관리자: ${profile.is_admin ? '✅ YES' : '❌ NO'}`)
    console.log(`   가입일: ${new Date(profile.created_at).toLocaleDateString('ko-KR')}`)
    console.log('')
  })

  // 레슨프로 수 확인
  const { count: proCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_lesson_pro', true)

  console.log(`총 레슨프로 수: ${proCount || 0}명\n`)
}

checkUsers()