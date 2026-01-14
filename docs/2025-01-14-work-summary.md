# 2025-01-14 작업 내역

## 오늘 완료한 작업

### 1. 골프장 검색 - 위치 선택 기능 추가

**문제**: 위치 정보(GPS)를 가져올 수 없을 때 사용자가 골프장을 검색할 수 없음

**해결**:
- 18개 한국 주요 지역 선택 버튼 추가
- 위치 권한 실패 시 지역 선택 UI 자동 표시
- 위치 권한 성공해도 "다른 지역에서 찾기" 버튼으로 수동 변경 가능

**지역 목록**:
- 서울, 경기 북부(의정부), 경기 남부(수원), 인천
- 부산, 대구, 대전, 광주, 울산, 세종
- 강원(춘천), 충북(청주), 충남(천안)
- 전북(전주), 전남(목포), 경북(포항), 경남(창원), 제주

**수정 파일**: `app/(main)/golf-courses/page.tsx`

---

### 2. 골프장 상세 페이지 클라이언트 에러 수정

**문제**: 골프장 클릭 시 "Application error: a client-side exception has occurred" 발생

**원인**: `use(params)` React hook 사용 시 hydration 문제

**해결**:
- `use(params)` → `useParams()` from 'next/navigation'으로 변경
- placeId URL 인코딩 추가
- 사진, 리뷰 데이터에 null 체크 추가

**수정 파일**: `app/(main)/golf-courses/[id]/page.tsx`

---

### 3. 이메일 인증 설정 검토 및 문서화

**현재 상태**:
- Supabase 이메일 인증: ON
- 이메일 발송: Supabase 기본 (무료 티어 제한 있음)
- 발신자: `noreply@mail.app.supabase.io`

**문서화 완료**:
- 이메일 템플릿 한글화 내용
- Custom SMTP 설정 방법 (Resend)
- CLAUDE.md에 "Supabase 이메일 인증 설정" 섹션 추가

**이메일 템플릿 (한글)**:
```
제목: [Golfearn] 이메일 인증을 완료해주세요
```

---

## 배포

**커밋**: `945b732`
```
fix: 위치 선택 기능 추가 및 골프장 상세 페이지 에러 수정

- 위치 정보 실패 시 수동 지역 선택 기능 추가 (18개 한국 주요 도시/지역)
- 위치 권한 성공해도 "다른 지역에서 찾기" 버튼으로 변경 가능
- 골프장 상세 페이지: use(params) → useParams() 변경으로 클라이언트 에러 수정
- 사진, 리뷰 등 컴포넌트에 null 체크 추가
```

**Vercel 배포**: 자동 배포 완료

---

## 다음 작업 (TODO)

- [ ] 이메일 발신자 변경 (Custom SMTP - Resend 설정)
- [ ] 레슨프로 매칭 기능
- [ ] AI 클럽 추천 기능

---

## 관련 파일

### 수정된 파일
- `app/(main)/golf-courses/page.tsx` - 지역 선택 기능 추가
- `app/(main)/golf-courses/[id]/page.tsx` - 에러 수정
- `CLAUDE.md` - 이메일 설정 섹션 추가

### API 엔드포인트
- `GET /api/places/nearby` - 주변 골프장 검색
- `GET /api/places/details` - 골프장 상세 정보
