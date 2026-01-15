'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface ShareButtonProps {
  title: string
  text: string
  url?: string
  hashtags?: string[]
  className?: string
}

export function ShareButton({ title, text, url, hashtags = [], className = '' }: ShareButtonProps) {
  const [showOptions, setShowOptions] = useState(false)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(text)
    const encodedTitle = encodeURIComponent(title)
    const hashtagString = hashtags.map((tag) => encodeURIComponent(tag)).join(',')

    switch (platform) {
      case 'kakao':
        // 카카오톡 공유 (Kakao SDK 필요)
        if (typeof window !== 'undefined' && (window as any).Kakao) {
          ;(window as any).Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: title,
              description: text,
              imageUrl: 'https://www.golfearn.com/og-image.png',
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
            buttons: [
              {
                title: '자세히 보기',
                link: {
                  mobileWebUrl: shareUrl,
                  webUrl: shareUrl,
                },
              },
            ],
          })
        } else {
          alert('카카오톡 공유 기능을 사용할 수 없습니다.')
        }
        break

      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=400')
        break

      case 'twitter':
        const twitterHashtags = hashtags.join(',')
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=${twitterHashtags}`,
          '_blank',
          'width=600,height=400'
        )
        break

      case 'line':
        window.open(`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`, '_blank', 'width=600,height=400')
        break

      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl)
          alert('링크가 클립보드에 복사되었습니다!')
        } catch (err) {
          console.error('Failed to copy:', err)
          alert('링크 복사에 실패했습니다.')
        }
        break

      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: title,
              text: text,
              url: shareUrl,
            })
          } catch (err) {
            console.error('Error sharing:', err)
          }
        }
        break

      default:
        break
    }

    setShowOptions(false)
  }

  // Web Share API 지원 확인
  const supportsNativeShare = typeof navigator !== 'undefined' && navigator.share

  if (supportsNativeShare) {
    return (
      <Button onClick={() => handleShare('native')} variant="outline" className={className}>
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        공유하기
      </Button>
    )
  }

  return (
    <div className="relative">
      <Button onClick={() => setShowOptions(!showOptions)} variant="outline" className={className}>
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        공유하기
      </Button>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <button
              onClick={() => handleShare('kakao')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div className="w-5 h-5 mr-3 bg-yellow-400 rounded flex items-center justify-center text-xs font-bold">K</div>
              카카오톡
            </button>

            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div className="w-5 h-5 mr-3 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">f</div>
              페이스북
            </button>

            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div className="w-5 h-5 mr-3 bg-blue-400 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </div>
              트위터
            </button>

            <button
              onClick={() => handleShare('line')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div className="w-5 h-5 mr-3 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">L</div>
              라인
            </button>

            <hr className="my-1" />

            <button
              onClick={() => handleShare('copy')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              링크 복사
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface ReferralShareButtonProps {
  referralCode: string
  className?: string
}

/**
 * 추천인 코드 공유 전용 버튼
 */
export function ReferralShareButton({ referralCode, className = '' }: ReferralShareButtonProps) {
  const shareUrl = `https://www.golfearn.com/signup?ref=${referralCode}`
  const shareText = `골프 입문자를 위한 플랫폼 Golfearn에 초대합니다! 회원가입하고 3,000 포인트 받으세요! 추천 코드: ${referralCode}`

  return (
    <ShareButton
      title="Golfearn 초대"
      text={shareText}
      url={shareUrl}
      hashtags={['골린이', '골프입문', 'Golfearn']}
      className={className}
    />
  )
}

interface PostShareButtonProps {
  postId: string
  postTitle: string
  className?: string
}

/**
 * 게시글 공유 전용 버튼
 */
export function PostShareButton({ postId, postTitle, className = '' }: PostShareButtonProps) {
  const shareUrl = `https://www.golfearn.com/community/${postId}`
  const shareText = `${postTitle} - Golfearn 커뮤니티`

  return (
    <ShareButton
      title={postTitle}
      text={shareText}
      url={shareUrl}
      hashtags={['골린이', '골프커뮤니티', 'Golfearn']}
      className={className}
    />
  )
}

interface ProductShareButtonProps {
  productId: string
  productTitle: string
  className?: string
}

/**
 * 중고거래 상품 공유 전용 버튼
 */
export function ProductShareButton({ productId, productTitle, className = '' }: ProductShareButtonProps) {
  const shareUrl = `https://www.golfearn.com/market/${productId}`
  const shareText = `${productTitle} - Golfearn 중고거래`

  return (
    <ShareButton
      title={productTitle}
      text={shareText}
      url={shareUrl}
      hashtags={['골프중고', '골프용품', 'Golfearn']}
      className={className}
    />
  )
}
