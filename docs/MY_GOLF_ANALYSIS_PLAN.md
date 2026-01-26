# 나의골프분석 (My Golf Analysis) - 상세 기획서

> **버전**: v1.0
> **작성일**: 2026-01-26
> **목표**: 글로벌 골프 스윙 데이터 분석 AI 서비스

---

## 1. 서비스 개요

### 1.1 비전

```
Before: Golfearn (한국 골린이 커뮤니티)
After:  Golfearn (Global Golf Swing Analytics AI)

슬로건: "Your AI Golf Coach - Analyze, Improve, Track"
한글: "AI가 분석하는 나만의 골프 코치"
```

### 1.2 핵심 가치 제안

| 기존 레슨 | Golfearn AI |
|----------|-------------|
| 월 30~50만원 | 월 $9.99 (12,900원) |
| 시간/장소 제약 | 24시간 언제 어디서나 |
| 주관적 피드백 | 데이터 기반 객관적 분석 |
| 기록 없음 | 모든 데이터 자동 저장 |
| 발전 추적 어려움 | 시각적 발전 그래프 |

### 1.3 타겟 시장

```yaml
Primary:
  - 한국: 골린이 (35-55세), 550만 골프 인구
  - 일본: 아마추어 골퍼, 870만 골프 인구
  - 미국: Recreational golfers, 2,500만 골프 인구

Secondary:
  - 유럽 (영국, 독일)
  - 동남아시아 (태국, 베트남 - 골프 성장 시장)
```

### 1.4 경쟁 분석

| 서비스 | 기능 | 가격 | 차별점 |
|--------|------|------|--------|
| Arccos | GPS + 클럽 추적 | $199/yr + 센서 | 하드웨어 필요 |
| Garmin Golf | GPS + 스윙 | $99/yr | 가민 기기 필요 |
| V1 Golf | 영상 분석 | $9.99/mo | 영상만 가능 |
| Shot Scope | 통계 + GPS | $199/yr | 센서 필요 |
| **Golfearn** | 론치모니터 데이터 분석 | $9.99/mo | **하드웨어 불필요, OCR 지원** |

**우리의 차별점:**
1. 하드웨어/센서 구매 불필요
2. 기존 론치모니터(트랙맨, 골프존 등) 데이터 활용
3. OCR로 사진만 찍으면 자동 입력
4. AI 레슨프로 수준의 피드백

---

## 2. 데이터베이스 스키마

### 2.1 핵심 테이블

```sql
-- =============================================
-- 나의골프분석 (My Golf Analysis) 스키마
-- =============================================

-- 1. 사용자 골프 프로필 (확장)
CREATE TABLE user_golf_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- 신체 정보
  height_cm INTEGER,
  weight_kg INTEGER,
  gender VARCHAR(10), -- male, female, other
  handedness VARCHAR(10) DEFAULT 'right', -- right, left

  -- 골프 정보
  handicap DECIMAL(4,1),
  experience_years INTEGER,
  swing_speed_level VARCHAR(20), -- slow, moderate, fast, very_fast
  typical_miss VARCHAR(50), -- slice, hook, fat, thin, top

  -- 목표
  primary_goal VARCHAR(100), -- distance, accuracy, consistency
  target_handicap DECIMAL(4,1),

  -- 선호 단위
  distance_unit VARCHAR(10) DEFAULT 'yards', -- yards, meters
  speed_unit VARCHAR(10) DEFAULT 'mph', -- mph, kmh

  -- 언어 설정
  preferred_language VARCHAR(5) DEFAULT 'en', -- en, ko, ja, zh

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 스윙 세션 (연습/라운드 단위)
CREATE TABLE swing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 세션 정보
  session_date DATE NOT NULL,
  session_type VARCHAR(20) NOT NULL, -- practice, round, fitting
  location_name VARCHAR(200),
  data_source VARCHAR(50) NOT NULL, -- trackman, golfzon, gdr, kakao, manual, ocr

  -- 메타데이터
  weather_condition VARCHAR(50), -- clear, cloudy, windy, rainy
  temperature_celsius INTEGER,
  notes TEXT,

  -- 분석 상태
  analysis_status VARCHAR(20) DEFAULT 'pending', -- pending, analyzing, completed, failed
  analysis_credits_used INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 개별 샷 데이터
CREATE TABLE shot_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES swing_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 클럽 정보
  club_type VARCHAR(20) NOT NULL, -- driver, 3wood, 5wood, hybrid, 3iron...pw, gw, sw, lw, putter
  club_name VARCHAR(100), -- 구체적인 클럽명

  -- 거리 데이터 (야드 기준 저장, 표시시 변환)
  carry_distance DECIMAL(5,1),
  total_distance DECIMAL(5,1),
  offline_distance DECIMAL(5,1), -- 좌우 편차 (+ = 오른쪽)

  -- 볼 데이터
  ball_speed_mph DECIMAL(5,1),
  launch_angle DECIMAL(4,1),
  peak_height DECIMAL(5,1), -- 최고점 (야드)
  land_angle DECIMAL(4,1), -- 낙하각

  -- 스핀 데이터
  back_spin_rpm INTEGER,
  side_spin_rpm INTEGER, -- + = 오른쪽 스핀
  spin_axis DECIMAL(4,1), -- 스핀 축 각도

  -- 클럽 데이터
  club_speed_mph DECIMAL(5,1),
  attack_angle DECIMAL(4,1), -- + = 업, - = 다운
  club_path DECIMAL(4,1), -- + = 인투아웃
  face_angle DECIMAL(4,1), -- + = 오픈
  face_to_path DECIMAL(4,1), -- 페이스 vs 패스 차이
  dynamic_loft DECIMAL(4,1),

  -- 임팩트
  smash_factor DECIMAL(4,2),
  impact_location VARCHAR(50), -- center, toe, heel, high, low

  -- 샷 결과
  shot_result VARCHAR(50), -- straight, fade, draw, slice, hook, push, pull
  shot_quality INTEGER, -- 1-10 자체 평가

  -- OCR 원본 (이미지에서 추출한 경우)
  ocr_raw_data JSONB,
  ocr_image_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AI 분석 결과
CREATE TABLE swing_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES swing_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 분석 유형
  analysis_type VARCHAR(30) NOT NULL, -- session, weekly, monthly, club_specific
  club_type VARCHAR(20), -- 특정 클럽 분석인 경우

  -- AI 분석 결과
  summary TEXT NOT NULL, -- 요약 (다국어)
  strengths JSONB, -- 강점 리스트
  weaknesses JSONB, -- 약점 리스트
  recommendations JSONB, -- 추천 사항 리스트

  -- 상세 분석
  distance_analysis JSONB,
  accuracy_analysis JSONB,
  consistency_analysis JSONB,
  spin_analysis JSONB,

  -- 비교 분석
  comparison_to_previous JSONB, -- 이전 세션 대비
  comparison_to_average JSONB, -- 전체 평균 대비
  comparison_to_peers JSONB, -- 비슷한 실력 대비

  -- 연습 추천
  drill_recommendations JSONB, -- 추천 드릴
  focus_areas JSONB, -- 집중 영역

  -- AI 메타데이터
  ai_model_version VARCHAR(50),
  analysis_language VARCHAR(5),
  tokens_used INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 목표 및 달성
CREATE TABLE swing_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 목표 정보
  goal_type VARCHAR(50) NOT NULL, -- driver_distance, accuracy, handicap, consistency
  club_type VARCHAR(20), -- 특정 클럽인 경우

  -- 목표값
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2),
  start_value DECIMAL(10,2),

  -- 기간
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,

  -- 상태
  status VARCHAR(20) DEFAULT 'active', -- active, achieved, failed, cancelled
  achieved_at TIMESTAMPTZ,

  -- 진행률
  progress_percentage DECIMAL(5,2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 구독 관리
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Lemon Squeezy 연동
  lemon_squeezy_customer_id VARCHAR(100),
  lemon_squeezy_subscription_id VARCHAR(100),
  lemon_squeezy_order_id VARCHAR(100),

  -- 구독 정보
  plan_type VARCHAR(20) NOT NULL DEFAULT 'free', -- free, basic, pro, annual
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, cancelled, past_due, expired

  -- 기간
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- 사용량
  monthly_analysis_count INTEGER DEFAULT 0,
  monthly_analysis_limit INTEGER DEFAULT 3, -- free: 3, basic: unlimited
  monthly_ocr_count INTEGER DEFAULT 0,
  monthly_ocr_limit INTEGER DEFAULT 5, -- free: 5, basic: 50, pro: unlimited

  -- 결제 정보
  currency VARCHAR(3) DEFAULT 'USD',
  price_paid DECIMAL(10,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 사용량 로그
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 사용 유형
  usage_type VARCHAR(30) NOT NULL, -- analysis, ocr, ai_chat

  -- 상세
  session_id UUID REFERENCES swing_sessions(id),
  tokens_used INTEGER,

  -- 결과
  success BOOLEAN DEFAULT true,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 클럽별 통계 (캐시 테이블)
CREATE TABLE club_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  club_type VARCHAR(20) NOT NULL,

  -- 통계 (자동 계산)
  total_shots INTEGER DEFAULT 0,
  avg_carry DECIMAL(5,1),
  avg_total DECIMAL(5,1),
  avg_ball_speed DECIMAL(5,1),
  avg_club_speed DECIMAL(5,1),
  avg_launch_angle DECIMAL(4,1),
  avg_back_spin INTEGER,
  avg_smash_factor DECIMAL(4,2),

  -- 일관성 지표
  carry_std_dev DECIMAL(5,1),
  offline_std_dev DECIMAL(5,1),

  -- 최고 기록
  max_carry DECIMAL(5,1),
  max_ball_speed DECIMAL(5,1),

  -- 기간
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, club_type)
);

-- 인덱스
CREATE INDEX idx_shot_data_session ON shot_data(session_id);
CREATE INDEX idx_shot_data_user ON shot_data(user_id);
CREATE INDEX idx_shot_data_club ON shot_data(club_type);
CREATE INDEX idx_swing_sessions_user_date ON swing_sessions(user_id, session_date DESC);
CREATE INDEX idx_swing_analyses_user ON swing_analyses(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_usage_logs_user_date ON usage_logs(user_id, created_at DESC);

-- RLS 정책
ALTER TABLE user_golf_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE swing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shot_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE swing_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE swing_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_statistics ENABLE ROW LEVEL SECURITY;

-- 본인 데이터만 접근
CREATE POLICY "Users can view own golf profile" ON user_golf_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own sessions" ON swing_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own shots" ON shot_data FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own analyses" ON swing_analyses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own goals" ON swing_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own subscription" ON subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own usage" ON usage_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own statistics" ON club_statistics FOR ALL USING (auth.uid() = user_id);
```

### 2.2 다국어 지원 테이블

```sql
-- 다국어 콘텐츠 (드릴, 팁 등)
CREATE TABLE localized_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_key VARCHAR(100) NOT NULL, -- drill_slice_fix, tip_driver_distance
  content_type VARCHAR(50) NOT NULL, -- drill, tip, feedback_template

  -- 다국어 콘텐츠
  content_en TEXT NOT NULL,
  content_ko TEXT,
  content_ja TEXT,
  content_zh TEXT,

  -- 메타데이터
  category VARCHAR(50),
  tags TEXT[],
  video_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_localized_content_key ON localized_content(content_key);
```

---

## 3. 페이지 구조

### 3.1 URL 구조 (다국어)

```
/[locale]/                          # 랜딩페이지
/[locale]/analysis                  # 분석 대시보드 (메인)
/[locale]/analysis/new              # 새 분석 시작
/[locale]/analysis/[sessionId]      # 세션 상세
/[locale]/analysis/history          # 분석 히스토리
/[locale]/analysis/clubs            # 클럽별 통계
/[locale]/analysis/goals            # 목표 관리
/[locale]/analysis/compare          # 비교 분석

/[locale]/pricing                   # 가격 정책
/[locale]/settings                  # 설정
/[locale]/settings/profile          # 골프 프로필
/[locale]/settings/subscription     # 구독 관리

# 기존 한국어 기능 (숨김 처리 가능)
/ko/community                       # 커뮤니티
/ko/market                          # 중고거래
/ko/join                            # 조인 매칭
```

### 3.2 페이지별 상세

#### 3.2.1 새 랜딩페이지 (`/[locale]/page.tsx`)

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Golfearn                    [Language] [Sign In] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│        Your AI Golf Coach                               │
│        Analyze. Improve. Track.                         │
│                                                         │
│   Upload your launch monitor data and get               │
│   professional-level swing analysis instantly           │
│                                                         │
│   [Start Free Analysis]  [Watch Demo]                   │
│                                                         │
│   ✓ TrackMan  ✓ GolfZon  ✓ GDR  ✓ Kakao VX             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   📸 Upload Photo         📊 Get Analysis               │
│   Take a picture of       AI analyzes your              │
│   your data screen        swing data                    │
│                                                         │
│   📈 Track Progress       🎯 Improve Fast               │
│   See your improvement    Get personalized              │
│   over time               drill recommendations         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   "I improved my driver distance by 15 yards            │
│    in just 2 months using Golfearn AI"                  │
│    - John, handicap 18 → 14                             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Simple Pricing                                        │
│                                                         │
│   FREE          BASIC           PRO                     │
│   $0/mo         $9.99/mo        $19.99/mo              │
│   3 analyses    Unlimited       + Video Analysis        │
│   Basic tips    Full insights   + AI Chat Coach         │
│                                                         │
│   [Get Started Free]                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 3.2.2 분석 대시보드 (`/[locale]/analysis/page.tsx`)

```
┌─────────────────────────────────────────────────────────┐
│ [Logo]    Analysis  History  Goals  Settings   [User]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Welcome back, David!                                   │
│  Your swing is improving! 📈                            │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Driver Avg  │  │ This Month  │  │ Goal        │     │
│  │ 245 yards   │  │ 12 sessions │  │ 260 yards   │     │
│  │ ↑ 8 yards   │  │ ↑ 3 vs last │  │ 58% done    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│  [+ New Analysis]                                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Recent Sessions                                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Jan 25, 2026  •  Practice  •  TrackMan          │   │
│  │ 45 shots  •  Driver avg: 248 yds  •  ✓ Analyzed │   │
│  │ "Great improvement in launch angle..."          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Jan 22, 2026  •  Round  •  GolfZon              │   │
│  │ 32 shots  •  Driver avg: 241 yds  •  ✓ Analyzed │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Club Performance                                       │
│  [Driver] [3Wood] [5Iron] [7Iron] [PW] [SW]            │
│                                                         │
│  📊 [Distance Chart - 최근 10세션 추이]                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 3.2.3 새 분석 페이지 (`/[locale]/analysis/new/page.tsx`)

```
┌─────────────────────────────────────────────────────────┐
│                  New Swing Analysis                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Step 1: Choose Data Source                             │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 📸       │  │ 📋       │  │ 🔗       │              │
│  │ Upload   │  │ Manual   │  │ Connect  │              │
│  │ Photo    │  │ Entry    │  │ API      │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Step 2: Select Launch Monitor                          │
│                                                         │
│  ○ TrackMan    ○ GolfZon    ○ GDR                      │
│  ○ Kakao VX    ○ FlightScope ○ Other                   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Step 3: Upload Data                                    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │     📷 Drag & drop your screen photo here      │   │
│  │         or click to select                      │   │
│  │                                                 │   │
│  │     Supported: JPG, PNG, HEIC                  │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Analyze Now - 2 free analyses left]                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.3 폴더 구조

```
/app
  /[locale]                         # 다국어 루트
    /page.tsx                       # 새 랜딩페이지
    /layout.tsx                     # 다국어 레이아웃

    /analysis                       # 분석 기능
      /page.tsx                     # 대시보드
      /new
        /page.tsx                   # 새 분석
        /upload/page.tsx            # 사진 업로드
        /manual/page.tsx            # 수동 입력
      /[sessionId]
        /page.tsx                   # 세션 상세
      /history/page.tsx             # 히스토리
      /clubs/page.tsx               # 클럽별 통계
      /goals/page.tsx               # 목표 관리
      /compare/page.tsx             # 비교 분석

    /pricing/page.tsx               # 가격
    /settings
      /page.tsx                     # 설정 메인
      /profile/page.tsx             # 골프 프로필
      /subscription/page.tsx        # 구독 관리

    /(legacy)                       # 기존 한국 기능 (조건부 표시)
      /community/...
      /market/...
      /join/...

  /api
    /analysis
      /ocr/route.ts                 # OCR 처리
      /analyze/route.ts             # AI 분석
    /webhooks
      /lemon-squeezy/route.ts       # 결제 웹훅

/components
  /analysis
    /DataSourceSelector.tsx
    /PhotoUploader.tsx
    /ManualEntryForm.tsx
    /ShotDataTable.tsx
    /AnalysisResult.tsx
    /ClubChart.tsx
    /ProgressChart.tsx
    /GoalCard.tsx
  /landing
    /HeroSection.tsx
    /FeatureSection.tsx
    /PricingSection.tsx
    /TestimonialSection.tsx
  /i18n
    /LanguageSwitcher.tsx

/lib
  /i18n
    /config.ts
    /dictionaries/
      /en.json
      /ko.json
      /ja.json
  /ocr
    /google-vision.ts
    /parser-trackman.ts
    /parser-golfzon.ts
    /parser-gdr.ts
  /analysis
    /ai-analyzer.ts
    /statistics.ts
  /payments
    /lemon-squeezy.ts
```

---

## 4. AI 프롬프트 설계

### 4.1 시스템 프롬프트 (레슨프로 페르소나)

```typescript
const SYSTEM_PROMPT = `You are an expert golf teaching professional with 20+ years of experience.
You have trained tour players and helped thousands of amateurs improve their game.

Your personality:
- Encouraging but honest
- Data-driven analysis
- Clear, actionable advice
- Patient with beginners

Your expertise:
- Launch monitor data interpretation (TrackMan, FlightScope, GCQuad)
- Swing mechanics and ball flight laws
- Club fitting knowledge
- Practice drill design

When analyzing data:
1. First identify the PRIMARY issue (there's usually one root cause)
2. Explain the data in simple terms
3. Connect cause and effect (e.g., "Your high spin is caused by...")
4. Provide 1-2 specific drills to fix the issue
5. Set realistic expectations for improvement

Language style:
- Use "you" and "your" for personal connection
- Avoid jargon unless explained
- Be specific with numbers ("add 10 yards" not "hit it farther")

Format your response in markdown with these sections:
## Summary
## Key Findings
## What's Working Well
## Areas to Improve
## Recommended Drills
## Next Session Focus`;
```

### 4.2 분석 프롬프트 템플릿

```typescript
const ANALYSIS_PROMPT = `
Analyze the following golf shot data for a ${handicap} handicap player.

**Player Profile:**
- Height: ${height}cm, Weight: ${weight}kg
- Swing Speed Level: ${swingSpeedLevel}
- Typical Miss: ${typicalMiss}
- Primary Goal: ${primaryGoal}

**Session Info:**
- Date: ${date}
- Type: ${sessionType}
- Data Source: ${dataSource}

**Shot Data (${shots.length} shots with ${clubType}):**
${formatShotData(shots)}

**Previous Session Comparison:**
${previousSessionSummary || 'First session'}

**Instructions:**
1. Analyze the consistency of each metric
2. Identify the root cause of any issues
3. Compare to optimal values for this player's profile
4. Provide specific, actionable recommendations
5. If improvement from previous session, acknowledge it

Respond in ${language}.
`;
```

### 4.3 클럽별 최적값 참조

```typescript
const OPTIMAL_VALUES = {
  driver: {
    amateur: {
      slow: { ballSpeed: 130, launchAngle: 14, spinRate: 3000, smashFactor: 1.42 },
      moderate: { ballSpeed: 150, launchAngle: 12, spinRate: 2700, smashFactor: 1.45 },
      fast: { ballSpeed: 165, launchAngle: 11, spinRate: 2400, smashFactor: 1.48 },
    },
    // ...
  },
  '7iron': {
    amateur: {
      slow: { ballSpeed: 100, launchAngle: 20, spinRate: 6500 },
      // ...
    },
  },
};
```

### 4.4 드릴 추천 로직

```typescript
const DRILL_MAPPINGS = {
  high_spin_driver: {
    drillKey: 'drill_tee_height_low',
    issue: 'High spin causing distance loss',
    fix: 'Lower tee height and focus on hitting up on the ball',
  },
  slice: {
    drillKey: 'drill_headcover_path',
    issue: 'Out-to-in club path causing slice',
    fix: 'Place headcover outside ball, swing to miss it',
  },
  // ... 20+ 드릴 매핑
};
```

---

## 5. OCR 파이프라인

### 5.1 아키텍처

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Upload    │────>│   Google    │────>│   Parser    │
│   Image     │     │   Vision    │     │  (per source)│
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   Validate  │<────│   Extract   │
                    │   & Clean   │     │   Numbers   │
                    └─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │   Save to   │
                    │   Database  │
                    └─────────────┘
```

### 5.2 Google Vision API 연동

```typescript
// lib/ocr/google-vision.ts
import { ImageAnnotatorClient } from '@google-cloud/vision';

const client = new ImageAnnotatorClient();

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  const [result] = await client.textDetection({
    image: { content: imageBuffer.toString('base64') },
  });

  const detections = result.textAnnotations;
  if (!detections || detections.length === 0) {
    throw new Error('No text detected in image');
  }

  return detections[0].description || '';
}
```

### 5.3 데이터 소스별 파서

```typescript
// lib/ocr/parser-trackman.ts
export function parseTrackmanData(ocrText: string): ShotData[] {
  const patterns = {
    ballSpeed: /Ball Speed[:\s]+(\d+\.?\d*)\s*(mph|m\/s)/i,
    clubSpeed: /Club Speed[:\s]+(\d+\.?\d*)\s*(mph|m\/s)/i,
    launchAngle: /Launch Angle[:\s]+(\d+\.?\d*)°?/i,
    spinRate: /Spin Rate[:\s]+(\d+)\s*rpm/i,
    carry: /Carry[:\s]+(\d+\.?\d*)\s*(yds?|m)/i,
    total: /Total[:\s]+(\d+\.?\d*)\s*(yds?|m)/i,
    // ...
  };

  const data: Partial<ShotData> = {};

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = ocrText.match(pattern);
    if (match) {
      data[key] = parseFloat(match[1]);
      // 단위 변환 처리
    }
  }

  return validateAndClean(data);
}
```

```typescript
// lib/ocr/parser-golfzon.ts
export function parseGolfzonData(ocrText: string): ShotData[] {
  // 골프존 특화 패턴 (한글 포함)
  const patterns = {
    ballSpeed: /볼스피드[:\s]+(\d+\.?\d*)/,
    clubSpeed: /헤드스피드[:\s]+(\d+\.?\d*)/,
    carry: /캐리[:\s]+(\d+\.?\d*)/,
    // ...
  };
  // ...
}
```

### 5.4 이미지 전처리

```typescript
// lib/ocr/preprocess.ts
import sharp from 'sharp';

export async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .greyscale()           // 흑백 변환
    .normalize()           // 대비 강화
    .sharpen()             // 선명도 증가
    .resize(1920, null, {  // 해상도 표준화
      withoutEnlargement: true,
    })
    .toBuffer();
}
```

---

## 6. 결제 연동 (Lemon Squeezy)

### 6.1 왜 Lemon Squeezy?

| 기능 | Stripe | Lemon Squeezy |
|------|--------|---------------|
| MoR (세금 자동 처리) | ❌ | ✅ |
| EU VAT 자동 처리 | ❌ | ✅ |
| 한국 원화 지원 | ✅ | ✅ |
| 설정 난이도 | 중간 | 쉬움 |
| 수수료 | 2.9% + 30¢ | 5% + 50¢ |

**결론**: 개인 개발자에게 Lemon Squeezy가 세금/VAT 처리 부담 없이 글로벌 판매 가능

### 6.2 상품 구성

```yaml
Products:
  - name: "Golfearn Basic"
    price: $9.99/month
    features:
      - Unlimited swing analyses
      - Full AI insights
      - Historical tracking
      - 50 OCR scans/month

  - name: "Golfearn Pro"
    price: $19.99/month
    features:
      - Everything in Basic
      - Video swing analysis
      - AI Chat Coach
      - Unlimited OCR
      - Priority support

  - name: "Golfearn Annual"
    price: $99/year (17% off)
    features:
      - Same as Basic
      - 2 months free
```

### 6.3 웹훅 처리

```typescript
// app/api/webhooks/lemon-squeezy/route.ts
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('X-Signature');

  // 서명 검증
  const hmac = crypto.createHmac('sha256', process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!);
  const digest = hmac.update(body).digest('hex');

  if (signature !== digest) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(body);

  switch (event.meta.event_name) {
    case 'subscription_created':
      await handleSubscriptionCreated(event.data);
      break;
    case 'subscription_updated':
      await handleSubscriptionUpdated(event.data);
      break;
    case 'subscription_cancelled':
      await handleSubscriptionCancelled(event.data);
      break;
    case 'subscription_payment_success':
      await handlePaymentSuccess(event.data);
      break;
    case 'subscription_payment_failed':
      await handlePaymentFailed(event.data);
      break;
  }

  return new Response('OK', { status: 200 });
}

async function handleSubscriptionCreated(data: any) {
  const { attributes } = data;

  await supabase.from('subscriptions').upsert({
    user_id: attributes.custom_data.user_id,
    lemon_squeezy_subscription_id: data.id,
    lemon_squeezy_customer_id: attributes.customer_id,
    plan_type: getPlanType(attributes.variant_id),
    status: attributes.status,
    current_period_start: attributes.renews_at,
    current_period_end: attributes.ends_at,
    monthly_analysis_limit: -1, // unlimited
    monthly_ocr_limit: attributes.variant_id === PRO_VARIANT ? -1 : 50,
  });
}
```

### 6.4 결제 페이지 연동

```typescript
// lib/payments/lemon-squeezy.ts
export function getCheckoutUrl(planType: 'basic' | 'pro' | 'annual', userId: string) {
  const variantIds = {
    basic: process.env.LEMON_SQUEEZY_BASIC_VARIANT_ID,
    pro: process.env.LEMON_SQUEEZY_PRO_VARIANT_ID,
    annual: process.env.LEMON_SQUEEZY_ANNUAL_VARIANT_ID,
  };

  const baseUrl = `https://golfearn.lemonsqueezy.com/checkout/buy/${variantIds[planType]}`;

  const params = new URLSearchParams({
    'checkout[custom][user_id]': userId,
    'checkout[email]': '', // 사용자 이메일 자동 입력
  });

  return `${baseUrl}?${params.toString()}`;
}
```

---

## 7. 다국어 지원

### 7.1 next-intl 설정

```typescript
// lib/i18n/config.ts
export const locales = ['en', 'ko', 'ja', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  zh: '中文',
};
```

### 7.2 번역 파일 구조

```json
// lib/i18n/dictionaries/en.json
{
  "common": {
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "logout": "Log Out",
    "settings": "Settings"
  },
  "landing": {
    "hero": {
      "title": "Your AI Golf Coach",
      "subtitle": "Analyze. Improve. Track.",
      "description": "Upload your launch monitor data and get professional-level swing analysis instantly",
      "cta": "Start Free Analysis"
    },
    "features": {
      "upload": {
        "title": "Upload Photo",
        "description": "Take a picture of your data screen"
      },
      "analyze": {
        "title": "Get Analysis",
        "description": "AI analyzes your swing data"
      }
    }
  },
  "analysis": {
    "dashboard": {
      "welcome": "Welcome back, {{name}}!",
      "improving": "Your swing is improving!",
      "newAnalysis": "New Analysis",
      "recentSessions": "Recent Sessions"
    },
    "results": {
      "summary": "Summary",
      "keyFindings": "Key Findings",
      "strengths": "What's Working Well",
      "improvements": "Areas to Improve",
      "drills": "Recommended Drills"
    }
  },
  "pricing": {
    "title": "Simple Pricing",
    "free": {
      "name": "Free",
      "price": "$0",
      "features": ["3 analyses/month", "Basic tips"]
    },
    "basic": {
      "name": "Basic",
      "price": "$9.99",
      "features": ["Unlimited analyses", "Full insights", "Historical tracking"]
    },
    "pro": {
      "name": "Pro",
      "price": "$19.99",
      "features": ["Everything in Basic", "Video analysis", "AI Chat Coach"]
    }
  },
  "units": {
    "yards": "yards",
    "meters": "meters",
    "mph": "mph",
    "kmh": "km/h"
  }
}
```

```json
// lib/i18n/dictionaries/ko.json
{
  "common": {
    "signIn": "로그인",
    "signUp": "회원가입",
    "logout": "로그아웃",
    "settings": "설정"
  },
  "landing": {
    "hero": {
      "title": "AI 골프 코치",
      "subtitle": "분석. 개선. 추적.",
      "description": "론치모니터 데이터를 업로드하면 프로 수준의 스윙 분석을 즉시 받아보세요",
      "cta": "무료 분석 시작"
    }
  },
  "analysis": {
    "dashboard": {
      "welcome": "안녕하세요, {{name}}님!",
      "improving": "스윙이 좋아지고 있어요!",
      "newAnalysis": "새 분석",
      "recentSessions": "최근 세션"
    }
  }
}
```

### 7.3 단위 변환 유틸리티

```typescript
// lib/utils/units.ts
export function convertDistance(yards: number, unit: 'yards' | 'meters'): number {
  if (unit === 'meters') {
    return Math.round(yards * 0.9144 * 10) / 10;
  }
  return yards;
}

export function convertSpeed(mph: number, unit: 'mph' | 'kmh'): number {
  if (unit === 'kmh') {
    return Math.round(mph * 1.60934 * 10) / 10;
  }
  return mph;
}

export function formatDistance(yards: number, unit: 'yards' | 'meters', t: any): string {
  const value = convertDistance(yards, unit);
  return `${value} ${t(`units.${unit}`)}`;
}
```

---

## 8. MVP 개발 로드맵

### Phase 1: 핵심 기능 (Week 1-2)

```
Week 1:
├── Day 1-2: 프로젝트 셋업
│   ├── next-intl 설정
│   ├── 새 DB 마이그레이션
│   └── 폴더 구조 재구성
│
├── Day 3-4: 새 랜딩페이지
│   ├── 히어로 섹션
│   ├── 기능 소개
│   └── 가격 섹션
│
└── Day 5-7: 수동 데이터 입력
    ├── 골프 프로필 설정
    ├── 세션 생성 폼
    └── 샷 데이터 입력 폼

Week 2:
├── Day 1-3: AI 분석 엔진
│   ├── Claude API 연동
│   ├── 분석 프롬프트 최적화
│   └── 결과 표시 UI
│
├── Day 4-5: 대시보드
│   ├── 세션 목록
│   ├── 클럽별 통계
│   └── 발전 차트
│
└── Day 6-7: 테스트 & 수정
    └── E2E 테스트
```

### Phase 2: OCR & 결제 (Week 3-4)

```
Week 3:
├── Day 1-3: OCR 파이프라인
│   ├── Google Vision 연동
│   ├── 이미지 업로드 UI
│   └── TrackMan 파서
│
├── Day 4-5: 추가 파서
│   ├── 골프존 파서
│   └── GDR 파서
│
└── Day 6-7: 결제 연동
    ├── Lemon Squeezy 설정
    └── 웹훅 처리

Week 4:
├── Day 1-2: 구독 관리
│   ├── 구독 상태 UI
│   └── 사용량 추적
│
├── Day 3-4: 다국어 (영어/한국어)
│   ├── 번역 파일
│   └── 언어 전환 UI
│
└── Day 5-7: QA & 런칭
    ├── 버그 수정
    ├── 성능 최적화
    └── 프로덕션 배포
```

### Phase 3: 고도화 (Week 5-8)

```
Week 5-6:
├── 일본어/중국어 추가
├── 목표 관리 기능
├── 비교 분석 기능
└── 이메일 알림

Week 7-8:
├── 영상 분석 (Pro 기능)
├── AI 채팅 코치
├── 추천 드릴 콘텐츠
└── 모바일 최적화
```

### 마일스톤

| 마일스톤 | 목표일 | 성공 기준 |
|---------|--------|----------|
| MVP 런칭 | Week 4 | 수동 입력 + AI 분석 + 결제 작동 |
| OCR 완성 | Week 4 | TrackMan, 골프존 OCR 90% 정확도 |
| 첫 유료 고객 | Week 5 | 1명 이상 유료 전환 |
| 100 유저 | Week 8 | 가입자 100명 (무료+유료) |
| MRR $500 | Week 12 | 월 반복 매출 $500 |

---

## 9. 환경 변수

```env
# 기존 Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
ANTHROPIC_API_KEY=

# OCR
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_PRIVATE_KEY=
GOOGLE_CLOUD_CLIENT_EMAIL=

# Lemon Squeezy
LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_STORE_ID=
LEMON_SQUEEZY_WEBHOOK_SECRET=
LEMON_SQUEEZY_BASIC_VARIANT_ID=
LEMON_SQUEEZY_PRO_VARIANT_ID=
LEMON_SQUEEZY_ANNUAL_VARIANT_ID=

# 다국어
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

---

## 10. 성공 지표 (KPIs)

### 제품 지표

| 지표 | 목표 (Month 1) | 목표 (Month 3) |
|------|---------------|---------------|
| 가입자 수 | 100 | 500 |
| 유료 전환율 | 5% | 10% |
| MRR | $50 | $500 |
| 분석 수/사용자 | 3 | 8 |
| OCR 성공률 | 85% | 95% |

### 기술 지표

| 지표 | 목표 |
|------|------|
| 분석 응답 시간 | < 10초 |
| OCR 처리 시간 | < 5초 |
| 업타임 | 99.5% |
| 에러율 | < 1% |

---

## 11. 리스크 & 대응

| 리스크 | 확률 | 영향 | 대응 |
|--------|------|------|------|
| OCR 정확도 낮음 | 중 | 높 | 수동 입력 대안, 지속 개선 |
| 유료 전환 저조 | 중 | 높 | 무료 기능 제한, 가치 강화 |
| 경쟁사 진입 | 낮 | 중 | 빠른 기능 추가, 커뮤니티 구축 |
| API 비용 증가 | 중 | 중 | 캐싱, 요청 최적화 |

---

## 12. 기존 기능 처리

### 숨김 처리할 기능
- `/community` - 커뮤니티
- `/market` - 중고거래
- `/join` - 조인 매칭
- `/lesson-pro` - 레슨프로
- `/practice-range` - 연습장
- `/club-catalog` - 클럽 카탈로그

### 처리 방법
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const locale = request.nextUrl.pathname.split('/')[1];
  const path = request.nextUrl.pathname;

  // 한국어 사용자만 레거시 기능 접근 허용
  const legacyPaths = ['/community', '/market', '/join', '/lesson-pro'];

  if (legacyPaths.some(p => path.includes(p)) && locale !== 'ko') {
    return NextResponse.redirect(new URL(`/${locale}/analysis`, request.url));
  }
}
```

---

## 13. 향후 확장 계획

### Phase 4+ (Month 3-6)
1. **모바일 앱** - React Native
2. **API 연동** - 골프존/트랙맨 공식 API (파트너십)
3. **소셜 기능** - 친구와 비교, 챌린지
4. **B2B** - 골프 아카데미/피팅센터 대시보드
5. **하드웨어 파트너십** - 론치모니터 제조사 제휴

---

*이 문서는 Golfearn "나의골프분석" 기능의 마스터 기획서입니다.*
*최종 업데이트: 2026-01-26*
