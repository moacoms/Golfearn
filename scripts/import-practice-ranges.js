// 연습장 샘플 데이터 임포트 스크립트
// 실행: node scripts/import-practice-ranges.js

const SUPABASE_URL = 'https://bfcmjumgfrblvyjuvmbk.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY21qdW1nZnJibHZ5anV2bWJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc3NjAxMiwiZXhwIjoyMDgzMzUyMDEyfQ.L940P3Vgxdnzn7r-Wf-6xCd9Hc3wUPEctKx_maLkbNA'

// 샘플 연습장 데이터 (전국 주요 연습장)
const samplePracticeRanges = [
  // 서울
  {
    name: '골프존 강남점',
    description: '강남 최대 규모의 스크린골프 연습장입니다. 최신 GDR 시스템과 넓은 타석을 자랑합니다.',
    address: '서울특별시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    location_lat: 37.5012,
    location_lng: 127.0396,
    facilities: ['screen', 'indoor', 'parking', 'cafe'],
    floor_count: 3,
    booth_count: 50,
    operating_hours: '06:00 - 24:00',
    price_info: '1시간 20,000원 / 30분 12,000원',
    google_rating: 4.5,
    google_review_count: 328,
    region: '서울',
    is_active: true
  },
  {
    name: '투어프로골프 잠실점',
    description: '잠실역 5분 거리에 위치한 프리미엄 스크린골프장입니다.',
    address: '서울특별시 송파구 올림픽로 300',
    phone: '02-2345-6789',
    location_lat: 37.5145,
    location_lng: 127.1021,
    facilities: ['screen', 'indoor', 'parking', 'locker', 'shower'],
    floor_count: 2,
    booth_count: 30,
    operating_hours: '09:00 - 23:00',
    price_info: '1시간 25,000원',
    google_rating: 4.3,
    google_review_count: 215,
    region: '서울',
    is_active: true
  },
  {
    name: '청담 골프아카데미',
    description: '프로 레슨과 연습을 동시에! 청담동 위치 골프 아카데미입니다.',
    address: '서울특별시 강남구 청담동 45-12',
    phone: '02-3456-7890',
    location_lat: 37.5244,
    location_lng: 127.0474,
    facilities: ['screen', 'indoor', 'putting', 'locker'],
    floor_count: 2,
    booth_count: 20,
    operating_hours: '07:00 - 22:00',
    price_info: '레슨 1회 80,000원 / 연습 1시간 15,000원',
    google_rating: 4.7,
    google_review_count: 156,
    region: '서울',
    is_active: true
  },
  // 경기
  {
    name: '수원 그린골프연습장',
    description: '수원 최대 규모 야외 골프연습장. 250야드 드라이빙 레인지.',
    address: '경기도 수원시 영통구 광교로 100',
    phone: '031-234-5678',
    location_lat: 37.2911,
    location_lng: 127.0469,
    facilities: ['outdoor', 'parking', 'cafe', 'putting'],
    floor_count: 2,
    booth_count: 100,
    operating_hours: '05:00 - 23:00',
    price_info: '100구 8,000원 / 200구 14,000원',
    google_rating: 4.2,
    google_review_count: 445,
    region: '경기',
    is_active: true
  },
  {
    name: '분당 센트럴골프',
    description: '분당 중심가 위치, 최신 시뮬레이터 완비 스크린골프장입니다.',
    address: '경기도 성남시 분당구 정자로 178',
    phone: '031-345-6789',
    location_lat: 37.3595,
    location_lng: 127.1086,
    facilities: ['screen', 'indoor', 'parking', 'locker', 'cafe'],
    floor_count: 3,
    booth_count: 45,
    operating_hours: '06:00 - 24:00',
    price_info: '1시간 22,000원',
    google_rating: 4.4,
    google_review_count: 289,
    region: '경기',
    is_active: true
  },
  {
    name: '일산 레이크골프연습장',
    description: '호수공원 인근 경치 좋은 야외 연습장입니다.',
    address: '경기도 고양시 일산동구 호수로 123',
    phone: '031-456-7890',
    location_lat: 37.6584,
    location_lng: 126.7731,
    facilities: ['outdoor', 'parking', 'bunker', 'putting'],
    floor_count: 3,
    booth_count: 150,
    operating_hours: '05:30 - 22:00',
    price_info: '100구 7,000원 / 무제한 25,000원',
    google_rating: 4.1,
    google_review_count: 523,
    region: '경기',
    is_active: true
  },
  // 인천
  {
    name: '인천공항 스카이골프',
    description: '인천공항 인근 대형 골프연습장. 야간 조명 완비.',
    address: '인천광역시 중구 운서동 123-45',
    phone: '032-567-8901',
    location_lat: 37.4692,
    location_lng: 126.4505,
    facilities: ['outdoor', 'indoor', 'screen', 'parking', 'cafe'],
    floor_count: 2,
    booth_count: 120,
    operating_hours: '24시간',
    price_info: '100구 6,000원',
    google_rating: 4.0,
    google_review_count: 178,
    region: '인천',
    is_active: true
  },
  // 부산
  {
    name: '해운대 비치골프',
    description: '해운대 바다가 보이는 프리미엄 골프 연습장입니다.',
    address: '부산광역시 해운대구 해운대해변로 200',
    phone: '051-678-9012',
    location_lat: 35.1586,
    location_lng: 129.1604,
    facilities: ['outdoor', 'screen', 'parking', 'cafe', 'locker', 'shower'],
    floor_count: 4,
    booth_count: 80,
    operating_hours: '05:00 - 24:00',
    price_info: '100구 9,000원 / 스크린 1시간 25,000원',
    google_rating: 4.6,
    google_review_count: 367,
    region: '부산',
    is_active: true
  },
  {
    name: '서면 골프존 파크',
    description: '서면 중심가 최대 규모 스크린골프 복합시설입니다.',
    address: '부산광역시 부산진구 서면로 68',
    phone: '051-789-0123',
    location_lat: 35.1579,
    location_lng: 129.0598,
    facilities: ['screen', 'indoor', 'parking', 'cafe', 'locker'],
    floor_count: 5,
    booth_count: 60,
    operating_hours: '10:00 - 02:00',
    price_info: '1시간 20,000원',
    google_rating: 4.3,
    google_review_count: 234,
    region: '부산',
    is_active: true
  },
  // 대구
  {
    name: '대구 팔공산 골프연습장',
    description: '팔공산 자연 속에서 즐기는 300야드 드라이빙 레인지.',
    address: '대구광역시 동구 팔공로 789',
    phone: '053-890-1234',
    location_lat: 35.9418,
    location_lng: 128.6833,
    facilities: ['outdoor', 'parking', 'putting', 'bunker', 'cafe'],
    floor_count: 2,
    booth_count: 200,
    operating_hours: '05:00 - 22:00',
    price_info: '100구 5,500원 / 월정액 150,000원',
    google_rating: 4.4,
    google_review_count: 412,
    region: '대구',
    is_active: true
  },
  // 대전
  {
    name: '대전 유성 골프파크',
    description: '유성온천 인근 복합 골프시설. 실내외 연습장 겸비.',
    address: '대전광역시 유성구 온천로 234',
    phone: '042-901-2345',
    location_lat: 36.3546,
    location_lng: 127.3419,
    facilities: ['outdoor', 'indoor', 'screen', 'parking', 'cafe', 'shower'],
    floor_count: 3,
    booth_count: 90,
    operating_hours: '06:00 - 23:00',
    price_info: '100구 6,500원 / 스크린 18,000원',
    google_rating: 4.2,
    google_review_count: 198,
    region: '대전',
    is_active: true
  },
  // 광주
  {
    name: '광주 무등산 골프아카데미',
    description: '무등산이 보이는 경치 좋은 연습장입니다.',
    address: '광주광역시 동구 무등로 567',
    phone: '062-123-4567',
    location_lat: 35.1273,
    location_lng: 126.9881,
    facilities: ['outdoor', 'parking', 'putting', 'cafe'],
    floor_count: 2,
    booth_count: 80,
    operating_hours: '05:30 - 22:00',
    price_info: '100구 5,000원',
    google_rating: 4.1,
    google_review_count: 156,
    region: '광주',
    is_active: true
  },
  // 제주
  {
    name: '제주 오션뷰 골프레인지',
    description: '제주 바다를 바라보며 스윙하는 특별한 경험.',
    address: '제주특별자치도 제주시 애월읍 해안로 100',
    phone: '064-234-5678',
    location_lat: 33.4627,
    location_lng: 126.3152,
    facilities: ['outdoor', 'parking', 'cafe', 'putting'],
    floor_count: 1,
    booth_count: 60,
    operating_hours: '06:00 - 21:00',
    price_info: '100구 8,000원',
    google_rating: 4.8,
    google_review_count: 287,
    region: '제주',
    is_active: true
  },
  {
    name: '서귀포 골프존 프리미엄',
    description: '서귀포 시내 중심가 프리미엄 스크린골프장.',
    address: '제주특별자치도 서귀포시 중앙로 89',
    phone: '064-345-6789',
    location_lat: 33.2532,
    location_lng: 126.5599,
    facilities: ['screen', 'indoor', 'parking', 'locker', 'cafe'],
    floor_count: 2,
    booth_count: 25,
    operating_hours: '09:00 - 24:00',
    price_info: '1시간 22,000원',
    google_rating: 4.5,
    google_review_count: 134,
    region: '제주',
    is_active: true
  },
  // 강원
  {
    name: '춘천 의암호 골프연습장',
    description: '의암호가 내려다보이는 자연친화적 연습장.',
    address: '강원도 춘천시 스포츠타운길 50',
    phone: '033-456-7890',
    location_lat: 37.8813,
    location_lng: 127.7298,
    facilities: ['outdoor', 'parking', 'putting', 'bunker'],
    floor_count: 2,
    booth_count: 70,
    operating_hours: '06:00 - 21:00',
    price_info: '100구 5,000원',
    google_rating: 4.3,
    google_review_count: 98,
    region: '강원',
    is_active: true
  }
]

async function importPracticeRanges() {
  console.log('연습장 데이터 임포트 시작...\n')

  let successCount = 0
  let errorCount = 0

  for (const range of samplePracticeRanges) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/practice_ranges`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(range)
      })

      if (response.ok) {
        console.log(`✅ ${range.name} (${range.region})`)
        successCount++
      } else {
        const error = await response.text()
        console.log(`❌ ${range.name}: ${error}`)
        errorCount++
      }
    } catch (error) {
      console.log(`❌ ${range.name}: ${error.message}`)
      errorCount++
    }
  }

  console.log(`\n완료! 성공: ${successCount}개, 실패: ${errorCount}개`)
}

importPracticeRanges()
