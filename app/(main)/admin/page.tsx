'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Stats {
  totalUsers: number
  totalPosts: number
  totalProducts: number
  totalJoins: number
  todayUsers: number
  todayPosts: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPosts: 0,
    totalProducts: 0,
    totalJoins: 0,
    todayUsers: 0,
    todayPosts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      // 전체 사용자 수
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // 전체 게시글 수
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })

      // 전체 상품 수
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // 전체 조인 수
      const { count: totalJoins } = await supabase
        .from('join_posts')
        .select('*', { count: 'exact', head: true })

      // 오늘 가입한 사용자
      const { count: todayUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today)

      // 오늘 작성된 게시글
      const { count: todayPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today)

      setStats({
        totalUsers: totalUsers || 0,
        totalPosts: totalPosts || 0,
        totalProducts: totalProducts || 0,
        totalJoins: totalJoins || 0,
        todayUsers: todayUsers || 0,
        todayPosts: todayPosts || 0,
      })
      setLoading(false)
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center text-muted">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">관리자 대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="전체 회원" value={stats.totalUsers} />
        <StatCard label="오늘 가입" value={stats.todayUsers} highlight />
        <StatCard label="전체 게시글" value={stats.totalPosts} />
        <StatCard label="오늘 게시글" value={stats.todayPosts} highlight />
        <StatCard label="판매 상품" value={stats.totalProducts} />
        <StatCard label="조인 모집" value={stats.totalJoins} />
      </div>

      {/* 빠른 링크 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickLinkCard
          title="마케팅 자동화"
          description="AI 콘텐츠 생성 및 발행 관리"
          href="/admin/marketing"
          icon="📣"
        />
        <QuickLinkCard
          title="연습장 데이터"
          description="Google Places API로 연습장 가져오기"
          href="/admin/practice-range-import"
          icon="🏌️"
        />
        <QuickLinkCard
          title="콘텐츠 폴더"
          description="생성된 마케팅 콘텐츠 보기"
          href="/admin/marketing/content"
          icon="📁"
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div
      className={`p-4 rounded-lg border ${highlight ? 'bg-primary/5 border-primary' : 'bg-white border-border'}`}
    >
      <div className="text-sm text-muted mb-1">{label}</div>
      <div className={`text-2xl font-bold ${highlight ? 'text-primary' : ''}`}>
        {value.toLocaleString()}
      </div>
    </div>
  )
}

function QuickLinkCard({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: string
}) {
  return (
    <Link
      href={href}
      className="p-6 bg-white rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </Link>
  )
}
