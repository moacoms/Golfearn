import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyJoins } from '@/lib/actions/join'
import JoinCard from '@/components/join/JoinCard'

export default async function MyJoinsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { hosted, participated } = await getMyJoins()

  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/mypage"
              className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              마이페이지
            </Link>
            <h1 className="text-3xl font-bold">내 조인</h1>
          </div>
          <Link href="/join/create" className="btn btn-primary">
            조인 모집하기
          </Link>
        </div>

        {/* 내가 모집한 조인 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            내가 모집한 조인
            {hosted.length > 0 && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-sm rounded-full">
                {hosted.length}
              </span>
            )}
          </h2>

          {hosted.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {hosted.map((post) => (
                <JoinCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-muted mb-4">아직 모집한 조인이 없습니다</p>
              <Link href="/join/create" className="btn btn-primary">
                첫 조인 모집하기
              </Link>
            </div>
          )}
        </section>

        {/* 내가 신청한 조인 */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            내가 신청한 조인
            {participated.length > 0 && (
              <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-sm rounded-full">
                {participated.length}
              </span>
            )}
          </h2>

          {participated.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {participated.map((post) => (
                <JoinCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-muted mb-4">아직 신청한 조인이 없습니다</p>
              <Link href="/join" className="btn btn-outline">
                조인 찾아보기
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
