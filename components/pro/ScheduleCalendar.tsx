'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'

interface Schedule {
  id: string
  lesson_date: string
  lesson_time: string
  status: string
  location?: string
  lesson_students?: {
    student_name: string
    student_phone?: string
  }
}

interface Student {
  id: string
  student_name: string
}

interface ScheduleCalendarProps {
  schedules: Schedule[]
  students: Student[]
}

export default function ScheduleCalendar({ schedules, students }: ScheduleCalendarProps) {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  // 월별 캘린더 생성
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDateCopy = new Date(startDate)
    
    while (currentDateCopy <= lastDay || currentDateCopy.getDay() !== 0) {
      days.push(new Date(currentDateCopy))
      currentDateCopy.setDate(currentDateCopy.getDate() + 1)
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()
  const today = new Date().toISOString().split('T')[0]

  // 날짜별 스케줄 그룹화
  const schedulesByDate = schedules.reduce((acc: any, schedule) => {
    const date = schedule.lesson_date
    if (!acc[date]) acc[date] = []
    acc[date].push(schedule)
    return acc
  }, {})

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  return (
    <div className="space-y-4">
      {/* 뷰 모드 선택 */}
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'month' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              월간
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'week' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              주간
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              목록
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ◀
            </button>
            <span className="font-medium">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </span>
            <button 
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ▶
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              오늘
            </button>
          </div>
        </div>
      </Card>

      {/* 캘린더 뷰 */}
      {viewMode === 'month' && (
        <Card className="p-4">
          <div className="grid grid-cols-7 gap-1">
            {/* 요일 헤더 */}
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day} className="text-center font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
            
            {/* 날짜 셀 */}
            {calendarDays.map((day, index) => {
              const dateStr = day.toISOString().split('T')[0]
              const daySchedules = schedulesByDate[dateStr] || []
              const isToday = dateStr === today
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] border p-2 ${
                    isToday ? 'bg-emerald-50 border-emerald-500' : 
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    !isCurrentMonth ? 'text-gray-400' : 
                    day.getDay() === 0 ? 'text-red-600' : 
                    day.getDay() === 6 ? 'text-blue-600' : ''
                  }`}>
                    {day.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {daySchedules.slice(0, 3).map((schedule: Schedule) => (
                      <div
                        key={schedule.id}
                        className={`text-xs px-1 py-0.5 rounded truncate ${
                          schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                          schedule.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {schedule.lesson_time?.slice(0, 5)} {schedule.lesson_students?.student_name}
                      </div>
                    ))}
                    {daySchedules.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{daySchedules.length - 3}개
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* 리스트 뷰 */}
      {viewMode === 'list' && (
        <Card className="p-4">
          <div className="space-y-3">
            {schedules.length > 0 ? (
              schedules.map((schedule) => (
                <div key={schedule.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {new Date(schedule.lesson_date).toLocaleDateString()} {schedule.lesson_time?.slice(0, 5)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {schedule.lesson_students?.student_name} - {schedule.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                      schedule.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {schedule.status === 'scheduled' ? '예정' :
                       schedule.status === 'completed' ? '완료' :
                       schedule.status === 'cancelled' ? '취소' : schedule.status}
                    </span>
                    <button className="text-gray-500 hover:text-gray-700">
                      ⋮
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                이번 달 예정된 레슨이 없습니다.
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}