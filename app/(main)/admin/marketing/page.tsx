'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MarketingDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'schedule' | 'settings'>(
    'overview'
  )

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">마케팅 자동화</h1>
        <div className="flex gap-2">
          <Link
            href="https://cloud.n8n.io"
            target="_blank"
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            n8n 열기 ↗
          </Link>
          <Link
            href="https://console.anthropic.com"
            target="_blank"
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Claude API ↗
          </Link>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b mb-6">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          개요
        </TabButton>
        <TabButton active={activeTab === 'content'} onClick={() => setActiveTab('content')}>
          콘텐츠
        </TabButton>
        <TabButton active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')}>
          스케줄
        </TabButton>
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
          설정
        </TabButton>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'content' && <ContentTab />}
      {activeTab === 'schedule' && <ScheduleTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  )
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-muted hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* 시스템 상태 */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatusCard title="AI 마케팅 팀" status="active" detail="7개 에이전트 활성" />
        <StatusCard title="n8n 자동화" status="pending" detail="설정 필요" />
        <StatusCard title="콘텐츠 생성" status="active" detail="테스트 완료" />
        <StatusCard title="채널 연동" status="pending" detail="계정 생성 필요" />
      </div>

      {/* 빠른 시작 가이드 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">🚀 빠른 시작 가이드</h2>
        <div className="space-y-3">
          <ChecklistItem
            done={true}
            title="AI 마케팅 팀 설정"
            description="에이전트 7개 구성 완료"
          />
          <ChecklistItem
            done={true}
            title="콘텐츠 스타일 가이드"
            description="골린이 타겟 가이드 작성 완료"
          />
          <ChecklistItem
            done={true}
            title="테스트 콘텐츠 생성"
            description="'연습장 처음 가는 법' 콘텐츠 생성 완료"
          />
          <ChecklistItem
            done={false}
            title="채널 계정 생성"
            description="YouTube, Instagram, X, 블로그 계정 생성"
            link="/admin/marketing?tab=settings"
          />
          <ChecklistItem
            done={false}
            title="n8n 워크플로우 설정"
            description="자동화 워크플로우 가져오기"
            link="https://cloud.n8n.io"
          />
          <ChecklistItem
            done={false}
            title="첫 콘텐츠 발행"
            description="각 채널에 첫 콘텐츠 발행"
          />
        </div>
      </div>

      {/* 문서 링크 */}
      <div className="grid md:grid-cols-3 gap-4">
        <DocCard
          title="자동화 시스템 문서"
          description="전체 시스템 아키텍처 및 설정 가이드"
          href="/docs/marketing/AUTOMATION_SYSTEM.md"
        />
        <DocCard
          title="콘텐츠 캘린더"
          description="주간/월간 발행 스케줄"
          href="/docs/marketing/CONTENT_CALENDAR.md"
        />
        <DocCard
          title="채널 운영 가이드"
          description="각 플랫폼별 운영 전략"
          href="/docs/marketing/CHANNEL_GUIDE.md"
        />
      </div>
    </div>
  )
}

function ContentTab() {
  const contentList = [
    {
      date: '2026-01-19',
      topic: '연습장 처음 가는 법',
      status: 'completed',
      platforms: ['blog', 'instagram', 'x', 'youtube', 'cafe'],
    },
  ]

  return (
    <div className="space-y-6">
      {/* 콘텐츠 생성 버튼 */}
      <div className="flex justify-between items-center">
        <p className="text-muted">생성된 마케팅 콘텐츠 목록</p>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
          + 새 콘텐츠 생성
        </button>
      </div>

      {/* 콘텐츠 목록 */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">날짜</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">주제</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">플랫폼</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">상태</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">액션</th>
            </tr>
          </thead>
          <tbody>
            {contentList.map((content, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="px-4 py-3 text-sm">{content.date}</td>
                <td className="px-4 py-3 text-sm font-medium">{content.topic}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {content.platforms.map((p) => (
                      <PlatformBadge key={p} platform={p} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                    완료
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-sm text-primary hover:underline">보기</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 폴더 구조 안내 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">📁 콘텐츠 저장 위치</h3>
        <pre className="text-sm text-muted">
          {`marketing-outputs/
├── brief-[날짜]-[주제].md     # 브리프
├── youtube/                   # YouTube 대본
├── instagram/card-news/       # 인스타 카드뉴스
├── blog/                      # 블로그 글
├── x-threads/                 # X 스레드
├── cafe/                      # 카페 글
└── reviews/                   # 검수 리포트`}
        </pre>
      </div>
    </div>
  )
}

function ScheduleTab() {
  const weekdays = ['월', '화', '수', '목', '금', '토', '일']
  const schedule = [
    { day: '월', time: '10:00', platform: 'blog', content: 'SEO 가이드' },
    { day: '화', time: '19:00', platform: 'instagram', content: '카드뉴스' },
    { day: '수', time: '12:00', platform: 'x', content: '스레드' },
    { day: '목', time: '18:00', platform: 'youtube', content: '메인 영상' },
    { day: '금', time: '11:00', platform: 'cafe', content: '정보글' },
    { day: '토', time: '10:00', platform: 'instagram', content: '릴스' },
    { day: '일', time: '20:00', platform: 'x', content: '짧은 팁' },
  ]

  return (
    <div className="space-y-6">
      <p className="text-muted">주간 콘텐츠 발행 스케줄</p>

      {/* 주간 스케줄 */}
      <div className="grid grid-cols-7 gap-2">
        {weekdays.map((day) => {
          const daySchedule = schedule.filter((s) => s.day === day)
          return (
            <div key={day} className="bg-white rounded-lg border p-3">
              <div className="text-center font-medium mb-2 pb-2 border-b">{day}</div>
              <div className="space-y-2">
                {daySchedule.map((s, i) => (
                  <div key={i} className="text-xs">
                    <div className="text-muted">{s.time}</div>
                    <PlatformBadge platform={s.platform} />
                    <div className="mt-1">{s.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* 자동화 상태 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-medium mb-4">자동화 상태</h3>
        <div className="space-y-3">
          <AutomationStatus platform="blog" status="manual" note="티스토리 API 연동 예정" />
          <AutomationStatus platform="instagram" status="scheduled" note="Buffer로 예약 발행" />
          <AutomationStatus platform="x" status="auto" note="n8n 자동 발행" />
          <AutomationStatus platform="youtube" status="manual" note="수동 업로드 필요" />
          <AutomationStatus platform="cafe" status="manual" note="직접 작성 필요" />
        </div>
      </div>
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      {/* 채널 계정 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-medium mb-4">📱 채널 계정</h3>
        <div className="space-y-4">
          <ChannelRow
            platform="YouTube"
            handle="@golfearn"
            status="pending"
            setupLink="https://studio.youtube.com"
          />
          <ChannelRow
            platform="Instagram"
            handle="@golfearn"
            status="pending"
            setupLink="https://instagram.com"
          />
          <ChannelRow
            platform="X (Twitter)"
            handle="@golfearn"
            status="pending"
            setupLink="https://twitter.com"
          />
          <ChannelRow
            platform="네이버 블로그"
            handle="blog.naver.com/golfearn"
            status="pending"
            setupLink="https://blog.naver.com"
          />
          <ChannelRow
            platform="티스토리"
            handle="golfearn.tistory.com"
            status="pending"
            setupLink="https://tistory.com"
          />
        </div>
      </div>

      {/* API 설정 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-medium mb-4">🔑 API 설정</h3>
        <div className="space-y-4">
          <ApiRow
            name="Claude API"
            status="required"
            description="AI 콘텐츠 생성에 필요"
            setupLink="https://console.anthropic.com"
          />
          <ApiRow
            name="n8n"
            status="optional"
            description="자동화 워크플로우"
            setupLink="https://cloud.n8n.io"
          />
          <ApiRow
            name="Twitter API"
            status="optional"
            description="X 자동 발행"
            setupLink="https://developer.twitter.com"
          />
        </div>
      </div>

      {/* 운영 도구 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-medium mb-4">🛠 운영 도구</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <ToolCard
            name="Canva"
            description="이미지/영상 제작"
            link="https://canva.com"
            free={true}
          />
          <ToolCard
            name="Buffer"
            description="SNS 예약 발행"
            link="https://buffer.com"
            free={true}
          />
          <ToolCard
            name="CapCut"
            description="영상 편집"
            link="https://capcut.com"
            free={true}
          />
          <ToolCard name="Vrew" description="AI 자막 생성" link="https://vrew.ai" free={true} />
        </div>
      </div>
    </div>
  )
}

// 유틸 컴포넌트들
function StatusCard({
  title,
  status,
  detail,
}: {
  title: string
  status: 'active' | 'pending' | 'error'
  detail: string
}) {
  const statusColors = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{title}</span>
        <span className={`px-2 py-0.5 text-xs rounded ${statusColors[status]}`}>
          {status === 'active' ? '활성' : status === 'pending' ? '대기' : '오류'}
        </span>
      </div>
      <p className="text-sm text-muted">{detail}</p>
    </div>
  )
}

function ChecklistItem({
  done,
  title,
  description,
  link,
}: {
  done: boolean
  title: string
  description: string
  link?: string
}) {
  const content = (
    <div className="flex items-start gap-3">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
      >
        {done ? '✓' : '○'}
      </div>
      <div>
        <div className={`font-medium ${done ? 'text-muted line-through' : ''}`}>{title}</div>
        <div className="text-sm text-muted">{description}</div>
      </div>
    </div>
  )

  if (link && !done) {
    return (
      <a href={link} className="block hover:bg-gray-50 p-2 -mx-2 rounded">
        {content}
      </a>
    )
  }

  return <div className="p-2 -mx-2">{content}</div>
}

function DocCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <div className="bg-white rounded-lg border p-4 hover:border-primary transition-colors">
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted mb-2">{description}</p>
      <span className="text-xs text-primary">{href}</span>
    </div>
  )
}

function PlatformBadge({ platform }: { platform: string }) {
  const icons: Record<string, string> = {
    blog: '📝',
    instagram: '📸',
    x: '🐦',
    youtube: '🎬',
    cafe: '☕',
  }

  return (
    <span className="inline-flex items-center px-1.5 py-0.5 text-xs bg-gray-100 rounded">
      {icons[platform] || '📄'} {platform}
    </span>
  )
}

function AutomationStatus({
  platform,
  status,
  note,
}: {
  platform: string
  status: 'auto' | 'scheduled' | 'manual'
  note: string
}) {
  const statusColors = {
    auto: 'bg-green-100 text-green-700',
    scheduled: 'bg-blue-100 text-blue-700',
    manual: 'bg-gray-100 text-gray-700',
  }
  const statusLabels = {
    auto: '자동',
    scheduled: '예약',
    manual: '수동',
  }

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-2">
        <PlatformBadge platform={platform} />
        <span className="text-sm text-muted">{note}</span>
      </div>
      <span className={`px-2 py-0.5 text-xs rounded ${statusColors[status]}`}>
        {statusLabels[status]}
      </span>
    </div>
  )
}

function ChannelRow({
  platform,
  handle,
  status,
  setupLink,
}: {
  platform: string
  handle: string
  status: 'connected' | 'pending'
  setupLink: string
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div>
        <div className="font-medium">{platform}</div>
        <div className="text-sm text-muted">{handle}</div>
      </div>
      <div className="flex items-center gap-2">
        {status === 'connected' ? (
          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">연결됨</span>
        ) : (
          <a
            href={setupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark"
          >
            설정하기
          </a>
        )}
      </div>
    </div>
  )
}

function ApiRow({
  name,
  status,
  description,
  setupLink,
}: {
  name: string
  status: 'connected' | 'required' | 'optional'
  description: string
  setupLink: string
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted">{description}</div>
      </div>
      <a
        href={setupLink}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
      >
        설정 ↗
      </a>
    </div>
  )
}

function ToolCard({
  name,
  description,
  link,
  free,
}: {
  name: string
  description: string
  link: string
  free: boolean
}) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
    >
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted">{description}</div>
      </div>
      {free && <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">무료</span>}
    </a>
  )
}
