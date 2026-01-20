'use client'

import { useEffect, useState } from 'react'
import {
  getPendingClubs,
  approvePendingClub,
  rejectPendingClub,
  PendingClub,
} from '@/lib/actions/admin-clubs'
import { CLUB_TYPE_LABELS, ClubType } from '@/types/club'

export default function PendingClubsPage() {
  const [clubs, setClubs] = useState<PendingClub[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [selectedClub, setSelectedClub] = useState<PendingClub | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadData()
  }, [filter])

  async function loadData() {
    setLoading(true)
    const result = await getPendingClubs({ status: filter })
    setClubs(result.clubs)
    setTotal(result.total)
    setLoading(false)
  }

  async function handleApprove(club: PendingClub) {
    if (!confirm(`"${club.brand_name} ${club.club_name}"을 승인하시겠습니까?`)) return

    setProcessing(true)
    const result = await approvePendingClub(club.id)
    setProcessing(false)

    if (result.success) {
      alert(`승인 완료! 클럽 ID: ${result.club_id}`)
      loadData()
      setSelectedClub(null)
    } else {
      alert('승인 실패: ' + result.error)
    }
  }

  async function handleReject(club: PendingClub) {
    const reason = prompt('거절 사유를 입력하세요 (선택사항):')
    if (reason === null) return

    setProcessing(true)
    const result = await rejectPendingClub(club.id, reason || undefined)
    setProcessing(false)

    if (result.success) {
      alert('거절 완료')
      loadData()
      setSelectedClub(null)
    } else {
      alert('거절 실패: ' + result.error)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">대기 클럽 관리</h1>
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm ${
                filter === status
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {status === 'pending' && '대기 중'}
              {status === 'approved' && '승인됨'}
              {status === 'rejected' && '거절됨'}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-4">총 {total}개</div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          로딩 중...
        </div>
      ) : clubs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          {filter === 'pending' && '대기 중인 클럽이 없습니다.'}
          {filter === 'approved' && '승인된 클럽이 없습니다.'}
          {filter === 'rejected' && '거절된 클럽이 없습니다.'}
        </div>
      ) : (
        <div className="space-y-4">
          {clubs.map((club) => (
            <div
              key={club.id}
              className={`bg-white rounded-lg shadow p-6 ${
                selectedClub?.id === club.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">
                      {club.brand_name} {club.club_name}
                    </h3>
                    {club.ai_confidence && (
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          club.ai_confidence >= 0.8
                            ? 'bg-green-100 text-green-800'
                            : club.ai_confidence >= 0.5
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        신뢰도 {(club.ai_confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    {club.club_name_ko && `${club.club_name_ko} | `}
                    {CLUB_TYPE_LABELS[club.club_type as ClubType] || club.club_type} |
                    {club.model_year || '연도 미상'}
                  </p>
                </div>

                {filter === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedClub(selectedClub?.id === club.id ? null : club)}
                      className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    >
                      {selectedClub?.id === club.id ? '닫기' : '상세'}
                    </button>
                    <button
                      onClick={() => handleApprove(club)}
                      disabled={processing}
                      className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleReject(club)}
                      disabled={processing}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      거절
                    </button>
                  </div>
                )}
              </div>

              {selectedClub?.id === club.id && (
                <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">출시가</p>
                    <p className="font-medium">
                      {club.release_price ? `${club.release_price.toLocaleString()}원` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">로프트</p>
                    <p className="font-medium">{club.loft || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">샤프트</p>
                    <p className="font-medium">{club.shaft_flex || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">추천 핸디캡</p>
                    <p className="font-medium">{club.recommended_handicap_range || '-'}</p>
                  </div>
                  {club.description && (
                    <div className="col-span-full">
                      <p className="text-gray-500">설명</p>
                      <p className="mt-1">{club.description}</p>
                    </div>
                  )}
                  {club.features && club.features.length > 0 && (
                    <div className="col-span-full">
                      <p className="text-gray-500">특징</p>
                      <ul className="mt-1 list-disc list-inside">
                        {club.features.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
