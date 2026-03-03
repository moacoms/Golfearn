'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [notifications, setNotifications] = useState({
    email_enabled: true,
    sms_enabled: false,
    push_enabled: false,
    lesson_reminder: true,
    payment_reminder: true,
    package_expiry_reminder: true
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 프로필 정보 가져오기
      const { data: profileData } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // 알림 설정 가져오기
      const { data: notifData } = await (supabase as any)
        .from('pro_notification_settings')
        .select('*')
        .eq('pro_id', user.id)
        .single()

      if (notifData) {
        setNotifications(notifData)
      }
    } catch (err: any) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          pro_certification: profile.pro_certification,
          pro_experience_years: profile.pro_experience_years,
          pro_specialties: profile.pro_specialties,
          pro_introduction: profile.pro_introduction,
          pro_location: profile.pro_location,
          pro_phone: profile.pro_phone,
          pro_monthly_fee: profile.pro_monthly_fee
        })
        .eq('id', user.id)

      if (error) throw error
      setSuccess('프로필이 업데이트되었습니다!')
    } catch (err: any) {
      setError(err.message || '프로필 업데이트 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      const { error } = await (supabase as any)
        .from('pro_notification_settings')
        .upsert({
          pro_id: user.id,
          ...notifications
        })

      if (error) throw error
      setSuccess('알림 설정이 저장되었습니다!')
    } catch (err: any) {
      setError(err.message || '알림 설정 저장 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  const specialtyOptions = [
    '드라이버', '아이언', '숏게임', '퍼팅', 
    '코스 매니지먼트', '멘탈', '피지컬', '주니어', '시니어'
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">프로 설정</h1>

      {/* 성공/에러 메시지 */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* 프로필 설정 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">프로 정보</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                자격증/소속
              </label>
              <input
                type="text"
                value={profile.pro_certification || ''}
                onChange={(e) => setProfile({...profile, pro_certification: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                레슨 경력 (년)
              </label>
              <input
                type="number"
                value={profile.pro_experience_years || ''}
                onChange={(e) => setProfile({...profile, pro_experience_years: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                활동 지역
              </label>
              <input
                type="text"
                value={profile.pro_location || ''}
                onChange={(e) => setProfile({...profile, pro_location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연락처
              </label>
              <input
                type="tel"
                value={profile.pro_phone || ''}
                onChange={(e) => setProfile({...profile, pro_phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                월 레슨료 (원)
              </label>
              <input
                type="number"
                value={profile.pro_monthly_fee || ''}
                onChange={(e) => setProfile({...profile, pro_monthly_fee: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전문 분야
            </label>
            <div className="flex flex-wrap gap-2">
              {specialtyOptions.map(specialty => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => {
                    const specialties = profile.pro_specialties || []
                    if (specialties.includes(specialty)) {
                      setProfile({
                        ...profile,
                        pro_specialties: specialties.filter((s: string) => s !== specialty)
                      })
                    } else {
                      setProfile({
                        ...profile,
                        pro_specialties: [...specialties, specialty]
                      })
                    }
                  }}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    (profile.pro_specialties || []).includes(specialty)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              프로 소개
            </label>
            <textarea
              rows={4}
              value={profile.pro_introduction || ''}
              onChange={(e) => setProfile({...profile, pro_introduction: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? '저장 중...' : '프로필 저장'}
          </Button>
        </form>
      </Card>

      {/* 알림 설정 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">알림 설정</h2>
        <form onSubmit={handleNotificationSubmit} className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <span className="font-medium">이메일 알림</span>
              <input
                type="checkbox"
                checked={notifications.email_enabled}
                onChange={(e) => setNotifications({...notifications, email_enabled: e.target.checked})}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <span className="font-medium">SMS 알림</span>
              <input
                type="checkbox"
                checked={notifications.sms_enabled}
                onChange={(e) => setNotifications({...notifications, sms_enabled: e.target.checked})}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <span className="font-medium">푸시 알림</span>
              <input
                type="checkbox"
                checked={notifications.push_enabled}
                onChange={(e) => setNotifications({...notifications, push_enabled: e.target.checked})}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>
          </div>

          <div className="border-t pt-4 space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <span>레슨 일정 알림</span>
              <input
                type="checkbox"
                checked={notifications.lesson_reminder}
                onChange={(e) => setNotifications({...notifications, lesson_reminder: e.target.checked})}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <span>결제 알림</span>
              <input
                type="checkbox"
                checked={notifications.payment_reminder}
                onChange={(e) => setNotifications({...notifications, payment_reminder: e.target.checked})}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <span>수강권 만료 알림</span>
              <input
                type="checkbox"
                checked={notifications.package_expiry_reminder}
                onChange={(e) => setNotifications({...notifications, package_expiry_reminder: e.target.checked})}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? '저장 중...' : '알림 설정 저장'}
          </Button>
        </form>
      </Card>

      {/* 계정 설정 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">계정 설정</h2>
        <div className="space-y-4">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </Card>
    </div>
  )
}