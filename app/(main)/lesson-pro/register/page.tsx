'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { registerLessonPro, uploadLessonProImage, RegisterLessonProData } from '@/lib/actions/lesson-pros'
import {
  specialtyOptions,
  lessonTypeOptions,
  regionOptions,
} from '@/lib/lesson-pro-constants'

export default function LessonProRegisterPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  // 폼 데이터
  const [formData, setFormData] = useState<RegisterLessonProData>({
    name: '',
    introduction: '',
    experienceYears: undefined,
    specialties: [],
    certifications: [],
    regions: [],
    lessonTypes: [],
    priceIndividual: undefined,
    priceGroup: undefined,
    availableTimes: '',
    profileImage: '',
    galleryImages: [],
    contactPhone: '',
    contactKakao: '',
    instagram: '',
    youtube: '',
    locationAddress: '',
  })

  // 자격증 입력
  const [certificationInput, setCertificationInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.')
      setStep(1)
      return
    }

    startTransition(async () => {
      const result = await registerLessonPro(formData)
      if (result.error) {
        setError(result.error)
      } else if (result.proId) {
        router.push(`/lesson-pro/${result.proId}`)
      }
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'gallery') => {
    const file = e.target.files?.[0]
    if (!file) return

    const formDataForUpload = new FormData()
    formDataForUpload.append('file', file)

    startTransition(async () => {
      const result = await uploadLessonProImage(formDataForUpload)
      if (result.error) {
        setError(result.error)
      } else if (result.url) {
        if (type === 'profile') {
          setFormData({ ...formData, profileImage: result.url })
        } else {
          setFormData({
            ...formData,
            galleryImages: [...(formData.galleryImages || []), result.url],
          })
        }
      }
    })
  }

  const toggleArrayValue = (field: keyof RegisterLessonProData, value: string) => {
    const currentArray = (formData[field] as string[]) || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value]
    setFormData({ ...formData, [field]: newArray })
  }

  const addCertification = () => {
    if (certificationInput.trim()) {
      setFormData({
        ...formData,
        certifications: [...(formData.certifications || []), certificationInput.trim()],
      })
      setCertificationInput('')
    }
  }

  const removeCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications?.filter((_, i) => i !== index),
    })
  }

  const removeGalleryImage = (index: number) => {
    setFormData({
      ...formData,
      galleryImages: formData.galleryImages?.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="py-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">레슨프로 등록</h1>
        <p className="text-muted mb-8">프로님의 정보를 등록하고 골린이들과 만나보세요</p>

        {/* 진행 단계 */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                step === s
                  ? 'bg-primary text-white'
                  : step > s
                  ? 'bg-primary/20 text-primary'
                  : 'bg-gray-100 text-muted'
              }`}
            >
              {s === 1 && '기본 정보'}
              {s === 2 && '레슨 정보'}
              {s === 3 && '연락처'}
              {s === 4 && '이미지'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: 기본 정보 */}
          {step === 1 && (
            <div className="card space-y-6">
              <h2 className="text-lg font-semibold">기본 정보</h2>

              <div>
                <label className="block text-sm font-medium mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="홍길동"
                  className="w-full px-4 py-3 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">자기소개</label>
                <textarea
                  value={formData.introduction}
                  onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                  placeholder="프로님을 소개해주세요"
                  rows={4}
                  className="w-full px-4 py-3 border rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">경력 (년)</label>
                <input
                  type="number"
                  value={formData.experienceYears || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, experienceYears: parseInt(e.target.value) || undefined })
                  }
                  placeholder="5"
                  min={0}
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">전문 분야</label>
                <div className="flex flex-wrap gap-2">
                  {specialtyOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleArrayValue('specialties', option.value)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        formData.specialties?.includes(option.value)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">자격증</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={certificationInput}
                    onChange={(e) => setCertificationInput(e.target.value)}
                    placeholder="KPGA 정회원"
                    className="flex-1 px-4 py-2 border rounded-lg"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  />
                  <button
                    type="button"
                    onClick={addCertification}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    추가
                  </button>
                </div>
                {formData.certifications && formData.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.certifications.map((cert, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1"
                      >
                        {cert}
                        <button
                          type="button"
                          onClick={() => removeCertification(i)}
                          className="hover:text-red-500"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-primary"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* Step 2: 레슨 정보 */}
          {step === 2 && (
            <div className="card space-y-6">
              <h2 className="text-lg font-semibold">레슨 정보</h2>

              <div>
                <label className="block text-sm font-medium mb-2">활동 지역</label>
                <div className="flex flex-wrap gap-2">
                  {regionOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleArrayValue('regions', option.value)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        formData.regions?.includes(option.value)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">레슨 유형</label>
                <div className="flex flex-wrap gap-2">
                  {lessonTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleArrayValue('lessonTypes', option.value)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        formData.lessonTypes?.includes(option.value)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">1:1 레슨 가격 (원)</label>
                  <input
                    type="number"
                    value={formData.priceIndividual || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, priceIndividual: parseInt(e.target.value) || undefined })
                    }
                    placeholder="50000"
                    min={0}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">그룹 레슨 가격 (원)</label>
                  <input
                    type="number"
                    value={formData.priceGroup || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, priceGroup: parseInt(e.target.value) || undefined })
                    }
                    placeholder="30000"
                    min={0}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">레슨 가능 시간</label>
                <textarea
                  value={formData.availableTimes}
                  onChange={(e) => setFormData({ ...formData, availableTimes: e.target.value })}
                  placeholder="평일 오전 10시 ~ 오후 6시&#10;주말 오전 9시 ~ 오후 3시"
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">레슨 장소</label>
                <input
                  type="text"
                  value={formData.locationAddress}
                  onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                  placeholder="서울시 강남구 역삼동 123-45"
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-outline"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn btn-primary"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 연락처 */}
          {step === 3 && (
            <div className="card space-y-6">
              <h2 className="text-lg font-semibold">연락처</h2>

              <div>
                <label className="block text-sm font-medium mb-2">전화번호</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="010-1234-5678"
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">카카오톡 ID</label>
                <input
                  type="text"
                  value={formData.contactKakao}
                  onChange={(e) => setFormData({ ...formData, contactKakao: e.target.value })}
                  placeholder="kakao_id"
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">인스타그램</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">@</span>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="instagram_id"
                    className="w-full pl-8 pr-4 py-3 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">유튜브 채널</label>
                <input
                  type="text"
                  value={formData.youtube}
                  onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                  placeholder="https://youtube.com/@channel"
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-outline"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="btn btn-primary"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* Step 4: 이미지 */}
          {step === 4 && (
            <div className="card space-y-6">
              <h2 className="text-lg font-semibold">이미지</h2>

              <div>
                <label className="block text-sm font-medium mb-2">프로필 이미지</label>
                <div className="flex items-center gap-4">
                  {formData.profileImage ? (
                    <div className="relative w-24 h-24">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.profileImage}
                        alt="프로필"
                        className="w-full h-full rounded-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, profileImage: '' })}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-sm"
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <label className="btn btn-outline cursor-pointer">
                    {isPending ? '업로드 중...' : '이미지 선택'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'profile')}
                      className="hidden"
                      disabled={isPending}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">갤러리 이미지</label>
                <p className="text-sm text-muted mb-3">레슨 장면, 수강생 후기 등을 추가해주세요 (최대 5장)</p>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {formData.galleryImages?.map((url, i) => (
                    <div key={i} className="relative aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`갤러리 ${i + 1}`} className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {(!formData.galleryImages || formData.galleryImages.length < 5) && (
                    <label className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'gallery')}
                        className="hidden"
                        disabled={isPending}
                      />
                    </label>
                  )}
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn btn-outline"
                >
                  이전
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-primary"
                >
                  {isPending ? '등록 중...' : '레슨프로 등록'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
