import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getGuideBySlug, guides, categories } from '@/lib/guides'

// 정적 생성을 위한 경로 생성
export function generateStaticParams() {
  return guides.map((guide) => ({
    slug: guide.slug,
  }))
}

// 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)

  if (!guide) {
    return { title: '가이드를 찾을 수 없습니다' }
  }

  return {
    title: `${guide.title} | Golfearn 입문 가이드`,
    description: guide.description,
  }
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)

  if (!guide) {
    notFound()
  }

  const category = categories.find((c) => c.id === guide.category)

  return (
    <div className="py-12">
      <div className="container max-w-3xl">
        {/* 뒤로가기 */}
        <Link
          href="/guide"
          className="inline-flex items-center gap-2 text-muted hover:text-primary mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          가이드 목록으로
        </Link>

        {/* 헤더 */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {category?.icon} {category?.name}
            </span>
            <span className="text-muted text-sm">{guide.readTime} 읽기</span>
            <span className="text-muted text-sm">·</span>
            <span className="text-muted text-sm">{guide.publishedAt}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{guide.title}</h1>
          <p className="text-lg text-muted">{guide.description}</p>
        </header>

        {/* 본문 */}
        <article className="prose prose-lg max-w-none">
          <GuideContent content={guide.content} />
        </article>

        {/* 하단 네비게이션 */}
        <footer className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Link
              href="/guide"
              className="btn btn-outline"
            >
              다른 가이드 보기
            </Link>
            <Link
              href="/community"
              className="btn btn-primary"
            >
              커뮤니티에서 질문하기
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}

// Markdown 스타일 컨텐츠 렌더링
function GuideContent({ content }: { content: string }) {
  // 간단한 마크다운 파싱
  const lines = content.trim().split('\n')
  const elements: React.ReactElement[] = []
  let currentList: string[] = []
  let currentTable: string[][] = []
  let inTable = false

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-6 my-4 space-y-2">
          {currentList.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
          ))}
        </ul>
      )
      currentList = []
    }
  }

  const flushTable = () => {
    if (currentTable.length > 0) {
      const headers = currentTable[0]
      const rows = currentTable.slice(2) // Skip header and separator
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-6">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header, i) => (
                  <th key={i} className="px-4 py-2 text-left font-semibold border-b border-border">
                    {header.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2 border-b border-border">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      currentTable = []
      inTable = false
    }
  }

  const parseInline = (text: string): string => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    // 테이블
    if (trimmed.startsWith('|')) {
      flushList()
      const cells = trimmed.split('|').filter(c => c.trim() !== '')
      if (cells.length > 0) {
        inTable = true
        currentTable.push(cells)
      }
      return
    } else if (inTable) {
      flushTable()
    }

    // 빈 줄
    if (trimmed === '') {
      flushList()
      return
    }

    // 제목
    if (trimmed.startsWith('## ')) {
      flushList()
      elements.push(
        <h2 key={index} className="text-2xl font-bold mt-10 mb-4">
          {trimmed.slice(3)}
        </h2>
      )
      return
    }

    if (trimmed.startsWith('### ')) {
      flushList()
      elements.push(
        <h3 key={index} className="text-xl font-semibold mt-8 mb-3">
          {trimmed.slice(4)}
        </h3>
      )
      return
    }

    // 리스트
    if (trimmed.startsWith('- ')) {
      currentList.push(trimmed.slice(2))
      return
    }

    // 숫자 리스트
    if (/^\d+\.\s/.test(trimmed)) {
      flushList()
      const match = trimmed.match(/^\d+\.\s(.+)/)
      if (match) {
        elements.push(
          <p key={index} className="my-2 pl-6">
            <span className="font-semibold">{trimmed.split('.')[0]}.</span>{' '}
            <span dangerouslySetInnerHTML={{ __html: parseInline(match[1]) }} />
          </p>
        )
      }
      return
    }

    // 일반 단락
    flushList()
    elements.push(
      <p key={index} className="my-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: parseInline(trimmed) }} />
    )
  })

  flushList()
  flushTable()

  return <>{elements}</>
}
