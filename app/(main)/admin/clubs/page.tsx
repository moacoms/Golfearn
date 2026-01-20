'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getAdminClubs, getAdminBrands, deleteAdminClub } from '@/lib/actions/admin-clubs'
import { GolfClubWithBrand, GolfClubBrand, ClubType, CLUB_TYPE_LABELS } from '@/types/club'

export default function AdminClubsPage() {
  const searchParams = useSearchParams()

  const [clubs, setClubs] = useState<GolfClubWithBrand[]>([])
  const [brands, setBrands] = useState<GolfClubBrand[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [clubType, setClubType] = useState<ClubType | ''>(
    (searchParams.get('type') as ClubType) || ''
  )
  const [brandId, setBrandId] = useState(searchParams.get('brand') || '')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  const limit = 20

  useEffect(() => {
    loadData()
  }, [page, clubType, brandId])

  useEffect(() => {
    loadBrands()
  }, [])

  async function loadData() {
    setLoading(true)
    const result = await getAdminClubs({
      page,
      limit,
      search: search || undefined,
      club_type: clubType || undefined,
      brand_id: brandId ? Number(brandId) : undefined,
    })
    setClubs(result.clubs)
    setTotal(result.total)
    setLoading(false)
  }

  async function loadBrands() {
    const data = await getAdminBrands()
    setBrands(data)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    loadData()
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`"${name}" 클럽을 삭제하시겠습니까?`)) return

    const result = await deleteAdminClub(id)
    if (result.success) {
      loadData()
    } else {
      alert('삭제 실패: ' + result.error)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">클럽 관리</h1>
        <Link
          href="/admin/clubs/new"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          + 새 클럽 추가
        </Link>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="클럽명 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          />

          <select
            value={clubType}
            onChange={(e) => {
              setClubType(e.target.value as ClubType | '')
              setPage(1)
            }}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">모든 타입</option>
            {Object.entries(CLUB_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={brandId}
            onChange={(e) => {
              setBrandId(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">모든 브랜드</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name_ko || brand.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            검색
          </button>
        </form>
      </div>

      <div className="text-sm text-gray-600 mb-4">총 {total}개 클럽</div>

      {/* 클럽 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : clubs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">클럽이 없습니다.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">클럽</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">타입</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">연도</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가격</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clubs.map((club) => (
                <tr key={club.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium">{club.brand?.name} {club.name}</p>
                    <p className="text-sm text-gray-500">{club.name_ko}</p>
                  </td>
                  <td className="px-6 py-4 text-sm">{CLUB_TYPE_LABELS[club.club_type]}</td>
                  <td className="px-6 py-4 text-sm">{club.model_year || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    {club.current_price ? `${club.current_price.toLocaleString()}원` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {club.is_active ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">활성</span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">비활성</span>
                      )}
                      {club.is_featured && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">추천</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <Link href={`/club-catalog/${club.id}`} target="_blank" className="text-gray-500 hover:text-gray-700">
                        보기
                      </Link>
                      <Link href={`/admin/clubs/${club.id}`} className="text-blue-600 hover:text-blue-800">
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(club.id, club.name)}
                        className="text-red-600 hover:text-red-800"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            이전
          </button>
          <span className="px-4 py-2">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}
