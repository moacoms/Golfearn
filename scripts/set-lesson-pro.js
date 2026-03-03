// 특정 사용자를 레슨프로로 설정하는 스크립트
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setLessonPro() {
  // 관리자 계정(다희아빠)를 레슨프로로 설정
  const userId = '92d4bac6-4f8f-4d8b-8c4d-2ad25edd61cc' // 다희아빠 ID
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_lesson_pro: true,
      pro_certification: 'KPGA 티칭프로',
      pro_experience_years: 10,
      pro_specialties: ['드라이버', '아이언', '숏게임'],
      pro_introduction: '10년 경력의 티칭프로입니다. 초보자도 쉽게 배울 수 있도록 체계적인 레슨을 제공합니다.',
      pro_location: '서울 강남구',
      pro_phone: '010-1234-5678',
      pro_monthly_fee: 300000
    })
    .eq('id', userId)
    .select()

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('✅ 레슨프로 설정 완료!')
  console.log('설정된 사용자:', data[0])
  
  // 알림 설정 초기화
  const { error: notifError } = await supabase
    .from('pro_notification_settings')
    .upsert({
      pro_id: userId,
      email_enabled: true,
      sms_enabled: false,
      push_enabled: false,
      lesson_reminder: true,
      payment_reminder: true,
      package_expiry_reminder: true
    })
  
  if (notifError) {
    console.error('알림 설정 에러 (무시 가능):', notifError.message)
  } else {
    console.log('✅ 알림 설정 초기화 완료!')
  }
}

setLessonPro()