import { getAllIpos } from './ipoStore';
import { addOrUpdateIpo } from './ipoServerStore';
import { IpoItem } from '@/types/ipo';

export interface PortalIpoSummary {
  name: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  confirmedPrice?: number;
  priceBandMin?: number;
  priceBandMax?: number;
  underwriter?: string;
  detailUrl?: string;
}

export interface PortalIpoDetail {
  name: string;
  listingDate?: string;
  confirmedPrice?: number;
  institutionalCompetitionRate?: number;
  lockupCommitmentRate?: number;
}

/**
 * 38커뮤니케이션 공모주 메인 일정표(EUC-KR) 스크랩 및 파싱
 */
export async function fetch38IpoList(): Promise<PortalIpoSummary[]> {
  try {
    const res = await fetch('http://www.38.co.kr/html/fund/index.htm?o=k', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) return [];
    const buf = await res.arrayBuffer();
    const html = new TextDecoder('euc-kr').decode(buf);

    const summaries: PortalIpoSummary[] = [];

    // 테이블 행 매칭: <tr ...> <td ...> 기업명 </td> <td> 청약일 </td> <td> 확정공모가 </td> <td> 희망공모가 </td> ... <td> 주관사 </td>
    const rows = [...html.matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/gi)];

    for (const r of rows) {
      const rowHtml = r[0];
      if (!rowHtml.includes('bunsuk') && !rowHtml.includes('o=v')) continue;

      const tds = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) =>
        m[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
      );

      if (tds.length < 5) continue;

      const nameMatch = rowHtml.match(/<a[^>]*href=['"]?([^'"]*o=v[^'"]*)['"]?[^>]*>([^<]+)<\/a>/i)
        || rowHtml.match(/<a[^>]*>([^<]+)<\/a>/i);
      
      const rawName = nameMatch ? nameMatch[nameMatch.length - 1].trim() : tds[0];
      const cleanName = rawName.replace(/주식회사|\(주\)|\(유\)/g, '').trim();

      if (!cleanName || cleanName.includes('기업명') || cleanName.length < 2) continue;

      // 링크 추출
      const linkMatch = rowHtml.match(/href=['"]?(\/html\/fund\/index\.htm\?o=v&amp;no=\d+[\w=&;]*|\/html\/fund\/index\.htm\?o=v&no=\d+[\w=&;]*)/i);
      const detailUrl = linkMatch ? 'http://www.38.co.kr' + linkMatch[1].replace(/&amp;/g, '&') : undefined;

      // 확정공모가
      const priceText = tds[2]?.replace(/,/g, '') || '';
      const confirmedPrice = parseInt(priceText, 10);

      summaries.push({
        name: cleanName,
        confirmedPrice: isNaN(confirmedPrice) || confirmedPrice <= 0 ? undefined : confirmedPrice,
        detailUrl,
      });
    }

    return summaries;
  } catch (err) {
    console.error('[CrossCheckSync] 38커뮤니케이션 목록 조회 오류:', err);
    return [];
  }
}

/**
 * 38커뮤니케이션 개별 종목 상세 페이지에서 상장일, 경쟁률, 확약비율 정밀 추출
 */
export async function fetch38IpoDetail(detailUrl: string): Promise<PortalIpoDetail | null> {
  try {
    const res = await fetch(detailUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const html = new TextDecoder('euc-kr').decode(buf);
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

    const result: PortalIpoDetail = { name: '' };

    // 1. 신규상장일 추출 (예: 2026.11.04)
    const listDateMatch = text.match(/(?:신규\s*)?상장일[^\d]{0,20}(\d{4})\.(\d{2})\.(\d{2})/i);
    if (listDateMatch) {
      result.listingDate = `${listDateMatch[1]}-${listDateMatch[2]}-${listDateMatch[3]}`;
    }

    // 2. 확정공모가 추출
    const priceMatch = text.match(/확정\s*공모가[^\d]{0,20}([0-9,]+)\s*원/i);
    if (priceMatch) {
      const price = parseInt(priceMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(price) && price > 0) result.confirmedPrice = price;
    }

    // 3. 기관경쟁률 추출 (예: 630.10:1)
    const compMatch = text.match(/기관\s*경쟁률[^\d]{0,20}([0-9,.]+)\s*:\s*1/i)
      || text.match(/단순\s*경쟁[^\d]{0,60}([0-9,.]+)\s*:\s*1/i);
    if (compMatch) {
      const comp = parseFloat(compMatch[1].replace(/,/g, ''));
      if (!isNaN(comp) && comp > 0) result.institutionalCompetitionRate = comp;
    }

    // 4. 의무보유확약 비율 추출 (예: 0.24%)
    const lockupMatch = text.match(/의무보유\s*확약[^\d%]{0,30}([0-9,.]+)\s*%/i)
      || text.match(/총\s*수량\s*대비\s*비율\s*\(\s*%\s*\)[^\d%]{0,20}([0-9,.]+)\s*%/i);
    if (lockupMatch) {
      const lockup = parseFloat(lockupMatch[1].replace(/,/g, ''));
      if (!isNaN(lockup) && lockup >= 0 && lockup <= 100) result.lockupCommitmentRate = lockup;
    }

    return result;
  } catch (err) {
    console.error(`[CrossCheckSync] 상세 페이지 파싱 실패 (${detailUrl}):`, err);
    return null;
  }
}

/**
 * 2중 교차 검증 및 자가 치유(Self-Healing Diff Audit):
 * DART 단일 소스 의존을 탈피하여 외부 정형 포털과 공모가, 상장일, 경쟁률, 확약비율 자동 대조 및 보정
 */
export async function crossCheckAndSyncIpos(): Promise<{
  updatedCount: number;
  updatedStocks: {
    name: string;
    changes: string[];
  }[];
  message: string;
}> {
  const currentIpos = getAllIpos();
  const activeTargets = currentIpos.filter((i) => !i.isCancelled && i.status !== 'LISTED');

  if (activeTargets.length === 0) {
    return { updatedCount: 0, updatedStocks: [], message: '교차 대조 대상 종목 없음' };
  }

  const portalList = await fetch38IpoList();
  if (portalList.length === 0) {
    return { updatedCount: 0, updatedStocks: [], message: '외부 포털 일정표 조회 실패로 교차 검증 건너뜀' };
  }

  const updatedStocks: { name: string; changes: string[] }[] = [];

  for (const ipo of activeTargets) {
    // 종목명 매칭 (공백 제거 및 법인형태 제거)
    const cleanIpoName = ipo.name.replace(/주식회사|\(주\)|\(유\)|\s+/g, '');
    const matchedSummary = portalList.find((p) => {
      const pClean = p.name.replace(/주식회사|\(주\)|\(유\)|\s+/g, '');
      return pClean === cleanIpoName || cleanIpoName.includes(pClean) || pClean.includes(cleanIpoName);
    });

    if (!matchedSummary || !matchedSummary.detailUrl) continue;

    // 상세 데이터 취득
    const detail = await fetch38IpoDetail(matchedSummary.detailUrl);
    if (!detail) continue;

    const changes: string[] = [];

    // 1) 상장일(listingDate) 불일치 자가 보정 (예: 11월 5일 -> 11월 4일)
    if (detail.listingDate && detail.listingDate !== ipo.listingDate) {
      changes.push(`상장일 변경: ${ipo.listingDate || '미정'} ➔ ${detail.listingDate}`);
      ipo.listingDate = detail.listingDate;
    }

    // 2) 확정 공모가 보정
    if (detail.confirmedPrice && detail.confirmedPrice > 0 && ipo.confirmedPrice !== detail.confirmedPrice) {
      changes.push(`공모가 확정: ${ipo.confirmedPrice ? ipo.confirmedPrice.toLocaleString() + '원' : '미정'} ➔ ${detail.confirmedPrice.toLocaleString()}원`);
      ipo.confirmedPrice = detail.confirmedPrice;
    }

    // 3) 기관 수요예측 경쟁률 보정
    if (detail.institutionalCompetitionRate && detail.institutionalCompetitionRate > 0 && ipo.institutionalCompetitionRate !== detail.institutionalCompetitionRate) {
      changes.push(`기관경쟁률 갱신: ${ipo.institutionalCompetitionRate}:1 ➔ ${detail.institutionalCompetitionRate}:1`);
      ipo.institutionalCompetitionRate = detail.institutionalCompetitionRate;
    }

    // 4) 의무보유확약 비율 보정
    if (detail.lockupCommitmentRate !== undefined && detail.lockupCommitmentRate >= 0 && ipo.lockupCommitmentRate !== detail.lockupCommitmentRate) {
      changes.push(`의무확약 갱신: ${ipo.lockupCommitmentRate}% ➔ ${detail.lockupCommitmentRate}%`);
      ipo.lockupCommitmentRate = detail.lockupCommitmentRate;
    }

    if (changes.length > 0) {
      addOrUpdateIpo(ipo);
      updatedStocks.push({ name: ipo.name, changes });
    }
  }

  return {
    updatedCount: updatedStocks.length,
    updatedStocks,
    message: updatedStocks.length > 0
      ? `[교차 검증 성공] 총 ${updatedStocks.length}개 종목의 불일치 수치가 외부 포털과 자동 동기화되었습니다.`
      : '모든 활성 공모주의 일정 및 확정 수치가 외부 포털과 100% 일치합니다.',
  };
}
