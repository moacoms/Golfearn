'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CommunitySearch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentSearch = searchParams.get('search') || ''
  const [search, setSearch] = useState(currentSearch)

  // URL 검색어가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    setSearch(currentSearch)
  }, [currentSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }
    router.push(`/community?${params.toString()}`)
  }

  const clearSearch = () => {
    setSearch('')
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    router.push(`/community?${params.toString()}`)
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="제목, 내용으로 검색"
          className="input pl-10 pr-20 w-full"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-1 text-muted hover:text-foreground"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark"
          >
            검색
          </button>
        </div>
      </form>

      {currentSearch && (
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
            &quot;{currentSearch}&quot;
            <button onClick={clearSearch} className="hover:text-primary-dark">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        </div>
      )}
    </div>
  )
}
