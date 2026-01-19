# 개발일지 2026-01-16

## 오늘의 작업 요약

### 1. BM & 프로모션 시스템 브랜치 병합

**브랜치**: `claude/bm-promotion-strategy-d9lIM` → `main`

**병합 결과**:
- 11개 파일 변경
- 3,624줄 추가

**새로 추가된 파일**:
```
lib/actions/referrals.ts      # 추천인 시스템 Server Actions
lib/actions/points.ts         # 포인트/경험치/뱃지 Server Actions
lib/actions/events.ts         # 이벤트/프로모션 Server Actions
components/ShareButton.tsx    # 공유 버튼 (카카오, 페이스북, 트위터 등)
app/(main)/mypage/points/     # 마이페이지 포인트 탭
```

---

### 2. 빌드 에러 수정

#### 2.1 Button 컴포넌트 import 에러

**문제**: `Attempted import error: 'Button' is not exported from '@/components/ui/Button'`

**원인**: Button 컴포넌트가 default export인데 named import로 사용

**수정 파일**:
- `app/(main)/mypage/points/CheckInButton.tsx`
- `components/ShareButton.tsx`

**수정 내용**:
```typescript
// 수정 전
import { Button } from '@/components/ui/Button'

// 수정 후
import Button from '@/components/ui/Button'
```

#### 2.2 Supabase 테이블 타입 에러

**문제**: `Property 'status' does not exist on type 'never'`

**원인**: 새로 생성된 테이블들이 TypeScript 타입에 없음

**수정 파일**:
- `lib/actions/events.ts`
- `lib/actions/points.ts`
- `lib/actions/referrals.ts`

**수정 내용**:
```typescript
// 수정 전
const { data, error } = await supabase.from('referral_codes').select('*')

// 수정 후
const { data, error } = await (supabase.from('referral_codes') as any).select('*')
```

**임시 해결**: `as any` 타입 캐스팅
**향후 작업**: `npx supabase gen types typescript` 실행 후 타입 적용

---

### 3. 데이터베이스 마이그레이션 적용

**방법**: Supabase Dashboard SQL Editor에서 직접 실행

**마이그레이션 파일**: `supabase/migrations/APPLY_ALL_MIGRATIONS.sql`
- 기존 마이그레이션 파일들을 하나로 합침
- DROP POLICY IF EXISTS 추가하여 재실행 가능하게 수정

#### 생성된 테이블 (14개)

| 테이블 | 설명 |
|--------|------|
| `referral_codes` | 사용자별 추천 코드 (GOLF-XXXXXX) |
| `referrals` | 추천 관계 기록 |
| `point_wallets` | 포인트 지갑 (잔액, 누적 적립/사용) |
| `point_transactions` | 포인트 거래 내역 |
| `user_experience` | 경험치/레벨 |
| `xp_transactions` | 경험치 거래 내역 |
| `badges` | 뱃지 마스터 데이터 |
| `user_badges` | 사용자 획득 뱃지 |
| `events` | 이벤트/프로모션 |
| `event_participants` | 이벤트 참가자 |
| `promo_codes` | 프로모션 코드 |
| `promo_code_usage` | 프로모션 코드 사용 내역 |
| `premium_subscriptions` | 프리미엄 멤버십 |
| `daily_check_ins` | 출석 체크 |

#### 생성된 트리거 (5개)

1. **trigger_create_referral_code**
   - 신규 사용자 가입 시 추천 코드 자동 생성

2. **trigger_create_point_wallet**
   - 신규 사용자 가입 시 포인트 지갑 생성 + 3,000P 보너스

3. **trigger_create_user_experience**
   - 신규 사용자 가입 시 경험치 계정 생성

4. **trigger_update_point_wallet**
   - 포인트 거래 시 지갑 잔액 자동 업데이트

5. **trigger_check_level_up**
   - 경험치 획득 시 레벨업 체크

#### 초기 데이터 (뱃지 10개)

```
🏆 첫 라운딩 완주 - 첫 조인 참가 후 라운딩 완료
🔥 7일 연속 출석 - 7일 연속 출석 체크
💬 댓글왕 - 댓글 100개 이상 작성
🤝 조인 달인 - 조인 10회 이상 참가
⭐ 5점 리뷰어 - 5점 만점 리뷰 10개 작성
📸 사진 마스터 - 사진 50장 이상 업로드
💰 거래왕 - 중고거래 20건 이상 완료
👥 추천 마스터 - 친구 10명 이상 추천
👑 초대왕 - 친구 20명 이상 추천
🎓 골린이 멘토 - 답변 채택 50회
```

---

### 4. 연습장 샘플 데이터 임포트

**스크립트**: `scripts/import-practice-ranges.js`

**실행 결과**: 15개 전체 성공

#### 임포트된 연습장 목록

| 지역 | 연습장 | 시설 | 평점 |
|------|--------|------|------|
| **서울** | 골프존 강남점 | 스크린, 실내, 주차, 카페 | 4.5 |
| **서울** | 투어프로골프 잠실점 | 스크린, 실내, 주차, 락커, 샤워 | 4.3 |
| **서울** | 청담 골프아카데미 | 스크린, 실내, 퍼팅, 락커 | 4.7 |
| **경기** | 수원 그린골프연습장 | 야외, 주차, 카페, 퍼팅 | 4.2 |
| **경기** | 분당 센트럴골프 | 스크린, 실내, 주차, 락커, 카페 | 4.4 |
| **경기** | 일산 레이크골프연습장 | 야외, 주차, 벙커, 퍼팅 | 4.1 |
| **인천** | 인천공항 스카이골프 | 야외, 실내, 스크린, 주차, 카페 | 4.0 |
| **부산** | 해운대 비치골프 | 야외, 스크린, 주차, 카페, 락커, 샤워 | 4.6 |
| **부산** | 서면 골프존 파크 | 스크린, 실내, 주차, 카페, 락커 | 4.3 |
| **대구** | 대구 팔공산 골프연습장 | 야외, 주차, 퍼팅, 벙커, 카페 | 4.4 |
| **대전** | 대전 유성 골프파크 | 야외, 실내, 스크린, 주차, 카페, 샤워 | 4.2 |
| **광주** | 광주 무등산 골프아카데미 | 야외, 주차, 퍼팅, 카페 | 4.1 |
| **제주** | 제주 오션뷰 골프레인지 | 야외, 주차, 카페, 퍼팅 | 4.8 |
| **제주** | 서귀포 골프존 프리미엄 | 스크린, 실내, 주차, 락커, 카페 | 4.5 |
| **강원** | 춘천 의암호 골프연습장 | 야외, 주차, 퍼팅, 벙커 | 4.3 |

---

### 5. 폴더 구조 변경

#### 새로 추가된 파일/폴더
```
lib/actions/
  ├── referrals.ts          # 추천인 시스템
  ├── points.ts             # 포인트/경험치/뱃지
  └── events.ts             # 이벤트/프로모션

components/
  └── ShareButton.tsx       # SNS 공유 버튼

app/(main)/mypage/points/
  ├── page.tsx              # 포인트 메인 페이지
  └── CheckInButton.tsx     # 출석 체크 버튼

scripts/
  └── import-practice-ranges.js  # 연습장 데이터 임포트

supabase/migrations/
  └── APPLY_ALL_MIGRATIONS.sql   # 통합 마이그레이션 파일
```

---

## 기능 상세

### 포인트 시스템

**포인트 획득**:
| 활동 | 포인트 |
|------|--------|
| 회원가입 | 3,000P |
| 출석 체크 (기본) | 100P |
| 출석 체크 (3일 연속) | 200P |
| 출석 체크 (7일 연속) | 500P |
| 친구 추천 (추천인) | 5,000P |
| 친구 추천 (피추천인) | 3,000P |

**포인트 사용** (향후 구현):
- 프리미엄 멤버십 구독
- 레슨 예약 할인
- 중고거래 수수료 대체

### 경험치/레벨 시스템

| 레벨 | 필요 경험치 |
|------|-------------|
| Lv.1 | 0 |
| Lv.2 | 100 |
| Lv.3 | 500 |
| Lv.4 | 1,500 |
| Lv.5 | 5,000 |
| Lv.6 | 10,000 |

### 추천인 시스템

**흐름**:
1. 사용자 A 회원가입 → 추천 코드 자동 생성 (GOLF-ABC123)
2. 사용자 A가 친구 B에게 추천 코드 공유
3. 친구 B가 회원가입 시 추천 코드 입력
4. 사용자 A: 5,000P 획득 + 추천 횟수 증가
5. 친구 B: 기본 3,000P + 추천 보너스 3,000P = 6,000P

---

## 다음 작업

### 필수
1. [ ] TypeScript 타입 생성: `npx supabase gen types typescript`
2. [ ] 빌드 & 배포 확인

### 선택
3. [ ] 추가 연습장 데이터 (Google Places API)
4. [ ] 관리자 페이지 보안 강화
5. [ ] 프리미엄 멤버십 결제 연동 (토스페이먼츠/아임포트)

---

## 참고

### 마이그레이션 재실행 방법

Supabase Dashboard에서 이미 테이블이 있는 경우:
```sql
-- 테이블 삭제 후 재생성
DROP TABLE IF EXISTS referral_codes CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
-- ... 기타 테이블
```

또는 `APPLY_ALL_MIGRATIONS.sql` 파일 사용 (DROP POLICY IF EXISTS 포함)

### 연습장 추가 임포트 방법

1. **Admin 페이지**: https://www.golfearn.com/admin/practice-range-import
   - 로그인 필요
   - Google Places API로 검색 후 등록

2. **스크립트**: `node scripts/import-practice-ranges.js`
   - 샘플 데이터에 연습장 추가 후 실행
   - Service Role Key 사용 (로그인 불필요)
