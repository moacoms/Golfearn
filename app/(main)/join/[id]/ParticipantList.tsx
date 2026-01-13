'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateParticipantStatus } from '@/lib/actions/join'
import { ParticipantWithProfile } from '@/types/database'

interface ParticipantListProps {
  participants: ParticipantWithProfile[]
  isHost: boolean
}

export default function ParticipantList({ participants, isHost }: ParticipantListProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const pendingParticipants = participants.filter((p) => p.status === 'pending')
  const approvedParticipants = participants.filter((p) => p.status === 'approved')

  const handleStatusUpdate = async (participantId: number, status: 'approved' | 'rejected') => {
    const action = status === 'approved' ? '승인' : '거절'
    if (!confirm(`이 신청을 ${action}하시겠습니까?`)) return

    setLoadingId(participantId)
    try {
      const result = await updateParticipantStatus(participantId, status)
      if (result.error) {
        alert(result.error)
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('처리에 실패했습니다.')
    } finally {
      setLoadingId(null)
    }
  }

  // 골프 경력 계산
  const getGolfCareer = (startDate: string | null) => {
    if (!startDate) return null
    const start = new Date(startDate)
    const now = new Date()
    const months =
      (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
    if (months < 12) return `${months}개월`
    const years = Math.floor(months / 12)
    return `${years}년`
  }

  const ParticipantCard = ({
    participant,
    showActions,
  }: {
    participant: ParticipantWithProfile
    showActions: boolean
  }) => (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start gap-3">
        {/* 아바타 */}
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {participant.profiles?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={participant.profiles.avatar_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {participant.profiles?.username || participant.profiles?.full_name || '익명'}
            </span>
            {participant.status === 'approved' && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                승인됨
              </span>
            )}
            {participant.status === 'pending' && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                대기중
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            {participant.profiles?.average_score && (
              <span>평균 {participant.profiles.average_score}타</span>
            )}
            {participant.profiles?.golf_started_at && (
              <span>경력 {getGolfCareer(participant.profiles.golf_started_at)}</span>
            )}
          </div>
          {participant.message && (
            <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
              &quot;{participant.message}&quot;
            </p>
          )}
        </div>

        {/* 액션 버튼 */}
        {showActions && participant.status === 'pending' && (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => handleStatusUpdate(participant.id, 'approved')}
              disabled={loadingId === participant.id}
              className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark disabled:opacity-50"
            >
              승인
            </button>
            <button
              onClick={() => handleStatusUpdate(participant.id, 'rejected')}
              disabled={loadingId === participant.id}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              거절
            </button>
          </div>
        )}
      </div>
    </div>
  )

  if (!isHost) {
    // 비호스트: 승인된 참가자만 표시
    if (approvedParticipants.length === 0) {
      return null
    }

    return (
      <div className="space-y-3">
        <h3 className="font-semibold">참가자</h3>
        <div className="space-y-2">
          {approvedParticipants.map((p) => (
            <ParticipantCard key={p.id} participant={p} showActions={false} />
          ))}
        </div>
      </div>
    )
  }

  // 호스트: 대기중 + 승인된 참가자 모두 표시
  return (
    <div className="space-y-6">
      {/* 대기 중인 신청 */}
      {pendingParticipants.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            대기 중인 신청
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
              {pendingParticipants.length}
            </span>
          </h3>
          <div className="space-y-2">
            {pendingParticipants.map((p) => (
              <ParticipantCard key={p.id} participant={p} showActions={true} />
            ))}
          </div>
        </div>
      )}

      {/* 승인된 참가자 */}
      {approvedParticipants.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">승인된 참가자</h3>
          <div className="space-y-2">
            {approvedParticipants.map((p) => (
              <ParticipantCard key={p.id} participant={p} showActions={false} />
            ))}
          </div>
        </div>
      )}

      {participants.length === 0 && (
        <p className="text-center text-gray-500 py-4">아직 신청자가 없습니다</p>
      )}
    </div>
  )
}
