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
