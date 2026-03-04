// 회원 검색 API 테스트
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function testSearch(searchQuery) {
  console.log(`\n=== "${searchQuery}" 검색 테스트 ===\n`)
  
  // auth.users에서 이메일로 검색
  const { data: authData } = await supabase.auth.admin.listUsers()
  
  // profiles 테이블에서 이름으로 검색
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
  
  if (!profiles || !authData?.users) {
    console.log('데이터 조회 실패')
    return
  }
  
  // 검색 쿼리와 매칭 (이름 또는 이메일)
  const searchLower = searchQuery.toLowerCase()
  const matchedUsers = profiles.filter((profile) => {
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
  }).map((profile) => {
    const authUser = authData.users.find(u => u.id === profile.id)
    return {
      ...profile,
      email: authUser?.email || null
    }
  })
  
  console.log(`검색 결과: ${matchedUsers.length}개\n`)
  matchedUsers.forEach(user => {
    console.log(`- ${user.full_name || '이름 없음'} (${user.email || '이메일 없음'})`)
    console.log(`  ID: ${user.id}`)
  })
}

// 다양한 검색어로 테스트
async function runTests() {
  await testSearch('hdopen')     // 이메일 일부로 검색
  await testSearch('다희')       // 이름 일부로 검색
  await testSearch('골')         // 이름 일부로 검색
  await testSearch('naver')      // 이메일 도메인으로 검색
  await testSearch('gmail')      // 이메일 도메인으로 검색
}

runTests().catch(console.error)