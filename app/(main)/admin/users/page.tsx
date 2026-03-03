'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  is_admin: boolean
  is_lesson_pro: boolean
  is_student: boolean
  created_at: string
  updated_at: string
  email?: string
  last_sign_in_at?: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'pro' | 'student'>('all')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // API를 통해 사용자 데이터 가져오기 (이메일 포함)
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const users = await response.json()
      setUsers(users)
    } catch (error) {
      console.error('Error fetching users:', error)
      // API 실패 시 프로필 데이터만이라도 가져오기
      const { data: profiles } = await (supabase as any)
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      setUsers(profiles || [])
    } finally {
      setLoading(false)
    }
  }

  const handleRoleUpdate = async (userId: string, role: string, value: boolean) => {
    setUpdating(true)
    try {
      const updateData: any = {}
      if (role === 'admin') updateData.is_admin = value
      if (role === 'pro') updateData.is_lesson_pro = value
      if (role === 'student') updateData.is_student = value

      const { error } = await (supabase as any)
        .from('profiles')
        .update(updateData)
        .eq('id', userId)

      if (error) throw error

      // 로컬 상태 업데이트
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, ...updateData }
          : user
      ))

      alert('권한이 업데이트되었습니다.')
    } catch (error) {
      console.error('Error updating role:', error)
      alert('권한 업데이트 중 오류가 발생했습니다.')
    } finally {
      setUpdating(false)
    }
  }

  // 필터링된 사용자 목록
  const filteredUsers = users.filter(user => {
    // 역할 필터
    if (filterRole === 'admin' && !user.is_admin) return false
    if (filterRole === 'pro' && !user.is_lesson_pro) return false
    if (filterRole === 'student' && !user.is_student) return false

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
      )
    }

    return true
  })

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center text-muted">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">회원 관리</h1>
        <button
          onClick={() => router.push('/admin')}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          ← 대시보드로
        </button>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="이름, 이메일, ID로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">전체 회원</option>
            <option value="admin">관리자</option>
            <option value="pro">레슨프로</option>
            <option value="student">학생</option>
          </select>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          총 {filteredUsers.length}명 / 전체 {users.length}명
        </div>
      </div>

      {/* 사용자 목록 테이블 */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용자
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  역할
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가입일
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  마지막 로그인
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar_url ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.avatar_url}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">
                              {user.full_name?.[0] || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || '이름 없음'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email || 'ID: ' + user.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {user.is_admin && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          관리자
                        </span>
                      )}
                      {user.is_lesson_pro && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                          레슨프로
                        </span>
                      )}
                      {user.is_student && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          학생
                        </span>
                      )}
                      {!user.is_admin && !user.is_lesson_pro && !user.is_student && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          일반
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString('ko-KR')
                      : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-emerald-600 hover:text-emerald-900 mr-4"
                    >
                      상세
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 사용자 상세 모달 */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">사용자 상세 정보</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedUser.id}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">이름</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedUser.full_name || '설정 안 됨'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">이메일</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedUser.email || '정보 없음'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">가입일</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {new Date(selectedUser.created_at).toLocaleString('ko-KR')}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">마지막 로그인</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedUser.last_sign_in_at 
                        ? new Date(selectedUser.last_sign_in_at).toLocaleString('ko-KR')
                        : '정보 없음'}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">권한 설정</h3>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>관리자</span>
                      <input
                        type="checkbox"
                        checked={selectedUser.is_admin}
                        onChange={(e) => {
                          handleRoleUpdate(selectedUser.id, 'admin', e.target.checked)
                          setSelectedUser({ ...selectedUser, is_admin: e.target.checked })
                        }}
                        disabled={updating}
                        className="w-5 h-5 text-emerald-600"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>레슨프로</span>
                      <input
                        type="checkbox"
                        checked={selectedUser.is_lesson_pro}
                        onChange={(e) => {
                          handleRoleUpdate(selectedUser.id, 'pro', e.target.checked)
                          setSelectedUser({ ...selectedUser, is_lesson_pro: e.target.checked })
                        }}
                        disabled={updating}
                        className="w-5 h-5 text-emerald-600"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>학생</span>
                      <input
                        type="checkbox"
                        checked={selectedUser.is_student}
                        onChange={(e) => {
                          handleRoleUpdate(selectedUser.id, 'student', e.target.checked)
                          setSelectedUser({ ...selectedUser, is_student: e.target.checked })
                        }}
                        disabled={updating}
                        className="w-5 h-5 text-emerald-600"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}