import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-foreground text-white py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">Golfearn</h3>
            <p className="text-gray-400 text-sm">
              늦게 시작해도 괜찮아, 함께라면.
              <br />
              골린이의 모든 여정을 함께합니다.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/guide" className="hover:text-white">입문 가이드</Link></li>
              <li><Link href="/community" className="hover:text-white">커뮤니티</Link></li>
              <li><Link href="/market" className="hover:text-white">중고거래</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">고객지원</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/faq" className="hover:text-white">자주 묻는 질문</Link></li>
              <li><Link href="/contact" className="hover:text-white">문의하기</Link></li>
              <li><Link href="/notice" className="hover:text-white">공지사항</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">법적 고지</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/terms" className="hover:text-white">이용약관</Link></li>
              <li><Link href="/privacy" className="hover:text-white">개인정보처리방침</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Golfearn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
