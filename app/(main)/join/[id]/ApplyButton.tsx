'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  applyToJoin,
  cancelJoinApplication,
  checkJoinParticipation,
  checkEligibility,
} from '@/lib/actions/join'
import { ParticipantStatus } from '@/types/database'

interface ApplyButtonProps {
  joinPostId: number
  isHost: boolean
  status: string
  isLoggedIn: boolean
}

export default function ApplyButton({
  joinPostId,
  isHost,
  status,
  isLoggedIn,
}: ApplyButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [participation, setParticipation] = useState<{
    isParticipating: boolean
    status?: ParticipantStatus
    participantId?: number
  } | null>(null)
  const [eligibility, setEligibility] = useState<{
    eligible: boolean
    reason?: string
    userScore?: number
    requiredScore?: { min?: number; max?: number }
  } | null>(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkStatus = async () => {
      if (!isLoggedIn) {
        setIsChecking(false)
        return
      }

      try {
        const [partResult, eligResult] = await Promise.all([
          checkJoinParticipation(joinPostId),
          checkEligibility(joinPostId),
        ])
        setParticipation(partResult)
        setEligibility(eligResult)
      } catch (error) {
        console.error('Error checking status:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkStatus()
  }, [joinPostId, isLoggedIn])

  const handleApply = async () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    setShowMessageModal(true)
  }

  const submitApplication = async () => {
    setIsLoading(true)
    try {
      const result = await applyToJoin(joinPostId, message || undefined)
      if (result.error) {
        alert(result.error)
      } else {
        alert('참가 신청이 완료되었습니다!')
        setShowMessageModal(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Error applying:', error)
      alert('신청에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!participation?.participantId) return

    if (!confirm('참가 신청을 취소하시겠습니까?')) return

    setIsLoading(true)
    try {
      const result = await cancelJoinApplication(participation.participantId)
      if (result.error) {
        alert(result.error)
      } else {
        alert('신청이 취소되었습니다.')
        router.refresh()
      }
    } catch (error) {
      console.error('Error canceling:', error)
      alert('취소에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 호스트인 경우
  if (isHost) {
    return null
  }

  // 로딩 중
  if (isChecking) {
    return (
      <button disabled className="btn btn-primary w-full opacity-50">
        확인 중...
      </button>
    )
  }

  // 모집 마감
  if (status !== 'recruiting') {
    return (
      <button disabled className="btn btn-outline w-full opacity-50">
        모집이 마감되었습니다
      </button>
    )
  }

  // 이미 신청한 경우
  if (participation?.isParticipating) {
    switch (participation.status) {
      case 'pending':
        return (
          <div className="space-y-2">
            <button disabled className="btn btn-outline w-full">
              승인 대기 중
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="btn btn-outline w-full text-red-500 border-red-300 hover:bg-red-50"
            >
              {isLoading ? '취소 중...' : '신청 취소'}
            </button>
          </div>
        )
      case 'approved':
        return (
          <div className="space-y-2">
            <button disabled className="btn btn-primary w-full">
              참가 확정됨
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="btn btn-outline w-full text-red-500 border-red-300 hover:bg-red-50"
            >
              {isLoading ? '취소 중...' : '참가 취소'}
            </button>
          </div>
        )
      case 'rejected':
        return (
          <button disabled className="btn btn-outline w-full opacity-50">
            신청이 거절되었습니다
          </button>
        )
    }
  }

  // 실력 미충족 경고
  const showEligibilityWarning = eligibility && !eligibility.eligible && eligibility.reason

  return (
    <>
      <div className="space-y-2">
        {showEligibilityWarning && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            {eligibility.reason}
          </div>
        )}
        <button
          onClick={handleApply}
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? '처리 중...' : '참가 신청하기'}
        </button>
      </div>

      {/* 신청 메시지 모달 */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">참가 신청</h3>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium mb-2">
                호스트에게 전할 메시지 (선택)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="간단한 자기소개나 메시지를 남겨주세요"
                className="input h-24 resize-none"
              />
              {eligibility?.userScore && (
                <p className="mt-2 text-sm text-gray-500">
                  내 평균 스코어: {eligibility.userScore}타
                </p>
              )}
            </div>
            <div className="p-4 border-t flex gap-2">
              <button
                onClick={() => setShowMessageModal(false)}
                className="btn btn-outline flex-1"
              >
                취소
              </button>
              <button
                onClick={submitApplication}
                disabled={isLoading}
                className="btn btn-primary flex-1"
              >
                {isLoading ? '신청 중...' : '신청하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
