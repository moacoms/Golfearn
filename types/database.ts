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
