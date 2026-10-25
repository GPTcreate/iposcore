'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import IpoCard from '@/components/IpoCard';
import GoogleAdSlot from '@/components/GoogleAdSlot';
import NewsletterBanner from '@/components/NewsletterBanner';
import { getAllEffectiveIpos } from '@/lib/ipoUtils';
import { isPublicIpo, toPublicIpo } from '@/lib/publicIpo';
import { GUIDE_ARTICLES } from '@/data/guidesData';
import { IpoStatus } from '@/types/ipo';
import { TrendingUp, HelpCircle, ChevronRight, BookOpen } from 'lucide-react';

// 청약 진행 중이 0건이면 청약 예정을 기본 탭으로, 아니면 청약 진행 중으로 설정
function getDefaultTab(ipos: { status: IpoStatus }[]): 'ALL' | IpoStatus {
  const hasSubscription = ipos.some((i) => i.status === 'SUBSCRIPTION');
  return hasSubscription ? 'SUBSCRIPTION' : 'UPCOMING';
}

export default function Home() {
  const PAGE_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // KST 현재 일자 및 시각 기준 실시간 상태 동적 전이 적용
  const initialIpos = React.useMemo(() => getAllEffectiveIpos().filter(isPublicIpo).map(toPublicIpo), []);
  const [allIpos, setAllIpos] = useState(initialIpos);

  const [filter, setFilter] = useState<'ALL' | IpoStatus>(() => getDefaultTab(initialIpos));

  React.useEffect(() => {
    fetch('/api/ipo')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.ipos)) {
          const registered = data.ipos.filter(isPublicIpo);
          setAllIpos(registered);
          // API 응답 기준으로 탭 재결정 (URL/세션에 저장된 탭이 없을 때만)
          const hasStoredTab =
            typeof window !== 'undefined' &&
            (new URLSearchParams(window.location.search).get('tab') ||
              sessionStorage.getItem('iposcore_active_tab'));
          if (!hasStoredTab) {
            setFilter(getDefaultTab(registered));
          }
        }
      })
      .catch(() => {});
  }, []);

  // 스마트 정렬: 청약 진행 중 -> 청약 예정(마감일 가까운 순) -> 상장 대기(상장일 가까운 순) -> 상장 완료
  const statusPriority: Record<IpoStatus, number> = {
    SUBSCRIPTION: 1,
    UPCOMING: 2,
    WAITING_LISTING: 3,
    LISTED: 4,
  };

  const filteredIpos = allIpos
    .filter((ipo) => {
      if (filter === 'ALL') return ipo.status !== 'LISTED';
      return ipo.status === filter;
    })
    .sort((a, b) => {
      const priorityDiff = (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
      if (priorityDiff !== 0) return priorityDiff;
      // 상장 완료 종목은 최근 상장일 역순(내림차순) 정렬
      if (a.status === 'LISTED') {
        return (b.listingDate || b.subscriptionStart || '').localeCompare(a.listingDate || a.subscriptionStart || '');
      }
      // 상장 대기 종목은 상장 임박 순(오름차순) 정렬
      if (a.status === 'WAITING_LISTING') {
        return (a.listingDate || '9999-12-31').localeCompare(b.listingDate || '9999-12-31');
      }
      // 청약 예정 및 진행 종목은 청약일 임박 순(오름차순) 정렬
      return (a.subscriptionStart || '9999-12-31').localeCompare(b.subscriptionStart || '9999-12-31');
    });

  // 브라우저 뒤로가기(백스페이스 등) 시 기존에 보던 탭 복원
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const restoreActiveTab = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as ('ALL' | IpoStatus) | null;
      const savedTab = sessionStorage.getItem('iposcore_active_tab') as ('ALL' | IpoStatus) | null;
      const validTabs: ('ALL' | IpoStatus)[] = ['ALL', 'SUBSCRIPTION', 'UPCOMING', 'WAITING_LISTING', 'LISTED'];

      const targetTab = tabParam && validTabs.includes(tabParam)
        ? tabParam
        : savedTab && validTabs.includes(savedTab)
        ? savedTab
        : null;

      if (targetTab) {
        setFilter(targetTab);
      }
    };

    restoreActiveTab();
    window.addEventListener('popstate', restoreActiveTab);
    return () => window.removeEventListener('popstate', restoreActiveTab);
  }, []);

  // 필터 변경 시 표시 개수 리셋 및 URL/세션스토리지에 탭 상태 저장
  const handleFilterChange = (newFilter: 'ALL' | IpoStatus) => {
    setFilter(newFilter);
    setVisibleCount(PAGE_SIZE);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('iposcore_active_tab', newFilter);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newFilter);
      window.history.replaceState({ ...window.history.state, tab: newFilter }, '', url.toString());
    }
  };

  const displayedIpos = filteredIpos.slice(0, visibleCount);
  const hasMore = visibleCount < filteredIpos.length;
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  // 스크롤 감지 자동 더보기 (무한 스크롤 & 렉 방지)
  React.useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredIpos.length));
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, filteredIpos.length]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* 상단 안내 헤더 */}
        <div className="bg-white rounded-xl border border-gray-300 p-5 sm:p-7 shadow-2xs mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md mb-2 border border-blue-200">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>공시 점수 · 블로그 여론 · 청약 계산</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                공모주 청약 일정과 분석
              </h1>
              <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                청약 일정과 참고점수, 블로그 의견을 한눈에 확인하세요.
              </p>
            </div>

            <div className="text-left md:text-right shrink-0 flex flex-wrap md:flex-col gap-3">
              <Link href="/calculator" className="px-4 py-3 bg-blue-700 text-white rounded-lg text-sm font-bold text-center">배정·손익 계산하기</Link>
              <Link href="/guides" className="px-4 py-2 text-blue-700 font-semibold text-sm underline">공시 읽는 순서 보기</Link>
            </div>
          </div>
        </div>

        {allIpos.length > 0 && <>
        {/* 필터 탭 (청약 진행 중이 0건일 때는 청약 예정을 앞으로 배치 & 모바일 가로 스크롤 최적화) */}
        <div className="mb-5 space-y-2">
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-gray-200/90 text-xs sm:text-sm font-bold overflow-x-auto scrollbar-none touch-pan-x">
            {(() => {
              const subCount = allIpos.filter((i) => i.status === 'SUBSCRIPTION').length;
              const hasSub = subCount > 0;
              const tabs: { key: 'ALL' | IpoStatus; label: string; count: number }[] = [
                { key: 'ALL', label: '전체', count: allIpos.filter((i) => i.status !== 'LISTED').length },
                ...(hasSub
                  ? [
                      { key: 'SUBSCRIPTION' as const, label: '청약 진행 중', count: subCount },
                      { key: 'UPCOMING' as const, label: '청약 예정', count: allIpos.filter((i) => i.status === 'UPCOMING').length },
                    ]
                  : [
                      { key: 'UPCOMING' as const, label: '청약 예정', count: allIpos.filter((i) => i.status === 'UPCOMING').length },
                      { key: 'SUBSCRIPTION' as const, label: '청약 진행 중', count: 0 },
                    ]),
                { key: 'WAITING_LISTING', label: '상장 대기', count: allIpos.filter((i) => i.status === 'WAITING_LISTING').length },
                { key: 'LISTED', label: '상장 완료 (실전 수익률)', count: allIpos.filter((i) => i.status === 'LISTED').length },
              ];

              return tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleFilterChange(tab.key)}
                  className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    filter === tab.key
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-300/60'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ));
            })()}
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500 px-1">
            <span>
              현재 보기: <strong className="text-blue-800 font-bold">{
                filter === 'ALL' ? '전체 일정 (지난 공모주 제외)' :
                filter === 'SUBSCRIPTION' ? '청약 진행 중' :
                filter === 'UPCOMING' ? '청약 예정' :
                filter === 'WAITING_LISTING' ? '상장 대기' : '상장 완료 (실전 수익률)'
              }</strong> ({filteredIpos.length}개 종목)
            </span>
            <Link href="/methodology" className="text-blue-700 underline">출처·갱신 기준</Link>
          </div>
        </div>

        {/* 공모주 카드 목록 (페이징 & 점진적 로딩으로 렉 방지) */}
        {displayedIpos.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-300 p-10 text-center text-gray-500 shadow-2xs">
            <p className="text-base font-semibold text-gray-700">현재 이 분류에 등록된 종목이 없습니다.</p>
            <p className="text-sm text-gray-600 mt-2">실제 시장에 청약 종목이 없다는 뜻은 아닙니다. 청약 신청 전 DART 투자설명서와 주관사의 공고를 확인하세요.</p>
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm font-bold text-blue-700">
              <a href="https://dart.fss.or.kr/" target="_blank" rel="noopener noreferrer" className="underline">DART 공시 확인</a>
              <Link href="/guides/dart-prospectus-reading-top-3-risk-factors" className="underline">공시 읽는 순서</Link>
              <Link href="/calculator" className="underline">내 자금으로 비용 계산</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedIpos.map((ipo) => (
              <IpoCard key={ipo.id} ipo={ipo} />
            ))}
          </div>
        )}

        {/* 더보기 및 스크롤 로딩 트리거 (렉 방지) */}
        {hasMore && (
          <div ref={loadMoreRef} className="py-6 text-center">
            <button
              onClick={() => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredIpos.length))}
              className="px-6 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer"
            >
              공모주 더보기 ({filteredIpos.length - visibleCount}개 남음) ↓
            </button>
          </div>
        )}

        </>}

        <section className="mb-6 rounded-xl border border-blue-200 bg-white p-5 sm:p-7 space-y-3">
          <p className="text-xs font-bold text-blue-700">공시 읽기 사례 · 2026-10-25</p>
          <h2 className="text-lg sm:text-xl font-bold">4.58%와 95.42%, 공시의 어느 열을 읽었나요?</h2>
          <p className="text-sm leading-relaxed text-gray-700">아이엠1호스팩의 공시에서 보호예수와 유통가능 물량을 구분하고, 주식 수와 공모가로 유통가능 금액을 다시 계산했습니다. 같은 표의 두 비율을 뒤집어 읽으면 위험 해석이 크게 달라집니다.</p>
          <Link href="/research/iam-spac1-float" className="inline-block text-sm text-blue-700 font-bold underline">원문과 계산 과정 확인하기 →</Link>
        </section>



        {/* 광고 영역 - 페이지당 딱 1개만 단정하게 배치 */}
        <GoogleAdSlot label="스폰서 안내" className="my-8" />

        <section className="my-8 p-6 rounded-xl border border-gray-300 bg-white shadow-2xs">
          <h2 className="text-lg font-bold text-gray-900 mb-2">같은 경쟁률, 다른 청약 비용</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">비례 경쟁률만 보고 필요한 자금을 판단하기는 어렵습니다. 공모가와 증거금률을 함께 곱해야 합니다. 아래는 실제 종목과 무관한 계산 예시입니다.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[420px]">
              <caption className="sr-only">공모가에 따른 비례 1주 이론 증거금 비교</caption>
              <thead className="bg-gray-50"><tr><th className="p-3">가정</th><th className="p-3">공모가</th><th className="p-3">비례 경쟁률</th><th className="p-3">1주 이론 증거금</th></tr></thead>
              <tbody><tr className="border-t border-gray-200"><td className="p-3">사례 A</td><td className="p-3">10,000원</td><td className="p-3">1,000 : 1</td><td className="p-3 font-bold">500만원</td></tr>
              <tr className="border-t border-gray-200"><td className="p-3">사례 B</td><td className="p-3">30,000원</td><td className="p-3">1,000 : 1</td><td className="p-3 font-bold">1,500만원</td></tr></tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600 mt-3 leading-relaxed">증거금률 50% 가정: 공모가 × 비례 경쟁률 × 0.5. 배정 보장 금액이 아니며 청약 단위·한도·잔여주 처리에 따라 실제 배정은 달라집니다. 기관 수요예측 경쟁률을 여기에 넣으면 계산이 맞지 않습니다.</p>
          <p className="text-sm text-gray-700 mt-3 leading-relaxed">사례 B의 1,500만원을 연 5%로 4일 빌리면 이자는 약 8,219원입니다. 1주 배정, 주가 10% 상승(차익 3,000원), 청약 수수료 2,000원을 가정하면 매도 비용 전에도 약 7,219원 손실입니다. 주가 상승과 순이익은 다를 수 있습니다.</p>
          <Link href="/calculator" className="inline-block mt-4 text-sm font-bold text-blue-700 underline">내 증거금·대출금으로 손익 비교하기 →</Link>
        </section>

        {/* 신규: 공모주 투자 가이드 & 심층 분석 칼럼 추천 섹션 */}
        <section className="my-8 p-6 sm:p-7 rounded-xl border border-gray-300 bg-white shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-700" />
              <h2 className="text-lg font-bold text-gray-900">
                공모주 실전 투자 가이드 & 심층 분석 칼럼
              </h2>
            </div>
            <Link
              href="/guides"
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 group"
            >
              <span>전체 가이드 보기 ({GUIDE_ARTICLES.length}편 전체)</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <p className="text-xs text-gray-600 mb-5 leading-relaxed">
            계좌 준비, 공시의 위험요소, 배정 방식, 환불일의 자금 공백을 주제별로 살펴보세요. 각 글은 공식 자료와 직접 따라 계산할 수 있는 예시를 함께 제공합니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {GUIDE_ARTICLES.slice(0, 4).map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  <span className="text-[11px] font-bold text-blue-700 block mb-1">
                    {guide.category}
                  </span>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-gray-500 text-[11px] mt-1.5 line-clamp-2 leading-relaxed">
                    {guide.excerpt}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                  <span>읽는 시간 {guide.readTime}</span>
                  <span className="text-blue-700 font-bold flex items-center">
                    읽기 <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <details className="my-8 p-6 rounded-xl border border-gray-300 bg-white shadow-2xs">
          <summary className="flex items-center gap-2 cursor-pointer">
            <HelpCircle className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-gray-900">
              자주 묻는 질문
            </h2>
          </summary>

          <div className="mt-4 space-y-3.5 text-xs sm:text-sm">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                <span className="text-blue-700 font-black">Q.</span>
                2026년 공모주 청약 일정 및 수요예측 결과는 언제 업데이트되나요?
              </h3>
              <p className="text-gray-600 leading-relaxed pl-5">
                신규 공시를 발견하면 기존 종목을 보존하며 목록에 추가하고 일정과 지표를 보완합니다. 등록자료와 공시 확인 상태를 항목별로 표시하며, 신청 당일의 최종 일정은 주관사 공고에서 다시 확인하세요.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                <span className="text-blue-700 font-black">Q.</span>
                기관 수요예측 경쟁률과 의무보유확약 비율은 왜 중요한가요?
              </h3>
              <p className="text-gray-600 leading-relaxed pl-5">
                기관 경쟁률은 신청 수요를, 의무보유확약은 일정 기간 매도 제한 약정을 나타냅니다. 신청 기준인지 최종 배정 기준인지와 기간별 비중을 구분해야 합니다. 어느 한 비율만으로 흥행 성공이나 상장일 상승을 판단할 수 없습니다.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                <span className="text-blue-700 font-black">Q.</span>
                공모주 비례배정 5사6입 법칙과 계산기 활용법은?
              </h3>
              <p className="text-gray-600 leading-relaxed pl-5">
                5사6입은 일부 배정 공고에 사용되는 소수점 처리 방식으로 모든 청약에 적용되는 보장 규칙이 아닙니다. <Link href="/calculator" className="text-blue-700 font-bold underline">비례배정 계산기</Link>에서 가정한 배정 방식과 비용을 바꾸어 비교하고, 실제 잔여주 처리 방식은 증권사 배정 공고를 확인하세요.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                <span className="text-blue-700 font-black">Q.</span>
                공모주 상장일 주가 변동 범위(가격제한폭)는 어떻게 되나요?
              </h3>
              <p className="text-gray-600 leading-relaxed pl-5">
                일반적인 신규 공모 상장 주식은 첫날 공모가의 60~400% 범위가 적용됩니다. 이는 가능한 호가 범위이며 해당 가격에 거래되거나 매도된다는 뜻은 아닙니다. 재상장 등 예외와 주문·체결 위험은 <Link href="/guides/listing-day-price-limits-and-selling-timing" className="text-blue-700 underline">상장일 주문 가이드</Link>에서 확인하세요.
              </p>
            </div>
          </div>
        </details>

        <section className="my-8 p-6 rounded-xl border border-gray-300 bg-white shadow-2xs">
          <h2 className="text-lg font-bold text-gray-900 mb-3">청약 전에 남겨둘 네 가지 기록</h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700 leading-relaxed">
            <li>최종 투자설명서의 접수번호와 정정 여부: 처음 본 신고서가 현재 유효한 문서인지 확인합니다.</li>
            <li>기관 수요예측과 일반 청약의 구분: 비례 계산에는 해당 증권사의 비례 경쟁률이 필요합니다.</li>
            <li>환불일 전후의 자금 잔액: 아직 환불되지 않은 증거금을 다음 청약에 중복 배정하지 않습니다.</li>
            <li>내가 감당할 손실: 배정 주수, 가격 하락, 이자와 수수료를 함께 계산합니다.</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-blue-700">
            <Link href="/guides/dart-prospectus-reading-top-3-risk-factors" className="underline">투자설명서 읽기</Link>
            <Link href="/guides/ipo-refund-period-and-capital-rotation-tips" className="underline">환불일 자금표 만들기</Link>
            <Link href="/methodology" className="underline">출처와 분석 기준</Link>
          </div>
        </section>

        {/* 주간 리포트 이메일 알림 신청 */}
        <NewsletterBanner />

      </main>
    </div>
  );
}
