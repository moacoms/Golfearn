import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. 로그인 체크
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=로그인이 필요합니다')
  }

  // 2. 관리자 권한 체크
  // Note: is_admin 필드가 DB에 추가된 후에는 타입 캐스팅 제거 가능
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single() as { data: { is_admin?: boolean } | null }

  const isAdmin = profile?.is_admin === true

  if (!isAdmin) {
    redirect('/?message=관리자만 접근할 수 있습니다')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 관리자 네비게이션 */}
      <div className="bg-gray-900 text-white">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="font-bold text-lg">Golfearn Admin</span>
              <nav className="flex items-center gap-4 text-sm">
                <Link href="/admin" className="hover:text-primary">
                  대시보드
                </Link>
                <Link href="/admin/clubs" className="hover:text-primary">
                  클럽 관리
                </Link>
                <Link href="/admin/clubs/pending" className="hover:text-primary">
                  대기 클럽
                </Link>
                <Link href="/admin/marketing" className="hover:text-primary">
                  마케팅
                </Link>
                <Link href="/admin/practice-range-import" className="hover:text-primary">
                  연습장
                </Link>
              </nav>
            </div>
            <Link href="/" className="text-sm hover:text-primary">
              ← 사이트로 돌아가기
            </Link>
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <main>{children}</main>
    </div>
  )
}
