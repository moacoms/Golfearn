// 지원 언어 목록
export const locales = ['en', 'ko'] as const;
export type Locale = (typeof locales)[number];

// 기본 언어
export const defaultLocale: Locale = 'ko';

// 언어 이름
export const localeNames: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
};

// 언어 플래그
export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  ko: '🇰🇷',
};

// 다국어 경로에서 제외할 경로
export const publicPages = [
  '/',
  '/pricing',
  '/about',
];

// 인증이 필요한 경로
export const protectedPages = [
  '/analysis',
  '/settings',
];
