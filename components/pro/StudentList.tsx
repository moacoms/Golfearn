'use client'

import { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'

interface Student {
  id: string
  student_name: string
  student_phone?: string
  current_level?: string
  is_active: boolean
  created_at: string
  last_lesson_at?: string
  total_lesson_count: number
  lesson_packages?: any[]
}

interface StudentListProps {
  students: Student[]
}

export default function StudentList({ students }: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

  // 필터링
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_phone?.includes(searchTerm)
    const matchesActive = filterActive === 'all' || 
                         (filterActive === 'active' && student.is_active) ||
                         (filterActive === 'inactive' && !student.is_active)
    return matchesSearch && matchesActive
  })

  return (
    <div className="space-y-4">
      {/* 검색 및 필터 */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="이름 또는 전화번호로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setFilterActive('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterActive === 'all' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterActive('active')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterActive === 'active' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              활성
            </button>
            <button
              onClick={() => setFilterActive('inactive')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterActive === 'inactive' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              비활성
            </button>
          </div>
        </div>
      </Card>

      {/* 학생 카드 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => {
          const activePackage = student.lesson_packages?.find((pkg: any) => pkg.status === 'active')
          const daysSinceLastLesson = student.last_lesson_at 
            ? Math.floor((Date.now() - new Date(student.last_lesson_at).getTime()) / (1000 * 60 * 60 * 24))
            : null

          return (
            <Link key={student.id} href={`/pro/students/${student.id}`}>
              <Card className="p-5 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {student.student_name}
                    </h3>
                    <p className="text-sm text-gray-600">{student.student_phone}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    student.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {student.is_active ? '활성' : '비활성'}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">레벨</span>
                    <span className="font-medium">{student.current_level || '미설정'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">총 레슨</span>
                    <span className="font-medium">{student.total_lesson_count}회</span>
                  </div>
                  {daysSinceLastLesson !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">마지막 레슨</span>
                      <span className={`font-medium ${
                        daysSinceLastLesson > 30 ? 'text-red-600' : ''
                      }`}>
                        {daysSinceLastLesson === 0 ? '오늘' : `${daysSinceLastLesson}일 전`}
                      </span>
                    </div>
                  )}
                </div>

                {activePackage && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">{activePackage.package_name}</span>
                      <span className="text-xs font-medium text-emerald-600">
                        잔여 {activePackage.remaining_count || 0}회
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            </Link>
          )
        })}
      </div>

      {filteredStudents.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">
            {searchTerm || filterActive !== 'all' 
              ? '검색 결과가 없습니다.' 
              : '아직 등록된 학생이 없습니다.'}
          </p>
          {!searchTerm && filterActive === 'all' && (
            <Link 
              href="/pro/students/new"
              className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              첫 학생 추가하기
            </Link>
          )}
        </Card>
      )}
    </div>
  )
}