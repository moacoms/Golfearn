'use client'

import { useState, useEffect } from 'react'
import { checkIn, getTodayCheckIn } from '@/lib/actions/points'
import Button from '@/components/ui/Button'

export function CheckInButton() {
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)
  const [consecutiveDays, setConsecutiveDays] = useState(0)

  useEffect(() => {
    loadCheckInStatus()
  }, [])

  const loadCheckInStatus = async () => {
    const result = await getTodayCheckIn()
    if (!result.error) {
      setChecked(result.checked)
      setConsecutiveDays(result.consecutiveDays)
    }
  }

  const handleCheckIn = async () => {
    setLoading(true)
    const result = await checkIn()
    setLoading(false)

    if (result.success) {
      setChecked(true)
      setConsecutiveDays(result.consecutiveDays)
      alert(`출석 체크 완료! ${result.points}P를 받았습니다. (${result.consecutiveDays}일 연속)`)
      window.location.reload()
    } else {
      alert(result.error || '출석 체크에 실패했습니다.')
    }
  }

  if (checked) {
    return (
      <div className="text-center">
        <div className="bg-white/20 rounded-lg px-4 py-2">
          <p className="text-sm opacity-90">오늘 출석 완료</p>
          <p className="font-bold">{consecutiveDays}일 연속 출석 중!</p>
        </div>
      </div>
    )
  }

  return (
    <Button
      onClick={handleCheckIn}
      disabled={loading}
      className="bg-white text-green-600 hover:bg-gray-100 font-bold"
    >
      {loading ? '처리 중...' : '출석 체크'}
    </Button>
  )
}
