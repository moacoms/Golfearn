export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          requirement_type: string | null
          requirement_value: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          requirement_type?: string | null
          requirement_value?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          requirement_type?: string | null
          requirement_value?: number | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: number
          post_id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: never
          post_id: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: never
          post_id?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_check_ins: {
        Row: {
          check_in_date: string
          consecutive_days: number | null
          created_at: string | null
          id: string
          reward_points: number | null
          user_id: string
        }
        Insert: {
          check_in_date?: string
          consecutive_days?: number | null
          created_at?: string | null
          id?: string
          reward_points?: number | null
          user_id: string
        }
        Update: {
          check_in_date?: string
          consecutive_days?: number | null
          created_at?: string | null
          id?: string
          reward_points?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_check_ins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      event_participants: {
        Row: {
          event_id: string
          id: string
          participated_at: string | null
          reward_claimed: boolean | null
          status: string | null
          submission_data: Json | null
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          participated_at?: string | null
          reward_claimed?: boolean | null
          status?: string | null
          submission_data?: Json | null
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          participated_at?: string | null
          reward_claimed?: boolean | null
          status?: string | null
          submission_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      events: {
        Row: {
          banner_image: string | null
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          max_participants: number | null
          reward_type: string | null
          reward_value: Json | null
          start_date: string | null
          status: string | null
          terms: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          banner_image?: string | null
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          event_type: string
          id?: string
          max_participants?: number | null
          reward_type?: string | null
          reward_value?: Json | null
          start_date?: string | null
          status?: string | null
          terms?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          banner_image?: string | null
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          max_participants?: number | null
          reward_type?: string | null
          reward_value?: Json | null
          start_date?: string | null
          status?: string | null
          terms?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: number
          product_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          product_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          product_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      golf_course_review_helpful: {
        Row: {
          created_at: string | null
          id: number
          review_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          review_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          review_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "golf_course_review_helpful_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "golf_course_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "golf_course_review_helpful_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      golf_course_reviews: {
        Row: {
          content: string
          course_condition: number | null
          created_at: string | null
          facilities: number | null
          golf_course_name: string
          helpful_count: number | null
          id: number
          place_id: string
          rating: number
          service: number | null
          title: string | null
          updated_at: string | null
          user_id: string
          value_for_money: number | null
          visit_date: string | null
        }
        Insert: {
          content: string
          course_condition?: number | null
          created_at?: string | null
          facilities?: number | null
          golf_course_name: string
          helpful_count?: number | null
          id?: never
          place_id: string
          rating: number
          service?: number | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          value_for_money?: number | null
          visit_date?: string | null
        }
        Update: {
          content?: string
          course_condition?: number | null
          created_at?: string | null
          facilities?: number | null
          golf_course_name?: string
          helpful_count?: number | null
          id?: never
          place_id?: string
          rating?: number
          service?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          value_for_money?: number | null
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "golf_course_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      join_chat_reads: {
        Row: {
          id: number
          join_post_id: number
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          id?: never
          join_post_id: number
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          id?: never
          join_post_id?: number
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "join_chat_reads_join_post_id_fkey"
            columns: ["join_post_id"]
            isOneToOne: false
            referencedRelation: "join_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "join_chat_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      join_messages: {
        Row: {
          content: string
          created_at: string | null
          id: number
          join_post_id: number
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: never
          join_post_id: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: never
          join_post_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "join_messages_join_post_id_fkey"
            columns: ["join_post_id"]
            isOneToOne: false
            referencedRelation: "join_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "join_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      join_participants: {
        Row: {
          created_at: string | null
          id: number
          join_post_id: number
          message: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          join_post_id: number
          message?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          join_post_id?: number
          message?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "join_participants_join_post_id_fkey"
            columns: ["join_post_id"]
            isOneToOne: false
            referencedRelation: "join_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "join_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      join_posts: {
        Row: {
          caddie_fee: number | null
          cart_fee: number | null
          created_at: string | null
          current_slots: number
          description: string | null
          golf_course_address: string | null
          golf_course_name: string
          green_fee: number | null
          id: number
          location_city: string | null
          location_dong: string | null
          location_gu: string | null
          location_lat: number | null
          location_lng: number | null
          max_score: number | null
          min_score: number | null
          round_date: string
          round_time: string
          status: string
          title: string
          total_slots: number
          updated_at: string | null
          user_id: string
          view_count: number
        }
        Insert: {
          caddie_fee?: number | null
          cart_fee?: number | null
          created_at?: string | null
          current_slots?: number
          description?: string | null
          golf_course_address?: string | null
          golf_course_name: string
          green_fee?: number | null
          id?: never
          location_city?: string | null
          location_dong?: string | null
          location_gu?: string | null
          location_lat?: number | null
          location_lng?: number | null
          max_score?: number | null
          min_score?: number | null
          round_date: string
          round_time: string
          status?: string
          title: string
          total_slots?: number
          updated_at?: string | null
          user_id: string
          view_count?: number
        }
        Update: {
          caddie_fee?: number | null
          cart_fee?: number | null
          created_at?: string | null
          current_slots?: number
          description?: string | null
          golf_course_address?: string | null
          golf_course_name?: string
          green_fee?: number | null
          id?: never
          location_city?: string | null
          location_dong?: string | null
          location_gu?: string | null
          location_lat?: number | null
          location_lng?: number | null
          max_score?: number | null
          min_score?: number | null
          round_date?: string
          round_time?: string
          status?: string
          title?: string
          total_slots?: number
          updated_at?: string | null
          user_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "join_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_inquiries: {
        Row: {
          created_at: string | null
          id: number
          lesson_type: string | null
          message: string
          preferred_time: string | null
          pro_id: number
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          lesson_type?: string | null
          message: string
          preferred_time?: string | null
          pro_id: number
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          lesson_type?: string | null
          message?: string
          preferred_time?: string | null
          pro_id?: number
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_inquiries_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "lesson_pros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_inquiries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_pro_reviews: {
        Row: {
          content: string | null
          created_at: string | null
          id: number
          lesson_type: string | null
          pro_id: number
          rating: number
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: never
          lesson_type?: string | null
          pro_id: number
          rating: number
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: never
          lesson_type?: string | null
          pro_id?: number
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_pro_reviews_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "lesson_pros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_pro_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_pros: {
        Row: {
          available_times: string | null
          certifications: string[] | null
          contact_kakao: string | null
          contact_phone: string | null
          created_at: string | null
          experience_years: number | null
          gallery_images: string[] | null
          google_place_id: string | null
          id: number
          instagram: string | null
          introduction: string | null
          is_active: boolean | null
          is_verified: boolean | null
          lesson_types: string[] | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          name: string
          price_group: number | null
          price_individual: number | null
          profile_image: string | null
          rating: number | null
          regions: string[] | null
          review_count: number | null
          specialties: string[] | null
          updated_at: string | null
          user_id: string | null
          youtube: string | null
        }
        Insert: {
          available_times?: string | null
          certifications?: string[] | null
          contact_kakao?: string | null
          contact_phone?: string | null
          created_at?: string | null
          experience_years?: number | null
          gallery_images?: string[] | null
          google_place_id?: string | null
          id?: never
          instagram?: string | null
          introduction?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          lesson_types?: string[] | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          name: string
          price_group?: number | null
          price_individual?: number | null
          profile_image?: string | null
          rating?: number | null
          regions?: string[] | null
          review_count?: number | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          youtube?: string | null
        }
        Update: {
          available_times?: string | null
          certifications?: string[] | null
          contact_kakao?: string | null
          contact_phone?: string | null
          created_at?: string | null
          experience_years?: number | null
          gallery_images?: string[] | null
          google_place_id?: string | null
          id?: never
          instagram?: string | null
          introduction?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          lesson_types?: string[] | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          price_group?: number | null
          price_individual?: number | null
          profile_image?: string | null
          rating?: number | null
          regions?: string[] | null
          review_count?: number | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_pros_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: number
          is_read: boolean | null
          product_id: number
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          product_id: number
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          product_id?: number
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: number
          is_read: boolean | null
          link: string | null
          message: string | null
          related_id: number | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          related_id?: number | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          related_id?: number | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      point_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      point_wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          total_earned: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      post_bookmarks: {
        Row: {
          created_at: string | null
          id: number
          post_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          post_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          post_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: number
          post_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          post_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          post_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          bookmark_count: number | null
          category: string
          content: string
          created_at: string | null
          id: number
          images: string[] | null
          like_count: number | null
          title: string
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          bookmark_count?: number | null
          category: string
          content: string
          created_at?: string | null
          id?: never
          images?: string[] | null
          like_count?: number | null
          title: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          bookmark_count?: number | null
          category?: string
          content?: string
          created_at?: string | null
          id?: never
          images?: string[] | null
          like_count?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_ranges: {
        Row: {
          address: string | null
          booth_count: number | null
          created_at: string | null
          description: string | null
          facilities: string[] | null
          floor_count: number | null
          google_place_id: string | null
          google_rating: number | null
          google_review_count: number | null
          id: number
          images: string[] | null
          is_active: boolean | null
          location_lat: number | null
          location_lng: number | null
          name: string
          operating_hours: string | null
          phone: string | null
          price_info: string | null
          region: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          booth_count?: number | null
          created_at?: string | null
          description?: string | null
          facilities?: string[] | null
          floor_count?: number | null
          google_place_id?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          id?: never
          images?: string[] | null
          is_active?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          name: string
          operating_hours?: string | null
          phone?: string | null
          price_info?: string | null
          region?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          booth_count?: number | null
          created_at?: string | null
          description?: string | null
          facilities?: string[] | null
          floor_count?: number | null
          google_place_id?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          id?: never
          images?: string[] | null
          is_active?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          operating_hours?: string | null
          phone?: string | null
          price_info?: string | null
          region?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      pre_registrations: {
        Row: {
          created_at: string | null
          email: string
          id: number
          name: string | null
          source: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: never
          name?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: never
          name?: string | null
          source?: string | null
        }
        Relationships: []
      }
      premium_subscription_history: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_status: string | null
          note: string | null
          previous_status: string | null
          subscription_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_status?: string | null
          note?: string | null
          previous_status?: string | null
          subscription_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_status?: string | null
          note?: string | null
          previous_status?: string | null
          subscription_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_subscription_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "premium_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premium_subscription_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      premium_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          end_date: string
          id: string
          payment_method: string | null
          plan: string | null
          price: number
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date: string
          id?: string
          payment_method?: string | null
          plan?: string | null
          price: number
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date?: string
          id?: string
          payment_method?: string | null
          plan?: string | null
          price?: number
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          condition: string | null
          created_at: string | null
          description: string | null
          id: number
          images: string[] | null
          latitude: number | null
          location: string | null
          location_address: string | null
          location_city: string | null
          location_dong: string | null
          location_gu: string | null
          location_lat: number | null
          location_lng: number | null
          longitude: number | null
          price: number
          status: string | null
          title: string
          updated_at: string | null
          use_seller_location: boolean | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          category: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          images?: string[] | null
          latitude?: number | null
          location?: string | null
          location_address?: string | null
          location_city?: string | null
          location_dong?: string | null
          location_gu?: string | null
          location_lat?: number | null
          location_lng?: number | null
          longitude?: number | null
          price: number
          status?: string | null
          title: string
          updated_at?: string | null
          use_seller_location?: boolean | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          category?: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          images?: string[] | null
          latitude?: number | null
          location?: string | null
          location_address?: string | null
          location_city?: string | null
          location_dong?: string | null
          location_gu?: string | null
          location_lat?: number | null
          location_lng?: number | null
          longitude?: number | null
          price?: number
          status?: string | null
          title?: string
          updated_at?: string | null
          use_seller_location?: boolean | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          average_score: number | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          golf_started_at: string | null
          height: number | null
          id: string
          latitude: number | null
          location: string | null
          location_address: string | null
          location_city: string | null
          location_dong: string | null
          location_gu: string | null
          location_lat: number | null
          location_lng: number | null
          location_range: number | null
          longitude: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          average_score?: number | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          golf_started_at?: string | null
          height?: number | null
          id: string
          latitude?: number | null
          location?: string | null
          location_address?: string | null
          location_city?: string | null
          location_dong?: string | null
          location_gu?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_range?: number | null
          longitude?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          average_score?: number | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          golf_started_at?: string | null
          height?: number | null
          id?: string
          latitude?: number | null
          location?: string | null
          location_address?: string | null
          location_city?: string | null
          location_dong?: string | null
          location_gu?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_range?: number | null
          longitude?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      promo_code_usage: {
        Row: {
          discount_amount: number
          id: string
          order_id: string | null
          order_type: string | null
          promo_code_id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          discount_amount: number
          id?: string
          order_id?: string | null
          order_type?: string | null
          promo_code_id: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          discount_amount?: number
          id?: string
          order_id?: string | null
          order_type?: string | null
          promo_code_id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_usage_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          applicable_to: string | null
          code: string
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          usage_count: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_to?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_to?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          user_id: string
          uses_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          user_id: string
          uses_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          user_id?: string
          uses_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          reward_given: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          reward_given?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          reward_given?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_experience: {
        Row: {
          created_at: string | null
          id: string
          level: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
          xp: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
          xp?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_experience_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      xp_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      referral_leaderboard: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          rank: number | null
          referral_count: number | null
          referrer_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      referral_stats: {
        Row: {
          referral_code: string | null
          referrer_email: string | null
          referrer_id: string | null
          rewarded_referrals: number | null
          total_referrals: number | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_stats: {
        Row: {
          badge_count: number | null
          email: string | null
          level: number | null
          points: number | null
          premium_status: string | null
          referral_count: number | null
          total_xp: number | null
          user_id: string | null
        }
        Relationships: []
      }
      xp_leaderboard: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          level: number | null
          rank: number | null
          total_xp: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_experience_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      calculate_distance_km: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      generate_referral_code: { Args: { user_id: string }; Returns: string }
      get_products_by_distance: {
        Args: { max_distance_km?: number; user_lat: number; user_lon: number }
        Returns: {
          distance_km: number
          id: number
          latitude: number
          location: string
          longitude: number
          price: number
          title: string
        }[]
      }
      get_products_within_range: {
        Args: { range_km?: number; user_lat: number; user_lng: number }
        Returns: {
          distance_km: number
          product_id: number
        }[]
      }
      increment_join_post_view: {
        Args: { post_id: number }
        Returns: undefined
      }
      increment_post_view: { Args: { post_id: number }; Returns: undefined }
      increment_product_view: {
        Args: { product_id: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
