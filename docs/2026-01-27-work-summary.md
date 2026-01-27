# 2026-01-27 작업 요약

## 핵심 작업: UI 통합 + 인증 + 샷 데이터 확장

### 배경
- 페이지마다 헤더/푸터가 각각 다르게 구현되어 있어 일관성 부족
- 분석 페이지(`/analysis/new`)에 로그인 없이 접근 가능
- 샷 데이터 입력 필드가 기본 6개로 부족 (스매시팩터, 어택앵글 등 미포함)
- 단위 설정(야드/미터, mph/m·s) 불가

---

## 완료된 작업

### 1. 공통 헤더 컴포넌트 생성 및 적용 ✅
```
components/i18n/LocaleHeader.tsx (신규)

기능:
├── 통일된 ⛳ 로고 + Golfearn 브랜드
├── 네비게이션 (Analysis, Pricing, Community, Market)
├── 현재 페이지 활성 표시 (usePathname)
├── 로그인 상태 감지 (Supabase Auth)
├── 프로필 아바타 or 로그인/분석시작 버튼
├── 언어 전환 (LanguageSwitcher)
├── 모바일 햄버거 메뉴
└── sticky + backdrop-blur 글래스모피즘 효과
```

**제거된 인라인 헤더 (4개 페이지):**
- `app/[locale]/analysis/page.tsx` - 대시보드 헤더 제거
- `app/[locale]/analysis/new/page.tsx` - 새 분석 헤더 제거
- `app/[locale]/analysis/[sessionId]/page.tsx` - 결과 페이지 헤더 제거
- `app/[locale]/pricing/page.tsx` - 가격 페이지 헤더 제거

### 2. 분석 페이지 로그인 인증 추가 ✅
```
app/[locale]/analysis/new/page.tsx

변경 내용:
├── useEffect로 Supabase Auth 체크
├── 비로그인 시 /login?redirect=/analysis/new 으로 리디렉트
└── 인증 확인 중 로딩 스피너 표시
```

### 3. 샷 데이터 필드 확장 및 단위 설정 ✅
```
app/[locale]/analysis/new/page.tsx

새로 추가된 필드 (5개):
├── Smash Factor (스매시팩터) - step 0.01
├── Attack Angle (어택앵글) - 음수 가능
├── Club Path (클럽패스) - 도(°)
├── Face Angle (페이스앵글) - 도(°)
└── Offline Distance (좌우편차) - yards/meters

단위 설정:
├── 거리: Yards ↔ Meters 토글
├── 속도: mph ↔ m/s 토글
├── 플레이스홀더 동적 변경
├── 라벨 단위 동적 변경
└── API에 units 정보 전달
```

---

## 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `components/i18n/LocaleHeader.tsx` | **신규** - 공통 헤더 컴포넌트 |
| `app/[locale]/layout.tsx` | LocaleHeader import 추가 |
| `app/[locale]/page.tsx` | 인라인 헤더 제거 |
| `app/[locale]/analysis/page.tsx` | 인라인 헤더 + LanguageSwitcher 제거 |
| `app/[locale]/analysis/new/page.tsx` | 헤더 제거, 인증 추가, 샷 필드 확장, 단위 설정 |
| `app/[locale]/analysis/[sessionId]/page.tsx` | 인라인 헤더 + LanguageSwitcher 제거 |
| `app/[locale]/pricing/page.tsx` | 인라인 헤더 + LanguageSwitcher 제거 |

---

## 기술 변경 사항

### 샷 데이터 인터페이스 (Before → After)
```typescript
// Before (6개 필드)
interface ShotData {
  ballSpeed?, clubSpeed?, launchAngle?,
  spinRate?, carry?, total?
}

// After (11개 필드)
interface ShotData {
  ballSpeed?, clubSpeed?, smashFactor?,
  launchAngle?, attackAngle?, clubPath?, faceAngle?,
  spinRate?, carry?, total?, offline?
}
```

### 단위 타입
```typescript
type DistanceUnit = 'yards' | 'meters'
type SpeedUnit = 'mph' | 'ms'
```

---

## 다음 작업 (예정)

### 우선순위 1: 결과 페이지 개선
- [ ] 분석 결과에 새 필드 반영 (스매시팩터, 어택앵글 등)
- [ ] 단위 설정에 따른 결과 표시

### 우선순위 2: AI 분석 프롬프트 개선
- [ ] 새 데이터 필드를 활용한 더 정밀한 분석
- [ ] 클럽패스 + 페이스앵글 → 구질 분석 (드로우/페이드/슬라이스)

### 우선순위 3: 기타
- [ ] 로그인 페이지에서 redirect 파라미터 처리
- [ ] TypeScript 타입 재생성 (Supabase)

---

## 내일 시작할 때
```
"분석 결과 페이지에 새 필드 반영하고, AI 프롬프트 개선해주세요"
```
라고 말씀해주시면 이어서 진행하겠습니다.
