import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Service role key를 사용하는 관리자 전용 클라이언트
// 이 클라이언트는 RLS를 우회하며, 서버 사이드에서만 사용해야 합니다
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for admin client')
  }

  return createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}