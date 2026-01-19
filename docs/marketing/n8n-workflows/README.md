# Golfearn n8n 워크플로우 가이드

## 셋업 순서

### 1. n8n 계정 생성
1. https://cloud.n8n.io 접속
2. 무료 계정 생성 (2,500 실행/월 무료)
3. 또는 셀프 호스팅 (Docker)

### 2. Credentials 설정

#### Claude API (Anthropic)
1. https://console.anthropic.com 접속
2. API Keys → Create Key
3. n8n에서: Settings → Credentials → Add Credential
4. Type: "Header Auth"
5. Name: `x-api-key`
6. Value: `sk-ant-...` (발급받은 키)

#### Slack (선택)
1. https://api.slack.com/apps 접속
2. Create New App → From scratch
3. Bot Token Scopes: `chat:write`
4. Install to Workspace
5. n8n에서 Slack 연동

### 3. 워크플로우 가져오기

1. n8n 대시보드 → Workflows
2. Import from File
3. `weekly-content-generation.json` 선택
4. Credentials 연결
5. 테스트 실행

---

## 워크플로우 목록

### 1. weekly-content-generation.json
**용도**: 매주 월요일 자동 콘텐츠 생성

**플로우**:
```
매주 월 9시 → 주제 선정 → 브리프 생성 →
콘텐츠 생성 (블로그, X, 인스타) → Slack 알림
```

**설정 필요**:
- Anthropic API Key
- Slack Webhook (선택)

### 2. daily-publish.json (예정)
**용도**: 매일 예약 발행

### 3. trend-monitor.json (예정)
**용도**: 골프 트렌드 모니터링

---

## 비용 예상

| 항목 | 월 비용 |
|------|--------|
| n8n Cloud (Starter) | $20 |
| Claude API (~50,000 토큰/주) | ~$5-10 |
| **총합** | **~$25-30/월** |

### 무료로 운영하려면
- n8n: 셀프 호스팅 (Railway, Render 등)
- Claude: 무료 티어 or 다른 모델

---

## 커스터마이징

### 주제 변경
`select-topic` 노드의 프롬프트 수정

### 콘텐츠 스타일 변경
각 writer 노드의 프롬프트 수정

### 발행 스케줄 변경
`trigger` 노드의 cron 표현식 수정
```
0 9 * * 1  → 매주 월요일 9시
0 10 * * * → 매일 10시
0 9 * * 1,3,5 → 월/수/금 9시
```

---

## 트러블슈팅

### Claude API 오류
- API 키 확인
- 크레딧 잔액 확인
- Rate limit 확인 (분당 요청 수)

### Slack 알림 안 됨
- Bot Token 권한 확인
- 채널 이름 확인 (# 포함)
- Bot이 채널에 초대되었는지 확인

### 워크플로우 실행 안 됨
- n8n 플랜 실행 횟수 확인
- 트리거 활성화 확인
- 에러 로그 확인
