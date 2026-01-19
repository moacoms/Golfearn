// =============================================
// Golf Club Catalog Types
// =============================================

// 클럽 타입
export type ClubType = 'driver' | 'wood' | 'hybrid' | 'iron' | 'wedge' | 'putter'

// 샤프트 강도
export type ShaftFlex = 'L' | 'A' | 'SR' | 'R' | 'S' | 'X'

// 샤프트 재질
export type ShaftMaterial = 'steel' | 'graphite'

// 핸드
export type HandType = 'right' | 'left' | 'both'

// 상품 상태
export type ProductCondition = 'S' | 'A' | 'B' | 'C'

// 미스샷 경향
export type MissTendency = 'slice' | 'hook' | 'thin' | 'fat'

// 우선 요소
export type PriorityFactor = 'distance' | 'accuracy' | 'feel'

// =============================================
// 브랜드
// =============================================

export interface GolfClubBrand {
  id: number
  name: string
  name_ko: string | null
  logo_url: string | null
  country: string | null
  website_url: string | null
  description: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

// =============================================
// 클럽 카탈로그
// =============================================

export interface ClubSpecs {
  head_volume?: string // "460cc"
  length?: string // "45.75"
  weight?: string // "300g"
  MOI?: string // "5000"
  swing_weight?: string // "D2"
  lie_angle?: string // "58°"
  face_angle?: string // "0.5° closed"
  [key: string]: string | undefined
}

export interface UsedPriceGuide {
  S?: number
  A?: number
  B?: number
  C?: number
}

export interface GolfClub {
  id: number
  brand_id: number | null

  // 기본 정보
  name: string
  name_ko: string | null
  model_year: number | null
  club_type: ClubType

  // 스펙 정보
  loft: number[] | null
  shaft_flex: ShaftFlex[] | null
  shaft_material: ShaftMaterial[] | null
  hand: HandType

  // 상세 스펙
  specs: ClubSpecs

  // 가격 정보
  release_price: number | null
  current_price: number | null
  used_price_guide: UsedPriceGuide

  // 추천 조건
  recommended_handicap_min: number | null
  recommended_handicap_max: number | null
  recommended_swing_speed_min: number | null
  recommended_swing_speed_max: number | null
  recommended_height_min: number | null
  recommended_height_max: number | null

  // 특성 레벨 (1-5)
  forgiveness_level: number
  distance_level: number
  control_level: number
  feel_level: number

  // 미스샷 보정
  miss_tendency_fix: MissTendency[] | null

  // 콘텐츠
  description: string | null
  features: string[] | null
  image_urls: string[] | null
  video_url: string | null

  // 통계
  rating: number
  review_count: number
  view_count: number

  // 상태
  is_active: boolean
  is_featured: boolean

  created_at: string
  updated_at: string
}

// 브랜드 정보 포함된 클럽
export interface GolfClubWithBrand extends GolfClub {
  brand: GolfClubBrand | null
}

// =============================================
// 클럽 리뷰
// =============================================

export interface GolfClubReview {
  id: number
  club_id: number
  user_id: string

  rating: number
  title: string | null
  content: string | null

  // 상세 평점
  forgiveness_rating: number | null
  distance_rating: number | null
  control_rating: number | null
  feel_rating: number | null
  value_rating: number | null

  // 리뷰어 정보
  reviewer_handicap: number | null
  reviewer_height: number | null
  ownership_period: string | null

  images: string[] | null
  helpful_count: number

  created_at: string
  updated_at: string
}

// 프로필 포함된 리뷰
export interface GolfClubReviewWithProfile extends GolfClubReview {
  profiles: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
}

// =============================================
// 시세 히스토리
// =============================================

export interface GolfClubPriceHistory {
  id: number
  club_id: number
  condition: ProductCondition
  price: number
  source: string | null
  source_id: string | null
  recorded_at: string
}

// =============================================
// 사용자 프로필 (추천용)
// =============================================

export interface UserClubProfile {
  id: number
  user_id: string

  // 신체 정보
  height: number | null
  arm_length: number | null

  // 골프 실력
  handicap: number | null
  average_score: number | null
  swing_speed: number | null

  // 플레이 스타일
  miss_tendency: MissTendency[] | null
  priority_factor: PriorityFactor[] | null

  // 장비 선호
  preferred_shaft_flex: ShaftFlex | null
  preferred_shaft_material: ShaftMaterial | null

  // 예산
  budget_driver: number | null
  budget_iron: number | null
  budget_putter: number | null

  // 보유 클럽
  current_driver_id: number | null
  current_iron_id: number | null

  created_at: string
  updated_at: string
}

// =============================================
// AI 추천 관련 타입
// =============================================

// 추천 입력
export interface ClubRecommendationInput {
  height?: number // cm
  handicap?: number
  average_score?: number
  swing_speed?: number // mph
  miss_tendency?: MissTendency[]
  priority_factor?: PriorityFactor[]
  budget?: number
  club_type?: ClubType
}

// 추천 결과
export interface ClubRecommendation {
  club: GolfClubWithBrand
  score: number // 추천 점수 (0-100)
  reasons: string[] // 추천 이유
  match_details: {
    skill_match: number // 실력 매칭 점수
    spec_match: number // 스펙 매칭 점수
    budget_match: number // 예산 매칭 점수
    preference_match: number // 선호도 매칭 점수
  }
}

// =============================================
// 필터/검색 관련 타입
// =============================================

export interface ClubFilters {
  brand_id?: number
  club_type?: ClubType
  model_year?: number
  min_price?: number
  max_price?: number
  shaft_flex?: ShaftFlex
  shaft_material?: ShaftMaterial
  forgiveness_level_min?: number
  search?: string
  sort_by?: 'rating' | 'price_asc' | 'price_desc' | 'newest' | 'popular'
  is_featured?: boolean
}

// =============================================
// 카테고리 라벨
// =============================================

export const CLUB_TYPE_LABELS: Record<ClubType, string> = {
  driver: '드라이버',
  wood: '우드',
  hybrid: '하이브리드',
  iron: '아이언',
  wedge: '웨지',
  putter: '퍼터',
}

export const SHAFT_FLEX_LABELS: Record<ShaftFlex, string> = {
  L: 'L (레이디스)',
  A: 'A (시니어)',
  SR: 'SR (시니어 레귤러)',
  R: 'R (레귤러)',
  S: 'S (스티프)',
  X: 'X (엑스트라 스티프)',
}

export const SHAFT_MATERIAL_LABELS: Record<ShaftMaterial, string> = {
  steel: '스틸',
  graphite: '그라파이트',
}

export const CONDITION_LABELS: Record<ProductCondition, { name: string; description: string }> = {
  S: { name: 'S급', description: '거의 새것' },
  A: { name: 'A급', description: '상태 좋음' },
  B: { name: 'B급', description: '사용감 있음' },
  C: { name: 'C급', description: '사용감 많음' },
}

export const MISS_TENDENCY_LABELS: Record<MissTendency, string> = {
  slice: '슬라이스',
  hook: '훅',
  thin: '탑볼',
  fat: '뒷땅',
}

export const PRIORITY_FACTOR_LABELS: Record<PriorityFactor, string> = {
  distance: '비거리',
  accuracy: '정확성',
  feel: '타감',
}
