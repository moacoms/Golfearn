# BM 및 홍보 전략 시스템 구현 문서

## 📋 개요

Golfearn의 비즈니스 성장과 사용자 확보를 위한 종합적인 BM 및 홍보 전략 시스템을 구현했습니다.

**구현 일자**: 2026-01-15
**브랜치**: `claude/bm-promotion-strategy-d9lIM`

---

## 🎯 구현 목표

1. **바이럴 마케팅**: 추천인 시스템으로 자연스러운 사용자 확산
2. **사용자 참여 증대**: 포인트, 경험치, 뱃지로 재방문 유도
3. **수익 모델 구축**: 프리미엄 멤버십, 거래 수수료 기반
4. **커뮤니티 활성화**: SNS 공유, 이벤트, 프로모션

---

## 🗄️ 데이터베이스 스키마

### 1. 추천인 시스템

#### `referral_codes` - 추천 코드 테이블
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- code: VARCHAR(20) UNIQUE (예: "GOLF-ABC123")
- uses_count: INT (사용된 횟수)
- created_at: TIMESTAMP
```

**특징**:
- 회원가입 시 자동으로 고유 추천 코드 생성
- `generate_referral_code()` 함수로 중복 없는 코드 생성
- 각 사용자당 1개의 추천 코드

#### `referrals` - 추천 관계 테이블
```sql
- id: UUID (PK)
- referrer_id: UUID (FK → auth.users) - 추천인
- referred_id: UUID (FK → auth.users) - 신규 가입자
- referral_code: VARCHAR(20)
- reward_given: BOOLEAN - 보상 지급 여부
- created_at: TIMESTAMP
```

**특징**:
- 추천인과 피추천인의 관계 기록
- 보상 지급 상태 추적
- 한 사람은 한 번만 추천받을 수 있음 (UNIQUE)

#### `referral_stats` - 추천 통계 뷰
```sql
SELECT
  referrer_id,
  referrer_email,
  total_referrals,
  rewarded_referrals,
  referral_code
FROM referrals
GROUP BY referrer_id
```

### 2. 포인트/리워드 시스템

#### `point_wallets` - 포인트 지갑
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users) UNIQUE
- balance: INT - 현재 잔액
- total_earned: INT - 누적 적립
- total_spent: INT - 누적 사용
- created_at, updated_at: TIMESTAMP
```

**특징**:
- 회원가입 시 자동 생성 (초기 3,000P 지급)
- 모든 포인트 거래는 `point_transactions`에 기록 후 자동 업데이트

#### `point_transactions` - 포인트 거래 내역
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- type: VARCHAR(20) - 'earn' or 'spend'
- amount: INT - 포인트 양
- category: VARCHAR(50) - 'signup', 'referral', 'post', 'purchase' 등
- description: TEXT
- reference_id: UUID - 관련 ID (게시글, 상품 등)
- reference_type: VARCHAR(50) - 'post', 'product', 'join' 등
- created_at: TIMESTAMP
```

**포인트 적립 활동**:
- 회원가입: 3,000P
- 프로필 완성: 1,000P
- 첫 게시글: 500P
- 첫 댓글: 300P
- 일일 출석: 100P (7일 연속 시 500P)
- 리뷰 작성: 500P
- 조인 참가: 1,000P
- 중고거래 완료: 2,000P
- 친구 추천 성공: 5,000P

#### `user_experience` - 경험치 & 레벨
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users) UNIQUE
- level: INT - 현재 레벨 (1~6)
- xp: INT - 현재 경험치
- total_xp: INT - 누적 경험치
- created_at, updated_at: TIMESTAMP
```

**레벨 시스템**:
- Lv.1 "새싹 골린이": 0 XP
- Lv.2 "성장하는 골린이": 100 XP
- Lv.3 "열심히 하는 골린이": 500 XP
- Lv.4 "진지한 골린이": 1,500 XP
- Lv.5 "골프 애호가": 5,000 XP
- Lv.6 "골프 마스터": 10,000 XP

**경험치 획득**:
- 게시글 작성: 10 XP
- 댓글 작성: 5 XP
- 좋아요 받기: 2 XP
- 조인 참가: 50 XP
- 레슨 수강: 100 XP
- 리뷰 작성: 30 XP

#### `xp_transactions` - 경험치 거래 내역
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- amount: INT
- category: VARCHAR(50)
- description: TEXT
- reference_id, reference_type: UUID, VARCHAR(50)
- created_at: TIMESTAMP
```

#### `badges` - 뱃지 마스터 테이블
```sql
- id: UUID (PK)
- name: VARCHAR(100) UNIQUE
- description: TEXT
- icon: VARCHAR(10) - 이모지
- category: VARCHAR(50) - 'activity', 'trading', 'social', 'achievement'
- requirement_type: VARCHAR(50)
- requirement_value: INT
- created_at: TIMESTAMP
```

**기본 뱃지 10개**:
1. 🏆 첫 라운딩 완주 - 조인 1회 참가
2. 🔥 7일 연속 출석 - 7일 연속 출석
3. 💬 댓글왕 - 댓글 100개 이상
4. 🤝 조인 달인 - 조인 10회 이상
5. ⭐ 5점 리뷰어 - 5점 리뷰 10개 작성
6. 📸 사진 마스터 - 사진 50장 업로드
7. 💰 거래왕 - 중고거래 20건 완료
8. 👥 추천 마스터 - 친구 10명 초대
9. 👑 초대왕 - 친구 20명 초대
10. 🎓 골린이 멘토 - 답변 채택 50회

#### `user_badges` - 사용자 획득 뱃지
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- badge_id: UUID (FK → badges)
- earned_at: TIMESTAMP
- UNIQUE(user_id, badge_id)
```

### 3. 이벤트/프로모션 시스템

#### `events` - 이벤트 테이블
```sql
- id: UUID (PK)
- title: VARCHAR(200)
- description: TEXT
- event_type: VARCHAR(50) - 'contest', 'promotion', 'discount', 'reward'
- status: VARCHAR(20) - 'draft', 'active', 'ended', 'cancelled'
- start_date, end_date: TIMESTAMP
- banner_image: TEXT
- terms: TEXT
- reward_type: VARCHAR(50) - 'points', 'premium', 'discount', 'badge'
- reward_value: JSONB
- max_participants: INT
- current_participants: INT
- created_by: UUID (FK → auth.users)
- created_at, updated_at: TIMESTAMP
```

**이벤트 예시**:
- "얼리어답터 1,000명 모집" - 선착순 프리미엄 무료
- "골린이 스토리 공모전" - 레슨권 및 프리미엄 상품
- "주말 조인 특가" - 참가비 할인
- "신규 가입 이벤트" - 10,000P 지급

#### `event_participants` - 이벤트 참가자
```sql
- id: UUID (PK)
- event_id: UUID (FK → events)
- user_id: UUID (FK → auth.users)
- status: VARCHAR(20) - 'pending', 'winner', 'completed'
- submission_data: JSONB
- reward_claimed: BOOLEAN
- participated_at: TIMESTAMP
- UNIQUE(event_id, user_id)
```

#### `promo_codes` - 프로모션 코드
```sql
- id: UUID (PK)
- code: VARCHAR(50) UNIQUE
- description: TEXT
- discount_type: VARCHAR(20) - 'percentage', 'fixed', 'points'
- discount_value: INT
- usage_limit: INT
- usage_count: INT
- valid_from, valid_until: TIMESTAMP
- applicable_to: VARCHAR(50) - 'premium', 'lesson', 'product', 'all'
- is_active: BOOLEAN
- created_at: TIMESTAMP
```

**프로모션 코드 예시**:
- `WELCOME50` - 50% 할인 (신규 가입자)
- `SUMMER2026` - 10,000P 지급
- `PREMIUM30` - 프리미엄 30% 할인

#### `promo_code_usage` - 프로모션 코드 사용 내역
```sql
- id: UUID (PK)
- promo_code_id: UUID (FK → promo_codes)
- user_id: UUID (FK → auth.users)
- discount_amount: INT
- order_type: VARCHAR(50)
- order_id: UUID
- used_at: TIMESTAMP
- UNIQUE(promo_code_id, user_id, order_id)
```

### 4. 프리미엄 멤버십 시스템

#### `premium_subscriptions` - 프리미엄 구독
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- status: VARCHAR(20) - 'active', 'cancelled', 'expired', 'trial'
- plan: VARCHAR(20) - 'monthly', 'yearly'
- price: INT
- start_date, end_date: TIMESTAMP
- auto_renew: BOOLEAN
- payment_method: VARCHAR(50) - 'card', 'points', 'free'
- created_at, updated_at: TIMESTAMP
```

**프리미엄 혜택**:
- 광고 제거
- 우선 검색 노출
- 무제한 북마크/찜
- 레슨프로 직접 연락처
- 월간 레포트
- 프리미엄 배지
- 조인 참가 수수료 면제
- 레슨 예약 10% 할인

**가격**:
- 월간: 9,900원
- 연간: 99,000원 (2개월 무료)

#### `premium_subscription_history` - 구독 히스토리
```sql
- id: UUID (PK)
- subscription_id: UUID (FK → premium_subscriptions)
- user_id: UUID (FK → auth.users)
- action: VARCHAR(50) - 'created', 'renewed', 'cancelled', 'expired'
- previous_status, new_status: VARCHAR(20)
- note: TEXT
- created_at: TIMESTAMP
```

### 5. 출석 체크 시스템

#### `daily_check_ins` - 출석 체크
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- check_in_date: DATE
- consecutive_days: INT - 연속 출석 일수
- reward_points: INT
- created_at: TIMESTAMP
- UNIQUE(user_id, check_in_date)
```

**보상 체계**:
- 기본: 100P
- 3일 연속: 200P
- 7일 연속: 500P + 뱃지

### 6. 통계 뷰 (Views)

#### `user_stats` - 사용자 종합 통계
```sql
SELECT
  user_id,
  email,
  points (포인트 잔액),
  level (레벨),
  total_xp (누적 경험치),
  referral_count (추천 수),
  badge_count (뱃지 수),
  premium_status (프리미엄 상태)
```

#### `xp_leaderboard` - 경험치 리더보드
```sql
SELECT
  user_id,
  full_name,
  avatar_url,
  level,
  total_xp,
  rank (순위)
ORDER BY total_xp DESC
```

#### `referral_leaderboard` - 추천인 리더보드
```sql
SELECT
  referrer_id,
  full_name,
  avatar_url,
  referral_count,
  rank
ORDER BY referral_count DESC
```

---

## ⚙️ Server Actions (Backend Logic)

### 1. `lib/actions/referrals.ts` - 추천인 시스템

#### 주요 함수:

**`getMyReferralCode()`**
- 내 추천 코드 조회
- 반환: `{ code: string, uses_count: number }`

**`getMyReferralStats()`**
- 내 추천 통계 조회
- 반환: `{ total_referrals, rewarded_referrals }`

**`applyReferralCode(code: string)`**
- 추천 코드 적용 (회원가입 시)
- 추천인에게 5,000P 지급
- 신규 가입자에게 3,000P 지급
- `referrals` 테이블에 기록

**`getMyReferrals()`**
- 내가 추천한 사람들 목록
- 보상 지급 상태 포함

**`getReferralLeaderboard(limit: number)`**
- 추천인 순위 TOP N
- 프로필 정보 포함

### 2. `lib/actions/points.ts` - 포인트/리워드 시스템

#### 포인트 관련:

**`getMyPointWallet()`**
- 내 포인트 지갑 정보
- 반환: `{ balance, total_earned, total_spent }`

**`getPointTransactions(limit, offset)`**
- 포인트 거래 내역 (페이지네이션)
- 최신순 정렬

**`earnPoints(amount, category, description, referenceId?, referenceType?)`**
- 포인트 적립
- 자동으로 `point_wallets` 업데이트
- 거래 내역 기록

**`spendPoints(amount, category, description, referenceId?, referenceType?)`**
- 포인트 사용
- 잔액 확인 후 차감
- 거래 내역 기록

#### 경험치/레벨 관련:

**`getMyExperience()`**
- 내 경험치 및 레벨 정보
- 반환: `{ level, xp, total_xp }`

**`earnExperience(amount, category, description, referenceId?, referenceType?)`**
- 경험치 획득
- 레벨업 자동 체크 (트리거)
- `xp_transactions`에 기록

**`getXpLeaderboard(limit: number)`**
- 경험치 리더보드 TOP N

#### 뱃지 관련:

**`getAllBadges()`**
- 전체 뱃지 목록

**`getMyBadges()`**
- 내가 획득한 뱃지 목록
- 뱃지 상세 정보 포함

**`earnBadge(badgeId: string)`**
- 뱃지 획득
- 중복 방지

#### 출석 체크:

**`checkIn()`**
- 일일 출석 체크
- 연속 출석 계산
- 보상 지급 (포인트 + 경험치)
- 7일 연속 시 뱃지 자동 지급
- 반환: `{ success, consecutiveDays, points }`

**`getTodayCheckIn()`**
- 오늘 출석 여부 확인
- 반환: `{ checked, consecutiveDays }`

### 3. `lib/actions/events.ts` - 이벤트/프로모션

#### 이벤트 관련:

**`getActiveEvents()`**
- 진행 중인 이벤트 목록
- `status = 'active'`

**`getEvent(eventId: string)`**
- 이벤트 상세 정보

**`participateInEvent(eventId, submissionData?)`**
- 이벤트 참가 신청
- 참가 인원 제한 확인
- 중복 참가 방지
- 참가 보상 지급 (포인트 등)

**`getMyEventParticipations()`**
- 내가 참가한 이벤트 목록
- 이벤트 상세 정보 포함

**`createEvent(eventData)` (관리자용)**
- 새 이벤트 생성
- 이벤트 설정 (보상, 인원 제한 등)

#### 프로모션 코드:

**`applyPromoCode(code: string)`**
- 프로모션 코드 검증
- 유효 기간 확인
- 사용 제한 확인
- 중복 사용 방지
- 반환: `{ success, discount }`

**`recordPromoCodeUsage(promoCodeId, orderType, orderId, discountAmount)`**
- 프로모션 코드 사용 기록
- 사용 횟수 증가

---

## 🎨 UI 컴포넌트

### 1. `components/ShareButton.tsx` - SNS 공유 컴포넌트

#### 기본 컴포넌트:

**`<ShareButton />`**
- 범용 공유 버튼
- Props:
  - `title`: 공유 제목
  - `text`: 공유 내용
  - `url`: 공유 링크
  - `hashtags`: 해시태그 배열
  - `className`: 스타일 클래스

**지원 플랫폼**:
1. **카카오톡** - Kakao SDK 사용
2. **페이스북** - Facebook Sharer
3. **트위터** - Tweet Intent
4. **라인** - LINE Share
5. **링크 복사** - Clipboard API
6. **네이티브 공유** - Web Share API (모바일)

#### 특화 컴포넌트:

**`<ReferralShareButton referralCode={code} />`**
- 추천인 코드 전용 공유
- 자동으로 공유 텍스트 생성:
  ```
  골프 입문자를 위한 플랫폼 Golfearn에 초대합니다!
  회원가입하고 3,000 포인트 받으세요!
  추천 코드: GOLF-ABC123
  ```
- 공유 URL: `https://www.golfearn.com/signup?ref=GOLF-ABC123`

**`<PostShareButton postId={id} postTitle={title} />`**
- 게시글 공유 전용
- URL: `https://www.golfearn.com/community/{id}`
- 해시태그: #골린이 #골프커뮤니티 #Golfearn

**`<ProductShareButton productId={id} productTitle={title} />`**
- 중고거래 상품 공유 전용
- URL: `https://www.golfearn.com/market/{id}`
- 해시태그: #골프중고 #골프용품 #Golfearn

### 2. `app/(main)/mypage/points/CheckInButton.tsx` - 출석 체크 버튼

**기능**:
- 오늘 출석 여부 자동 확인
- 출석 완료 시: "오늘 출석 완료 - N일 연속 출석 중!" 표시
- 미출석 시: "출석 체크" 버튼 표시
- 클릭 시:
  - 포인트 지급
  - 경험치 지급
  - 연속 출석 일수 계산
  - 7일 연속 시 뱃지 자동 지급
  - 성공 알림 표시

**UI 상태**:
- 로딩 중: "처리 중..."
- 출석 완료: 녹색 배경, 연속 일수 표시
- 미출석: 흰색 버튼

---

## 📄 페이지

### 1. `/mypage/points` - 포인트 & 리워드 페이지

**구성**:
1. **포인트 현황 카드**
   - 현재 잔액 (큰 글씨)
   - 누적 적립 / 누적 사용
   - 출석 체크 버튼

2. **경험치 & 레벨 섹션**
   - 현재 레벨 (1~6)
   - 레벨 이름 (예: "열심히 하는 골린이")
   - 경험치 프로그레스 바
   - 다음 레벨까지 필요한 XP

3. **내 뱃지 컬렉션**
   - 획득한 뱃지 그리드 (아이콘 + 이름)
   - 미획득 뱃지는 반투명 표시
   - 뱃지 획득 날짜

4. **포인트 거래 내역**
   - 최근 20개 거래 목록
   - 적립/사용 구분 (색상)
   - 금액, 카테고리, 설명
   - 날짜

5. **경험치 리더보드**
   - TOP 10 순위
   - 프로필 사진, 이름, 레벨, 총 경험치
   - 내 순위 하이라이트

### 2. `/mypage/referral` - 친구 초대 페이지

**구성**:
1. **추천 코드 카드**
   - 내 추천 코드 (큰 글씨)
   - 복사 버튼
   - SNS 공유 버튼 (카카오톡, 페이스북 등)

2. **추천 통계**
   - 총 추천 인원
   - 보상 받은 인원
   - 총 획득 포인트

3. **보상 진행률**
   - 5명 추천: 프리미엄 1개월 (진행 바)
   - 10명 추천: 프리미엄 3개월 (진행 바)
   - 20명 추천: 프리미엄 1년 (진행 바)

4. **추천한 친구 목록**
   - 이메일 (일부 가려짐: a***@gmail.com)
   - 가입 날짜
   - 보상 지급 여부

5. **추천 방법 안내**
   - 추천 코드 공유 방법
   - 보상 지급 조건
   - 주의사항

### 3. `/mypage` - 마이페이지 (수정)

**변경사항**:
- 메뉴 그리드 상단에 2개 추가:
  1. **포인트 & 리워드**
     - 초록색 테두리 하이라이트
     - 현재 포인트 잔액 표시
     - 예: "보유 5,000P"

  2. **친구 초대하기**
     - 초록색 테두리 하이라이트
     - 추천 인원 표시
     - 예: "5명 초대 완료"

---

## 🔧 데이터베이스 트리거 & 함수

### 1. 추천 코드 자동 생성

**함수**: `generate_referral_code(user_id UUID)`
```sql
RETURNS VARCHAR(20)
```
- `GOLF-` 접두사 + 6자리 랜덤 영숫자
- 중복 확인 후 반환
- 예: `GOLF-ABC123`

**트리거**: `trigger_create_referral_code`
- 이벤트: `AFTER INSERT ON auth.users`
- 동작: 신규 사용자 가입 시 자동으로 추천 코드 생성

### 2. 포인트 지갑 자동 생성

**트리거**: `trigger_create_point_wallet`
- 이벤트: `AFTER INSERT ON auth.users`
- 동작:
  - 포인트 지갑 생성 (초기 3,000P)
  - 거래 내역 추가 (회원가입 보너스)

### 3. 경험치 테이블 자동 생성

**트리거**: `trigger_create_user_experience`
- 이벤트: `AFTER INSERT ON auth.users`
- 동작: 경험치 테이블 초기화 (Lv.1, 0 XP)

### 4. 포인트 지갑 자동 업데이트

**트리거**: `trigger_update_point_wallet`
- 이벤트: `AFTER INSERT ON point_transactions`
- 동작:
  - `type = 'earn'`: 잔액 증가, 누적 적립 증가
  - `type = 'spend'`: 잔액 감소, 누적 사용 증가
  - `updated_at` 갱신

### 5. 레벨업 자동 체크

**트리거**: `trigger_check_level_up`
- 이벤트: `AFTER INSERT OR UPDATE ON user_experience`
- 동작:
  - 총 경험치에 따라 레벨 계산
  - 레벨이 올랐으면 `user_experience` 업데이트
  - 레벨업 알림 생성 (선택적)

---

## 🔒 Row Level Security (RLS) 정책

모든 테이블에 RLS 활성화 및 정책 적용:

### 일반 원칙:
1. **본인 데이터 조회**: 자신의 데이터는 항상 조회 가능
2. **공개 데이터 조회**: 리더보드, 뱃지 등은 모든 인증된 사용자가 조회 가능
3. **수정/삭제 제한**: 본인 데이터만 수정/삭제 가능
4. **관리자 권한**: 이벤트 생성 등 특정 작업은 관리자만 가능

### 주요 정책:

**referral_codes**:
- ✅ 본인 코드 조회 가능
- ✅ 모든 사용자 코드 조회 가능 (추천받기 위해)

**point_wallets / point_transactions**:
- ✅ 본인 지갑/거래내역만 조회 가능

**user_experience / xp_transactions**:
- ✅ 본인 경험치 조회 가능
- ✅ 리더보드 위해 다른 사람 경험치도 조회 가능

**badges / user_badges**:
- ✅ 모든 뱃지 정보 조회 가능
- ✅ 모든 사용자 획득 뱃지 조회 가능 (프로필 표시)

**events**:
- ✅ 활성화된 이벤트 조회 가능
- ✅ 본인이 만든 이벤트 조회 가능

**event_participants**:
- ✅ 본인 참가 내역 조회 가능
- ✅ 본인만 참가 신청 가능

---

## 📊 비즈니스 전략

### 추천 보상 체계

| 달성 인원 | 보상 |
|----------|------|
| 친구 1명 추천 | 5,000 포인트 |
| 5명 추천 | 프리미엄 1개월 무료 |
| 10명 추천 | 프리미엄 3개월 무료 |
| 20명 추천 | 프리미엄 1년 무료 + 골프공 1더즌 |

**신규 가입자**: 3,000 포인트

### 포인트 사용처

| 항목 | 포인트 비율 |
|------|-----------|
| 중고거래 결제 | 1P = 1원 |
| 레슨 예약 할인 | 10,000P = 10,000원 |
| 프리미엄 구독 | 9,900P = 1개월 |
| 골프용품 구매 | 1P = 1원 |

### 프리미엄 멤버십

**가격**:
- 월간: 9,900원
- 연간: 99,000원

**혜택**:
- 광고 제거
- 우선 검색 노출
- 무제한 북마크/찜
- 레슨프로 직접 연락처
- 월간 레포트
- 조인 참가 수수료 면제
- 레슨 예약 10% 할인

### 이벤트 예시

1. **"얼리어답터 1,000명 모집"**
   - 선착순 500명: 프리미엄 3개월
   - 선착순 1,000명: 프리미엄 1개월
   - 전원: 10,000P

2. **"골린이 스토리 공모전"**
   - 1등: 레슨권 50만원 + 프리미엄 1년
   - 2등: 레슨권 30만원 + 프리미엄 6개월
   - 3등: 레슨권 20만원 + 프리미엄 3개월
   - 참가자 전원: 5,000P

---

## 🚀 다음 단계

### 1. 데이터베이스 마이그레이션
```bash
# Supabase CLI로 마이그레이션 실행
supabase db push

# 또는 Supabase 대시보드에서 SQL 직접 실행
```

### 2. 카카오 SDK 설정
```html
<!-- public/index.html에 추가 -->
<script src="https://developers.kakao.com/sdk/js/kakao.js"></script>
<script>
  Kakao.init('YOUR_JAVASCRIPT_KEY')
</script>
```

### 3. 환경 변수 설정
```env
NEXT_PUBLIC_KAKAO_JS_KEY=your_key_here
```

### 4. 결제 시스템 연동
- Toss Payments 또는 Portone (구 아임포트)
- 프리미엄 구독 결제 페이지 구현
- 정기 결제 (구독) 설정

### 5. 관리자 페이지
- 이벤트 생성/수정/삭제
- 프로모션 코드 생성
- 사용자 통계 대시보드
- 뱃지 관리

### 6. 알림 시스템 연동
- 레벨업 알림
- 뱃지 획득 알림
- 추천 보상 알림
- 이벤트 시작/종료 알림

---

## 📈 예상 효과

### 사용자 성장
- **월간 활성 사용자 (MAU)**: 3개월 내 1,000명 → 6개월 내 5,000명
- **추천 바이럴 계수**: 30% (사용자 3명 중 1명이 추천으로 유입)
- **리텐션율**: 30일 후 40% (포인트/레벨 시스템 효과)

### 수익 예상
- **프리미엄 구독**: 월 500명 × 9,900원 = 4,950,000원
- **거래 수수료**: 월 거래액 3,000만원 × 10% = 3,000,000원
- **광고 수익**: 월 1,000,000원
- **총 월 매출**: 약 9,000,000원 (6개월 후 기준)

### 커뮤니티 활성화
- **일일 활성 사용자 (DAU)**: MAU의 20%
- **게시글 작성**: 일 50개 이상
- **댓글 작성**: 일 200개 이상
- **중고거래 거래 성사**: 주 100건 이상

---

## 📚 참고 자료

### 관련 문서
- [BM 및 홍보 전략 문서](./BM_PROMOTION_STRATEGY.md)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- [Kakao SDK](https://developers.kakao.com/docs/latest/ko/javascript/getting-started)

### 코드 위치
- DB 마이그레이션: `supabase/migrations/20260115_referral_points_events.sql`
- Server Actions: `lib/actions/referrals.ts`, `lib/actions/points.ts`, `lib/actions/events.ts`
- 공유 컴포넌트: `components/ShareButton.tsx`
- 페이지: `app/(main)/mypage/points/`, `app/(main)/mypage/referral/`

---

**구현 완료일**: 2026-01-15
**구현자**: Claude
**브랜치**: `claude/bm-promotion-strategy-d9lIM`
