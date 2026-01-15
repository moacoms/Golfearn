// 레슨프로 샘플 데이터 시드 스크립트
// 실행: npx tsx scripts/seed-lesson-pros.ts

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// .env.local 파일 로드
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const lessonPros = [
  {
    name: 'QED골프아카데미 건대점',
    introduction: '서울특별시 광진구에 위치한 골프 레슨 전문 아카데미입니다. 초보자부터 중급자까지 체계적인 레슨을 제공합니다.',
    specialties: ['beginner', 'swing', 'short_game'],
    regions: ['서울'],
    lesson_types: ['individual', 'group'],
    price_individual: 80000,
    price_group: 50000,
    location_lat: 37.5475047,
    location_lng: 127.0674379,
    location_address: '서울특별시 광진구 동일로 174 더메종 건대 B1',
    rating: 5.0,
    review_count: 7,
    is_active: true,
    is_verified: false,
    google_place_id: 'ChIJ4cwWH6elfDURRU0_ylTJ9EU',
  },
  {
    name: '더프라자 골프 뚝섬점',
    introduction: '한강 뚝섬 근처에 위치한 프리미엄 골프 레슨장입니다. 최신 스윙 분석 장비를 갖추고 있습니다.',
    specialties: ['beginner', 'swing', 'driver'],
    regions: ['서울'],
    lesson_types: ['individual', 'group', 'playing'],
    price_individual: 100000,
    price_group: 60000,
    location_lat: 37.5323053,
    location_lng: 127.0667564,
    location_address: '서울특별시 광진구 능동로 한강파크빌딩 지하 1층',
    rating: 5.0,
    review_count: 1,
    is_active: true,
    is_verified: false,
    google_place_id: 'ChIJAzm32pClfDURfGNMPRcJsyM',
  },
  {
    name: '더부킹골프GDR아카데미',
    introduction: '동대문구 장안동에 위치한 GDR 시스템 기반 골프 아카데미입니다. 데이터 기반 레슨을 제공합니다.',
    specialties: ['beginner', 'swing', 'putting'],
    regions: ['서울'],
    lesson_types: ['individual', 'group'],
    price_individual: 70000,
    price_group: 45000,
    location_lat: 37.5619715,
    location_lng: 127.0641668,
    location_address: '서울특별시 동대문구 장안동 천호대로 405 동보빌딩 B1',
    rating: 4.2,
    review_count: 5,
    is_active: true,
    is_verified: false,
    google_place_id: 'ChIJSRmBKhSlfDURinu0yuKFTZM',
  },
  {
    name: '김프로 골프레슨',
    introduction: 'KPGA 정회원 출신 프로의 1:1 맞춤 레슨. 10년 이상의 레슨 경력으로 골린이 전문 지도합니다.',
    experience_years: 12,
    specialties: ['beginner', 'swing', 'mental'],
    certifications: ['KPGA 정회원', 'TPI Level 2'],
    regions: ['서울', '경기'],
    lesson_types: ['individual', 'playing'],
    price_individual: 120000,
    available_times: '평일 오전 10시 ~ 오후 8시\n주말 오전 9시 ~ 오후 5시',
    contact_phone: '010-1234-5678',
    contact_kakao: 'kimgolfpro',
    location_lat: 37.5172,
    location_lng: 127.0473,
    location_address: '서울특별시 강남구 역삼동',
    rating: 4.8,
    review_count: 23,
    is_active: true,
    is_verified: true,
  },
  {
    name: '박프로 골프아카데미',
    introduction: '여성 골퍼 전문 레슨. 세심하고 친절한 지도로 골프의 재미를 알려드립니다.',
    experience_years: 8,
    specialties: ['beginner', 'swing', 'short_game', 'course'],
    certifications: ['KLPGA 정회원'],
    regions: ['서울'],
    lesson_types: ['individual', 'group'],
    price_individual: 90000,
    price_group: 55000,
    available_times: '평일 오전 9시 ~ 오후 6시',
    contact_phone: '010-9876-5432',
    instagram: 'park_golf_academy',
    location_lat: 37.5045,
    location_lng: 127.0498,
    location_address: '서울특별시 강남구 삼성동',
    rating: 4.9,
    review_count: 45,
    is_active: true,
    is_verified: true,
  },
  {
    name: '이프로 스윙랩',
    introduction: '스윙 교정 전문. 트랙맨과 K-Vest를 활용한 과학적 분석 레슨을 제공합니다.',
    experience_years: 15,
    specialties: ['swing', 'driver', 'fitting'],
    certifications: ['KPGA 정회원', 'Trackman Level 2', 'K-Vest Certified'],
    regions: ['경기'],
    lesson_types: ['individual'],
    price_individual: 150000,
    available_times: '예약제 운영',
    contact_kakao: 'swinglab_lee',
    youtube: 'https://youtube.com/@swinglab',
    location_lat: 37.3947,
    location_lng: 127.1119,
    location_address: '경기도 성남시 분당구',
    rating: 4.7,
    review_count: 67,
    is_active: true,
    is_verified: true,
  },
]

async function seedLessonPros() {
  console.log('레슨프로 데이터 시드 시작...')

  for (const pro of lessonPros) {
    const { data, error } = await supabase
      .from('lesson_pros')
      .upsert(pro, { onConflict: 'google_place_id' })
      .select()

    if (error) {
      console.error(`❌ ${pro.name} 등록 실패:`, error.message)
    } else {
      console.log(`✅ ${pro.name} 등록 완료`)
    }
  }

  console.log('\n시드 완료!')
}

seedLessonPros()
