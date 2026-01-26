'use client'

import { usePathname, useRouter } from 'next/navigation'
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n/config'
import { useState, useRef, useEffect } from 'react'

export default function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 현재 locale 추출
  const currentLocale = locales.find((locale) =>
    pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  ) || 'en'

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const switchLocale = (newLocale: Locale) => {
    // 현재 경로에서 locale 부분을 새 locale로 교체
    let newPath = pathname

    // 현재 locale이 경로에 있으면 교체
    const currentLocaleInPath = locales.find((locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (currentLocaleInPath) {
      newPath = pathname.replace(`/${currentLocaleInPath}`, `/${newLocale}`)
    } else {
      // 경로에 locale이 없으면 추가
      newPath = `/${newLocale}${pathname}`
    }

    router.push(newPath)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-sm"
      >
        <span>{localeFlags[currentLocale as Locale]}</span>
        <span className="hidden sm:inline">{localeNames[currentLocale as Locale]}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLocale(locale)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition ${
                locale === currentLocale ? 'bg-green-50 text-green-600' : 'text-gray-700'
              }`}
            >
              <span>{localeFlags[locale]}</span>
              <span>{localeNames[locale]}</span>
              {locale === currentLocale && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
