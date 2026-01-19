'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { GolfClubWithBrand } from '@/types/club'
import { CLUB_TYPE_LABELS } from '@/types/club'

interface ClubCardProps {
  club: GolfClubWithBrand
  showBrand?: boolean
  showPrice?: boolean
  compact?: boolean
}

export default function ClubCard({
  club,
  showBrand = true,
  showPrice = true,
  compact = false,
}: ClubCardProps) {
  const imageUrl = club.image_urls?.[0] || '/images/club-placeholder.png'
  const displayName = club.name_ko || club.name
  const brandName = club.brand?.name_ko || club.brand?.name || ''

  // 특성 레벨 표시
  const renderLevelBars = (level: number, label: string) => (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted w-12">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-sm ${
              i <= level ? 'bg-primary' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  )

  if (compact) {
    return (
      <Link
        href={`/club-catalog/${club.id}`}
        className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary hover:bg-gray-50 transition-colors"
      >
        <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
          <Image
            src={imageUrl}
            alt={displayName}
            fill
            className="object-contain"
            sizes="64px"
          />
        </div>
        <div className="flex-1 min-w-0">
          {showBrand && brandName && (
            <p className="text-xs text-muted truncate">{brandName}</p>
          )}
          <h3 className="font-medium text-sm truncate">{displayName}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">
              {CLUB_TYPE_LABELS[club.club_type]}
            </span>
            {club.rating > 0 && (
              <span className="text-xs text-yellow-600">
                ★ {club.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        {showPrice && club.current_price && (
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-primary">
              {club.current_price.toLocaleString()}원
            </p>
          </div>
        )}
      </Link>
    )
  }

  return (
    <Link
      href={`/club-catalog/${club.id}`}
      className="card hover:shadow-lg transition-shadow group"
    >
      {/* 이미지 */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden rounded-t-lg">
        <Image
          src={imageUrl}
          alt={displayName}
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {club.is_featured && (
          <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
            추천
          </span>
        )}
        {club.model_year && (
          <span className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
            {club.model_year}
          </span>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="p-4">
        {/* 브랜드 & 타입 */}
        <div className="flex items-center justify-between mb-1">
          {showBrand && brandName && (
            <span className="text-xs text-muted">{brandName}</span>
          )}
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
            {CLUB_TYPE_LABELS[club.club_type]}
          </span>
        </div>

        {/* 이름 */}
        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {displayName}
        </h3>

        {/* 평점 */}
        {club.rating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-500">★</span>
            <span className="font-medium">{club.rating.toFixed(1)}</span>
            <span className="text-muted text-sm">({club.review_count})</span>
          </div>
        )}

        {/* 특성 */}
        <div className="space-y-1 mb-3">
          {renderLevelBars(club.forgiveness_level, '관용성')}
          {renderLevelBars(club.distance_level, '비거리')}
          {renderLevelBars(club.feel_level, '타감')}
        </div>

        {/* 가격 */}
        {showPrice && (
          <div className="pt-3 border-t">
            {club.current_price ? (
              <div className="flex items-end gap-2">
                <span className="text-lg font-bold text-primary">
                  {club.current_price.toLocaleString()}원
                </span>
                {club.release_price && club.release_price > club.current_price && (
                  <span className="text-sm text-muted line-through">
                    {club.release_price.toLocaleString()}원
                  </span>
                )}
              </div>
            ) : (
              <span className="text-muted">가격 미정</span>
            )}

            {/* 중고 시세 */}
            {club.used_price_guide?.A && (
              <p className="text-xs text-muted mt-1">
                중고 A급 ~{club.used_price_guide.A.toLocaleString()}원
              </p>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
