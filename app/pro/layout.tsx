import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 프로필 확인 (레슨 프로인지)
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_lesson_pro, name')
    .eq('id', user.id)
    .single()

  if (!profile?.is_lesson_pro) {
    // 레슨 프로가 아니면 프로 등록 페이지로
    redirect('/pro-register')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 프로 전용 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/pro/dashboard" className="text-xl font-bold text-emerald-600">
                Golfearn Pro
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link 
                  href="/pro/dashboard" 
                  className="text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  대시보드
                </Link>
                <Link 
                  href="/pro/students" 
                  className="text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  학생 관리
                </Link>
                <Link 
                  href="/pro/schedule" 
                  className="text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  스케줄
                </Link>
                <Link 
                  href="/pro/packages" 
                  className="text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  수강권
                </Link>
                <Link 
                  href="/pro/income" 
                  className="text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  수입 관리
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {profile.name} 프로님
              </span>
              <Link 
                href="/pro/settings" 
                className="text-gray-500 hover:text-gray-700"
              >
                ⚙️
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 네비게이션 */}
      <nav className="md:hidden bg-white border-b px-4 py-2">
        <div className="flex space-x-4 overflow-x-auto">
          <Link 
            href="/pro/dashboard" 
            className="text-sm text-gray-700 hover:text-emerald-600 whitespace-nowrap"
          >
            대시보드
          </Link>
          <Link 
            href="/pro/students" 
            className="text-sm text-gray-700 hover:text-emerald-600 whitespace-nowrap"
          >
            학생 관리
          </Link>
          <Link 
            href="/pro/schedule" 
            className="text-sm text-gray-700 hover:text-emerald-600 whitespace-nowrap"
          >
            스케줄
          </Link>
          <Link 
            href="/pro/packages" 
            className="text-sm text-gray-700 hover:text-emerald-600 whitespace-nowrap"
          >
            수강권
          </Link>
          <Link 
            href="/pro/income" 
            className="text-sm text-gray-700 hover:text-emerald-600 whitespace-nowrap"
          >
            수입
          </Link>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}