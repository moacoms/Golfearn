// 사용자 이메일 정보 확인 스크립트
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Service role key를 사용하여 admin 권한 획득
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

async function checkUsers() {
  console.log('\n=== auth.users 테이블 확인 (Service Role) ===\n')
  
  // auth.users 데이터 확인 (admin 권한 필요)
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.error('❌ auth.users 조회 실패:', authError.message)
    console.log('\nService Role Key가 올바른지 확인해주세요.')
    return
  }
  
  console.log(`✅ auth.users 테이블에서 ${authData.users.length}명의 사용자를 찾았습니다.\n`)
  
  // 처음 5명의 사용자 이메일 표시
  console.log('=== 사용자 이메일 정보 (최대 5명) ===\n')
  authData.users.slice(0, 5).forEach((user, index) => {
    console.log(`${index + 1}. 사용자 ID: ${user.id}`)
    console.log(`   이메일: ${user.email || '❌ 이메일 없음'}`)
    console.log(`   전화번호: ${user.phone || '없음'}`)
    console.log(`   가입일: ${new Date(user.created_at).toLocaleDateString('ko-KR')}`)
    console.log(`   마지막 로그인: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('ko-KR') : '없음'}`)
    console.log('')
  })
  
  // profiles 테이블과 비교
  console.log('=== profiles 테이블과 비교 ===\n')
  
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (profilesError) {
    console.error('❌ profiles 조회 실패:', profilesError)
    return
  }
  
  console.log(`profiles 테이블: ${profiles.length}개`)
  console.log(`auth.users 테이블: ${authData.users.length}개\n`)
  
  // 이메일이 있는 사용자 수 계산
  const usersWithEmail = authData.users.filter(u => u.email).length
  const usersWithPhone = authData.users.filter(u => u.phone).length
  
  console.log(`📧 이메일이 있는 사용자: ${usersWithEmail}명`)
  console.log(`📱 전화번호가 있는 사용자: ${usersWithPhone}명\n`)
  
  // 프로필이 있지만 auth.users에 없는 경우
  const orphanedProfiles = profiles.filter(profile => 
    !authData.users.find(u => u.id === profile.id)
  )
  
  if (orphanedProfiles.length > 0) {
    console.log(`⚠️  auth.users에 없는 프로필: ${orphanedProfiles.length}개`)
    orphanedProfiles.forEach(p => {
      console.log(`   - ${p.id}: ${p.full_name || '이름 없음'}`)
    })
    console.log('')
  }
  
  // auth.users에 있지만 프로필이 없는 경우
  const missingProfiles = authData.users.filter(user => 
    !profiles.find(p => p.id === user.id)
  )
  
  if (missingProfiles.length > 0) {
    console.log(`⚠️  프로필이 없는 사용자: ${missingProfiles.length}명`)
    missingProfiles.forEach(u => {
      console.log(`   - ${u.id}: ${u.email}`)
    })
  }
  
  // 관리자 확인
  const adminProfiles = profiles.filter(p => p.is_admin)
  console.log(`\n👑 관리자 수: ${adminProfiles.length}명`)
  adminProfiles.forEach(admin => {
    const authUser = authData.users.find(u => u.id === admin.id)
    console.log(`   - ${admin.full_name || '이름 없음'}: ${authUser?.email || '이메일 없음'}`)
  })
  
  // 레슨프로 확인
  const proProfiles = profiles.filter(p => p.is_lesson_pro)
  console.log(`\n🏌️ 레슨프로 수: ${proProfiles.length}명`)
  proProfiles.forEach(pro => {
    const authUser = authData.users.find(u => u.id === pro.id)
    console.log(`   - ${pro.full_name || '이름 없음'}: ${authUser?.email || '이메일 없음'}`)
  })
}

checkUsers().catch(error => {
  console.error('\n❌ 스크립트 실행 중 오류:', error.message)
  console.log('\n환경변수를 확인해주세요:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
})