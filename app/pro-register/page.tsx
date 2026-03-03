'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function ProRegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    pro_certification: '',
    pro_experience_years: '',
    pro_specialties: [] as string[],
    pro_introduction: '',
    pro_location: '',
    pro_phone: '',
    pro_monthly_fee: ''
  })

  const specialtyOptions = [
    '드라이버', '아이언', '숏게임', '퍼팅', 
    '코스 매니지먼트', '멘탈', '피지컬', '주니어', '시니어'
  ]

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      pro_specialties: prev.pro_specialties.includes(specialty)
        ? prev.pro_specialties.filter(s => s !== specialty)
        : [...prev.pro_specialties, specialty]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      // 프로필 업데이트
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          is_lesson_pro: true,
          pro_certification: formData.pro_certification,
          pro_experience_years: parseInt(formData.pro_experience_years),
          pro_specialties: formData.pro_specialties,
          pro_introduction: formData.pro_introduction,
          pro_location: formData.pro_location,
          pro_phone: formData.pro_phone,
          pro_monthly_fee: parseInt(formData.pro_monthly_fee)
        })
        .eq('id', user.id)

      if (error) throw error

      // 알림 설정 초기화
      await (supabase as any)
        .from('pro_notification_settings')
        .insert({
          pro_id: user.id
        })

      router.push('/pro/dashboard')
    } catch (err: any) {
      setError(err.message || '프로 등록 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">레슨 프로 등록</h1>
          <p className="text-gray-600">Golfearn Pro CRM을 시작하기 위해 프로 정보를 등록해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 자격 정보 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              자격증/소속 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: KPGA 티칭프로, KLPGA 정회원"
              value={formData.pro_certification}
              onChange={(e) => setFormData({...formData, pro_certification: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                레슨 경력 (년) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.pro_experience_years}
                onChange={(e) => setFormData({...formData, pro_experience_years: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                월 레슨료 (원) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                placeholder="예: 300000"
                value={formData.pro_monthly_fee}
                onChange={(e) => setFormData({...formData, pro_monthly_fee: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                활동 지역 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="예: 서울 강남구"
                value={formData.pro_location}
                onChange={(e) => setFormData({...formData, pro_location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="010-0000-0000"
                value={formData.pro_phone}
                onChange={(e) => setFormData({...formData, pro_phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 전문 분야 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전문 분야 (복수 선택 가능)
            </label>
            <div className="flex flex-wrap gap-2">
              {specialtyOptions.map(specialty => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => toggleSpecialty(specialty)}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    formData.pro_specialties.includes(specialty)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          {/* 소개 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              프로 소개
            </label>
            <textarea
              rows={4}
              placeholder="레슨 철학, 특징, 경력 등을 자유롭게 작성해주세요"
              value={formData.pro_introduction}
              onChange={(e) => setFormData({...formData, pro_introduction: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '등록 중...' : '레슨 프로로 시작하기'}
          </Button>
        </form>
      </Card>
    </div>
  )
}