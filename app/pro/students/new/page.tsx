'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function NewStudentPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registrationType, setRegistrationType] = useState<'existing' | 'new'>('existing')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [searching, setSearching] = useState(false)

  const [formData, setFormData] = useState({
    student_name: '',
    student_phone: '',
    student_email: '',
    current_level: '초급',
    goal: '',
    student_memo: '',
    birth_date: '',
    gender: '',
    started_golf_at: '',
    average_score: ''
  })

  // 회원 검색 (이름 또는 이메일)
  const searchUsers = async () => {
    if (!searchQuery.trim()) return
    
    setSearching(true)
    try {
      // API를 통해 이름과 이메일로 검색
      const response = await fetch(`/api/pro/search-members?q=${encodeURIComponent(searchQuery)}`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const { users } = await response.json()
      setSearchResults(users || [])
      
      // 검색 결과가 없으면 안내 메시지
      if (!users || users.length === 0) {
        console.log('검색 결과가 없습니다:', searchQuery)
      }
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  // 기존 회원 선택 시 정보 자동 입력
  useEffect(() => {
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        student_name: selectedUser.full_name || '',
        student_email: selectedUser.email || ''
      }))
    }
  }, [selectedUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      // 학생 추가 데이터 준비
      const studentData: any = {
        pro_id: user.id,
        ...formData,
        average_score: formData.average_score ? parseInt(formData.average_score) : null,
        birth_date: formData.birth_date || null,
        started_golf_at: formData.started_golf_at || null
      }

      // 기존 회원 연결
      if (registrationType === 'existing' && selectedUser) {
        studentData.user_id = selectedUser.id
      }

      // 학생 추가
      const { data, error } = await (supabase as any)
        .from('lesson_students')
        .insert(studentData)
        .select()
        .single()

      if (error) throw error

      router.push(`/pro/students/${data.id}`)
    } catch (err: any) {
      setError(err.message || '학생 추가 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">새 학생 추가</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 등록 방식 선택 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">등록 방식</h3>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setRegistrationType('existing')
                  setSelectedUser(null)
                  setFormData({
                    student_name: '',
                    student_phone: '',
                    student_email: '',
                    current_level: '초급',
                    goal: '',
                    student_memo: '',
                    birth_date: '',
                    gender: '',
                    started_golf_at: '',
                    average_score: ''
                  })
                }}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  registrationType === 'existing' 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">기존 회원에서 선택</div>
                <div className="text-sm text-gray-600 mt-1">앱 회원을 학생으로 등록</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegistrationType('new')
                  setSelectedUser(null)
                  setSearchResults([])
                }}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  registrationType === 'new' 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">새로운 학생 추가</div>
                <div className="text-sm text-gray-600 mt-1">회원이 아닌 학생 등록</div>
              </button>
            </div>
          </div>

          {/* 기존 회원 검색 */}
          {registrationType === 'existing' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">회원 검색</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="이름 또는 이메일로 검색... (예: 다희아빠, hdopen)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), searchUsers())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={searchUsers}
                  disabled={searching}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400"
                >
                  {searching ? '검색 중...' : '검색'}
                </button>
              </div>

              {/* 검색 결과 */}
              {searchQuery && !searching && searchResults.length === 0 && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600">
                    "<span className="font-medium">{searchQuery}</span>"에 대한 검색 결과가 없습니다.
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    이름 또는 이메일 주소로 다시 검색해보세요.
                  </div>
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className="mt-4 border rounded-lg divide-y">
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 ${
                        selectedUser?.id === user.id ? 'bg-emerald-50 border-l-4 border-emerald-600' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} className="w-full h-full rounded-full" />
                          ) : (
                            <span className="text-gray-600">{user.full_name?.[0] || '?'}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.full_name || '이름 없음'}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                        {selectedUser?.id === user.id && (
                          <div className="ml-auto text-emerald-600">✓ 선택됨</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedUser && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="text-sm text-emerald-700">
                    선택된 회원: <strong>{selectedUser.full_name || selectedUser.email}</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 기본 정보 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">학생 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.student_name}
                  onChange={(e) => setFormData({...formData, student_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="010-0000-0000"
                  value={formData.student_phone}
                  onChange={(e) => setFormData({...formData, student_phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  value={formData.student_email}
                  onChange={(e) => setFormData({...formData, student_email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  레벨
                </label>
                <select
                  value={formData.current_level}
                  onChange={(e) => setFormData({...formData, current_level: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="입문">입문</option>
                  <option value="초급">초급</option>
                  <option value="중급">중급</option>
                  <option value="상급">상급</option>
                </select>
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">추가 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  생년월일
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  성별
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">선택</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  골프 시작일
                </label>
                <input
                  type="date"
                  value={formData.started_golf_at}
                  onChange={(e) => setFormData({...formData, started_golf_at: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  평균 스코어
                </label>
                <input
                  type="number"
                  placeholder="예: 90"
                  value={formData.average_score}
                  onChange={(e) => setFormData({...formData, average_score: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                목표
              </label>
              <input
                type="text"
                placeholder="예: 드라이버 비거리 증가, 슬라이스 교정"
                value={formData.goal}
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메모
              </label>
              <textarea
                rows={3}
                placeholder="학생에 대한 특이사항이나 메모"
                value={formData.student_memo}
                onChange={(e) => setFormData({...formData, student_memo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <Button type="submit" disabled={loading}>
              {loading ? '추가 중...' : '학생 추가'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}