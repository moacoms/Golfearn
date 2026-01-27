export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pre_registrations: {
        Row: {
          id: number
          email: string
          name: string | null
          source: string
          created_at: string
        }
        Insert: {
          id?: never
          email: string
          name?: string | null
          source?: string
          created_at?: string
        }
        Update: {
          id?: never
          email?: string
          name?: string | null
          source?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          height: number | null
          golf_started_at: string | null
          average_score: number | null
          location: string | null
          latitude: number | null
          longitude: number | null
          bio: string | null
          created_at: string
          updated_at: string
          // 위치 기반 필드
          location_address: string | null
          location_dong: string | null
          location_gu: string | null
          location_city: string | null
          location_lat: number | null
          location_lng: number | null
          location_range: number
          is_admin: boolean
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          height?: number | null
          golf_started_at?: string | null
          average_score?: number | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          // 위치 기반 필드
          location_address?: string | null
          location_dong?: string | null
          location_gu?: string | null
          location_city?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_range?: number
          is_admin?: boolean
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          height?: number | null
          golf_started_at?: string | null
          average_score?: number | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          // 위치 기반 필드
          location_address?: string | null
          location_dong?: string | null
          location_gu?: string | null
          location_city?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_range?: number
          is_admin?: boolean
        }
      }
      posts: {
        Row: {
          id: number
          user_id: string
          category: 'qna' | 'free' | 'review'
          title: string
          content: string
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          user_id: string
          category: 'qna' | 'free' | 'review'
          title: string
          content: string
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: never
          user_id?: string
          category?: 'qna' | 'free' | 'review'
          title?: string
          content?: string
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: number
          post_id: number
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          post_id: number
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: never
          post_id?: number
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: number
          user_id: string
          category: 'driver' | 'wood' | 'iron' | 'putter' | 'wedge' | 'set' | 'bag' | 'wear' | 'etc'
          title: string
          description: string | null
          price: number
          condition: 'S' | 'A' | 'B' | 'C' | null
          images: string[]
          status: 'selling' | 'reserved' | 'sold'
          location: string | null
          latitude: number | null
          longitude: number | null
          view_count: number
          created_at: string
          updated_at: string
          // 위치 기반 필드
          location_address: string | null
          location_dong: string | null
          location_gu: string | null
          location_city: string | null
          location_lat: number | null
          location_lng: number | null
          use_seller_location: boolean
        }
        Insert: {
          id?: never
          user_id: string
          category: 'driver' | 'wood' | 'iron' | 'putter' | 'wedge' | 'set' | 'bag' | 'wear' | 'etc'
          title: string
          description?: string | null
          price: number
          condition?: 'S' | 'A' | 'B' | 'C' | null
          images?: string[]
          status?: 'selling' | 'reserved' | 'sold'
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          view_count?: number
          created_at?: string
          updated_at?: string
          // 위치 기반 필드
          location_address?: string | null
          location_dong?: string | null
          location_gu?: string | null
          location_city?: string | null
          location_lat?: number | null
          location_lng?: number | null
          use_seller_location?: boolean
        }
        Update: {
          id?: never
          user_id?: string
          category?: 'driver' | 'wood' | 'iron' | 'putter' | 'wedge' | 'set' | 'bag' | 'wear' | 'etc'
          title?: string
          description?: string | null
          price?: number
          condition?: 'S' | 'A' | 'B' | 'C' | null
          images?: string[]
          status?: 'selling' | 'reserved' | 'sold'
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          view_count?: number
          created_at?: string
          updated_at?: string
          // 위치 기반 필드
          location_address?: string | null
          location_dong?: string | null
          location_gu?: string | null
          location_city?: string | null
          location_lat?: number | null
          location_lng?: number | null
          use_seller_location?: boolean
        }
      }
      favorites: {
        Row: {
          id: number
          user_id: string
          product_id: number
          created_at: string
        }
        Insert: {
          id?: never
          user_id: string
          product_id: number
          created_at?: string
        }
        Update: {
          id?: never
          user_id?: string
          product_id?: number
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: number
          product_id: number
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: never
          product_id: number
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: never
          product_id?: number
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_post_view: {
        Args: { post_id: number }
        Returns: void
      }
      increment_product_view: {
        Args: { product_id: number }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// 편의를 위한 타입 별칭
export type PreRegistration = Database['public']['Tables']['pre_registrations']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']
export type Message = Database['public']['Tables']['messages']['Row']

// Insert/Update 타입
export type PreRegistrationInsert = Database['public']['Tables']['pre_registrations']['Insert']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type PostUpdate = Database['public']['Tables']['posts']['Update']
export type CommentInsert = Database['public']['Tables']['comments']['Insert']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

// 카테고리 타입
export type PostCategory = 'qna' | 'free' | 'review'
export type ProductCategory = 'driver' | 'wood' | 'iron' | 'putter' | 'wedge' | 'set' | 'bag' | 'wear' | 'etc'
export type ProductCondition = 'S' | 'A' | 'B' | 'C'
export type ProductStatus = 'selling' | 'reserved' | 'sold'

// =============================================
// 위치 관련 타입
// =============================================

// 위치 정보
export type LocationInfo = {
  address: string | null      // 전체 주소
  dong: string | null         // 동
  gu: string | null           // 구
  city: string | null         // 시/도
  lat: number | null          // 위도
  lng: number | null          // 경도
}

// 검색 범위 (km)
export type LocationRange = 1 | 3 | 5 | 10 | 20

// 위치가 포함된 상품 (거리 계산 포함)
export interface ProductWithDistance extends Product {
  distance?: number           // 사용자로부터의 거리 (km)
  seller?: Profile           // 판매자 정보
}

// Google Maps Geocoding API 응답 타입
export interface GoogleGeocodingResult {
  formatted_address: string
  address_components: {
    long_name: string
    short_name: string
    types: string[]
  }[]
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  place_id: string
}

export interface GoogleGeocodingResponse {
  results: GoogleGeocodingResult[]
  status: string
}

// 파싱된 한국 주소
export interface ParsedKoreanAddress {
  address: string
  dong: string | null         // 동/읍/면/리
  gu: string | null           // 구/군/시
  city: string | null         // 시/도
  lat: number
  lng: number
}

// =============================================
// 조인 매칭 관련 타입
// =============================================

// 조인 모집글 상태
export type JoinPostStatus = 'recruiting' | 'full' | 'confirmed' | 'completed' | 'cancelled'

// 참가 신청 상태
export type ParticipantStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

// 조인 모집글
export interface JoinPost {
  id: number
  user_id: string
  title: string
  description: string | null
  round_date: string
  round_time: string
  golf_course_name: string
  golf_course_address: string | null
  total_slots: number
  current_slots: number
  min_score: number | null
  max_score: number | null
  green_fee: number | null
  cart_fee: number | null
  caddie_fee: number | null
  location_dong: string | null
  location_gu: string | null
  location_city: string | null
  location_lat: number | null
  location_lng: number | null
  status: JoinPostStatus
  view_count: number
  created_at: string
  updated_at: string
}

// 호스트 정보가 포함된 조인 모집글
export interface JoinPostWithHost extends JoinPost {
  profiles: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
    average_score: number | null
    golf_started_at: string | null
    location_dong: string | null
  } | null
  distance?: number
  participants_count?: number
}

// 참가 신청
export interface JoinParticipant {
  id: number
  join_post_id: number
  user_id: string
  message: string | null
  status: ParticipantStatus
  created_at: string
  updated_at: string
}

// 프로필 정보가 포함된 참가자
export interface ParticipantWithProfile extends JoinParticipant {
  profiles: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
    average_score: number | null
    golf_started_at: string | null
  } | null
}

// =============================================
// Golf Analysis Types (2026-01-26)
// =============================================

// 사용자 골프 프로필
export interface UserGolfProfile {
  id: string
  user_id: string
  height_cm: number | null
  weight_kg: number | null
  gender: 'male' | 'female' | 'other' | null
  handedness: 'right' | 'left'
  handicap: number | null
  experience_years: number | null
  swing_speed_level: 'slow' | 'moderate' | 'fast' | 'very_fast' | null
  typical_miss: string | null
  primary_goal: string | null
  target_handicap: number | null
  distance_unit: 'yards' | 'meters'
  speed_unit: 'mph' | 'kmh'
  preferred_language: string
  created_at: string
  updated_at: string
}

// 스윙 세션
export interface SwingSession {
  id: string
  user_id: string
  session_date: string
  session_type: 'practice' | 'round' | 'fitting'
  location_name: string | null
  data_source: string
  weather_condition: string | null
  temperature_celsius: number | null
  notes: string | null
  analysis_status: 'pending' | 'analyzing' | 'completed' | 'failed'
  analysis_credits_used: number
  created_at: string
  updated_at: string
  // Relations
  swing_analyses?: SwingAnalysis[]
  shot_data?: ShotData[]
}

// 개별 샷 데이터
export interface ShotData {
  id: string
  session_id: string
  user_id: string
  club_type: string
  club_name: string | null
  carry_distance: number | null
  total_distance: number | null
  offline_distance: number | null
  ball_speed_mph: number | null
  launch_angle: number | null
  peak_height: number | null
  land_angle: number | null
  back_spin_rpm: number | null
  side_spin_rpm: number | null
  spin_axis: number | null
  club_speed_mph: number | null
  attack_angle: number | null
  club_path: number | null
  face_angle: number | null
  face_to_path: number | null
  dynamic_loft: number | null
  smash_factor: number | null
  impact_location: string | null
  shot_result: string | null
  shot_quality: number | null
  ocr_raw_data: Json | null
  ocr_image_url: string | null
  created_at: string
}

// AI 분석 결과
export interface SwingAnalysis {
  id: string
  session_id: string
  user_id: string
  analysis_type: 'session' | 'weekly' | 'monthly' | 'club_specific'
  club_type: string | null
  summary: string
  strengths: Json | null
  weaknesses: Json | null
  recommendations: Json | null
  distance_analysis: Json | null
  accuracy_analysis: Json | null
  consistency_analysis: Json | null
  spin_analysis: Json | null
  comparison_to_previous: Json | null
  comparison_to_average: Json | null
  comparison_to_peers: Json | null
  drill_recommendations: Json | null
  focus_areas: Json | null
  ai_model_version: string | null
  analysis_language: string | null
  tokens_used: number | null
  created_at: string
}

// 목표
export interface SwingGoal {
  id: string
  user_id: string
  goal_type: string
  club_type: string | null
  target_value: number
  current_value: number | null
  start_value: number | null
  start_date: string
  target_date: string
  status: 'active' | 'achieved' | 'failed' | 'cancelled'
  achieved_at: string | null
  progress_percentage: number
  created_at: string
  updated_at: string
}

// 구독 정보
export interface Subscription {
  id: string
  user_id: string
  lemon_squeezy_customer_id: string | null
  lemon_squeezy_subscription_id: string | null
  lemon_squeezy_order_id: string | null
  plan_type: 'free' | 'basic' | 'pro' | 'annual'
  status: 'active' | 'cancelled' | 'past_due' | 'expired'
  current_period_start: string | null
  current_period_end: string | null
  cancelled_at: string | null
  monthly_analysis_count: number
  monthly_analysis_limit: number
  monthly_ocr_count: number
  monthly_ocr_limit: number
  currency: string
  price_paid: number | null
  created_at: string
  updated_at: string
}

// 사용량 로그
export interface UsageLog {
  id: string
  user_id: string
  usage_type: 'analysis' | 'ocr' | 'ai_chat'
  session_id: string | null
  tokens_used: number | null
  success: boolean
  error_message: string | null
  created_at: string
}

// 클럽별 통계
export interface ClubStatistics {
  id: string
  user_id: string
  club_type: string
  total_shots: number
  avg_carry: number | null
  avg_total: number | null
  avg_ball_speed: number | null
  avg_club_speed: number | null
  avg_launch_angle: number | null
  avg_back_spin: number | null
  avg_smash_factor: number | null
  carry_std_dev: number | null
  offline_std_dev: number | null
  max_carry: number | null
  max_ball_speed: number | null
  last_updated: string
}

// 다국어 콘텐츠
export interface LocalizedContent {
  id: string
  content_key: string
  content_type: 'drill' | 'tip' | 'feedback_template'
  content_en: string
  content_ko: string | null
  content_ja: string | null
  content_zh: string | null
  category: string | null
  tags: string[] | null
  video_url: string | null
  created_at: string
  updated_at: string
}
