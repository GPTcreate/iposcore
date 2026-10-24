import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 text-xs text-gray-600 space-y-3">
        <p className="font-bold text-gray-800">IPOScore · 공모주 알리미 리포트</p>
        <nav aria-label="서비스 정보" className="flex flex-wrap gap-x-5 gap-y-3">
          <Link href="/guides" className="underline">청약 가이드</Link>
          <Link href="/calculator" className="underline">배정·비용 계산기</Link>
          <Link href="/methodology" className="underline">출처·분석 기준</Link>
          <Link href="/about" className="underline">운영·정정 문의</Link>
          <Link href="/privacy" className="underline">개인정보처리방침</Link>
          <Link href="/terms" className="underline">이용약관</Link>
        </nav>
        <p className="leading-relaxed">공시 해설과 계산 예시는 정보 확인을 돕는 참고 자료입니다. 청약 전 최종 투자설명서와 주관사 공고를 확인하세요. 투자 원금 손실이 발생할 수 있습니다.</p>
        <p>문의: <a href="mailto:hanmanju88@gmail.com" className="underline">hanmanju88@gmail.com</a></p>
      </div>
    </footer>
  );
}
