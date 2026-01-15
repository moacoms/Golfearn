export const metadata = {
  title: '골프장 찾기',
  description: '내 주변 골프장 찾기. 위치 기반으로 가까운 골프장을 검색하고 리뷰를 확인하세요.',
  openGraph: {
    title: '골프장 찾기 | Golfearn',
    description: '내 주변 골프장 찾기. 위치 기반으로 가까운 골프장을 검색하고 리뷰를 확인하세요.',
  },
}

export default function GolfCoursesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
