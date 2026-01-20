'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAdminClub, getAdminBrands, createBrand } from '@/lib/actions/admin-clubs'
import {
  GolfClubBrand,
  ClubType,
  ShaftFlex,
  ShaftMaterial,
  MissTendency,
  CLUB_TYPE_LABELS,
  MISS_TENDENCY_LABELS,
} from '@/types/club'

export default function NewClubPage() {
  const router = useRouter()
  const [brands, setBrands] = useState<GolfClubBrand[]>([])
  const [loading, setLoading] = useState(false)
  const [showNewBrand, setShowNewBrand] = useState(false)

  const [formData, setFormData] = useState({
    brand_id: '',
    name: '',
    name_ko: '',
    model_year: new Date().getFullYear(),
    club_type: 'driver' as ClubType,
    loft: '',
    shaft_flex: [] as ShaftFlex[],
    shaft_material: [] as ShaftMaterial[],
    hand: 'both',
    release_price: '',
    current_price: '',
    used_price_S: '',
    used_price_A: '',
    used_price_B: '',
    used_price_C: '',
    forgiveness_level: 3,
    distance_level: 3,
    control_level: 3,
    feel_level: 3,
    miss_tendency_fix: [] as MissTendency[],
    description: '',
    features: '',
    is_active: true,
    is_featured: false,
  })

  const [newBrand, setNewBrand] = useState({ name: '', name_ko: '', country: '' })

  useEffect(() => {
    loadBrands()
  }, [])

  async function loadBrands() {
    const data = await getAdminBrands()
    setBrands(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const submitData = new FormData()
    submitData.set('brand_id', formData.brand_id)
    submitData.set('name', formData.name)
    submitData.set('name_ko', formData.name_ko)
    submitData.set('model_year', formData.model_year.toString())
    submitData.set('club_type', formData.club_type)
    submitData.set('hand', formData.hand)

    if (formData.loft) {
      submitData.set('loft', JSON.stringify(formData.loft.split(',').map(Number)))
    }
    submitData.set('shaft_flex', JSON.stringify(formData.shaft_flex))
    submitData.set('shaft_material', JSON.stringify(formData.shaft_material))
    submitData.set('miss_tendency_fix', JSON.stringify(formData.miss_tendency_fix))

    if (formData.release_price) submitData.set('release_price', formData.release_price)
    if (formData.current_price) submitData.set('current_price', formData.current_price)

    const usedPriceGuide: Record<string, number> = {}
    if (formData.used_price_S) usedPriceGuide.S = Number(formData.used_price_S)
    if (formData.used_price_A) usedPriceGuide.A = Number(formData.used_price_A)
    if (formData.used_price_B) usedPriceGuide.B = Number(formData.used_price_B)
    if (formData.used_price_C) usedPriceGuide.C = Number(formData.used_price_C)
    submitData.set('used_price_guide', JSON.stringify(usedPriceGuide))

    submitData.set('forgiveness_level', formData.forgiveness_level.toString())
    submitData.set('distance_level', formData.distance_level.toString())
    submitData.set('control_level', formData.control_level.toString())
    submitData.set('feel_level', formData.feel_level.toString())

    submitData.set('description', formData.description)
    if (formData.features) {
      submitData.set('features', JSON.stringify(formData.features.split('\n').filter(Boolean)))
    }

    submitData.set('is_active', formData.is_active.toString())
    submitData.set('is_featured', formData.is_featured.toString())

    const result = await createAdminClub(submitData)
    setLoading(false)

    if (result.success) {
      alert('클럽이 추가되었습니다!')
      router.push('/admin/clubs')
    } else {
      alert('추가 실패: ' + result.error)
    }
  }

  async function handleCreateBrand(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('name', newBrand.name)
    fd.set('name_ko', newBrand.name_ko)
    fd.set('country', newBrand.country)

    const result = await createBrand(fd)
    if (result.success) {
      await loadBrands()
      setFormData((prev) => ({ ...prev, brand_id: result.brand_id!.toString() }))
      setShowNewBrand(false)
      setNewBrand({ name: '', name_ko: '', country: '' })
    } else {
      alert('브랜드 추가 실패: ' + result.error)
    }
  }

  function toggleArray<T extends string>(field: 'shaft_flex' | 'shaft_material' | 'miss_tendency_fix', value: T) {
    setFormData((prev) => {
      const arr = prev[field] as T[]
      const updated = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
      return { ...prev, [field]: updated }
    })
  }

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">새 클럽 추가</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">브랜드 *</label>
              <div className="flex gap-2">
                <select
                  value={formData.brand_id}
                  onChange={(e) => setFormData((p) => ({ ...p, brand_id: e.target.value }))}
                  required
                  className="flex-1 px-3 py-2 border rounded-lg"
                >
                  <option value="">선택</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewBrand(!showNewBrand)}
                  className="px-3 py-2 text-sm bg-gray-100 rounded-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">클럽 타입 *</label>
              <select
                value={formData.club_type}
                onChange={(e) => setFormData((p) => ({ ...p, club_type: e.target.value as ClubType }))}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {Object.entries(CLUB_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">클럽명 (영문) *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                required
                placeholder="Qi10 Max"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">클럽명 (한글)</label>
              <input
                type="text"
                value={formData.name_ko}
                onChange={(e) => setFormData((p) => ({ ...p, name_ko: e.target.value }))}
                placeholder="Qi10 맥스"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">출시년도</label>
              <input
                type="number"
                value={formData.model_year}
                onChange={(e) => setFormData((p) => ({ ...p, model_year: Number(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          {showNewBrand && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3">새 브랜드</h3>
              <div className="flex gap-3">
                <input
                  value={newBrand.name}
                  onChange={(e) => setNewBrand((p) => ({ ...p, name: e.target.value }))}
                  placeholder="영문명"
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <input
                  value={newBrand.name_ko}
                  onChange={(e) => setNewBrand((p) => ({ ...p, name_ko: e.target.value }))}
                  placeholder="한글명"
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleCreateBrand}
                  className="px-4 py-2 bg-primary text-white rounded-lg"
                >
                  추가
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 스펙 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">스펙</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">로프트 (쉼표 구분)</label>
              <input
                type="text"
                value={formData.loft}
                onChange={(e) => setFormData((p) => ({ ...p, loft: e.target.value }))}
                placeholder="9.0, 10.5, 12.0"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">샤프트 강도</label>
              <div className="flex flex-wrap gap-2">
                {(['L', 'A', 'SR', 'R', 'S', 'X'] as ShaftFlex[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleArray('shaft_flex', f)}
                    className={`px-3 py-1 text-sm rounded ${
                      formData.shaft_flex.includes(f) ? 'bg-primary text-white' : 'bg-gray-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">샤프트 재질</label>
              <div className="flex gap-2">
                {(['steel', 'graphite'] as ShaftMaterial[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleArray('shaft_material', m)}
                    className={`px-3 py-1 text-sm rounded ${
                      formData.shaft_material.includes(m) ? 'bg-primary text-white' : 'bg-gray-100'
                    }`}
                  >
                    {m === 'steel' ? '스틸' : '그라파이트'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 가격 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">가격</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">출시가</label>
              <input
                type="number"
                value={formData.release_price}
                onChange={(e) => setFormData((p) => ({ ...p, release_price: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">현재가</label>
              <input
                type="number"
                value={formData.current_price}
                onChange={(e) => setFormData((p) => ({ ...p, current_price: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {(['S', 'A', 'B', 'C'] as const).map((g) => (
              <div key={g}>
                <label className="text-xs text-gray-500">{g}급 중고</label>
                <input
                  type="number"
                  value={formData[`used_price_${g}` as keyof typeof formData] as string}
                  onChange={(e) => setFormData((p) => ({ ...p, [`used_price_${g}`]: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 특성 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">특성 (1-5)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { k: 'forgiveness_level', l: '관용성' },
              { k: 'distance_level', l: '비거리' },
              { k: 'control_level', l: '컨트롤' },
              { k: 'feel_level', l: '타감' },
            ].map(({ k, l }) => (
              <div key={k}>
                <label className="block text-sm font-medium mb-1">{l}</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={formData[k as keyof typeof formData] as number}
                  onChange={(e) => setFormData((p) => ({ ...p, [k]: Number(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-center text-sm">{formData[k as keyof typeof formData]}</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">미스샷 보정</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(MISS_TENDENCY_LABELS).map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleArray('miss_tendency_fix', v as MissTendency)}
                  className={`px-3 py-1 text-sm rounded ${
                    formData.miss_tendency_fix.includes(v as MissTendency) ? 'bg-primary text-white' : 'bg-gray-100'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 콘텐츠 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">콘텐츠</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">특징 (줄바꿈 구분)</label>
              <textarea
                value={formData.features}
                onChange={(e) => setFormData((p) => ({ ...p, features: e.target.value }))}
                rows={4}
                placeholder="특징 1&#10;특징 2"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* 상태 */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
                className="mr-2"
              />
              활성화
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData((p) => ({ ...p, is_featured: e.target.checked }))}
                className="mr-2"
              />
              추천 클럽
            </label>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? '저장 중...' : '클럽 추가'}
          </button>
        </div>
      </form>
    </div>
  )
}
