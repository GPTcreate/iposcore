import { getAllIpos } from './ipoStore';
import { addOrUpdateIpo, DartFilingItem, DartListResponse } from './ipoServerStore';

const DART_API_KEY = process.env.DART_API_KEY || '035394bc3056c32575160716cc7cbd3d44b2fff7';

export interface DartFilingParseResult {
  rcpNo: string;
  corpName: string;
  confirmedPrice?: number;
  circulatingSupplyRate?: number;
  institutionalCompetitionRate?: number;
  lockupCommitmentRate?: number;
}

/**
 * DART 공시 뷰어 HTML에서 확정공모가, 상장일 유통가능비율, 기관 경쟁률 등을 정밀 추출
 */
export async function parseConfirmedFilingDetails(rcpNo: string): Promise<DartFilingParseResult | null> {
  try {
    // 1. 메인 뷰어 페이지에서 메인 문서 node1['dcmNo'] 우선 추출 (첨부/계약서 등 option 태그 오매칭 방지)
    const mainUrl = `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rcpNo}`;
    const mainRes = await fetch(mainUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    if (!mainRes.ok) return null;
    const mainHtml = await mainRes.text();

    const node1DcmMatch = mainHtml.match(/node1\['dcmNo'\]\s*=\s*['"](\d+)['"]/i);
    const node1EleMatch = mainHtml.match(/node1\['eleId'\]\s*=\s*['"](\d+)['"]/i);
    const node1OffsetMatch = mainHtml.match(/node1\['offset'\]\s*=\s*['"](\d+)['"]/i);
    const node1LengthMatch = mainHtml.match(/node1\['length'\]\s*=\s*['"](\d+)['"]/i);

    const dcmNo = node1DcmMatch ? node1DcmMatch[1] : (mainHtml.match(/dcmNo['"]?\s*[:=]\s*['"]?(\d+)['"]?/i)?.[1]);
    const eleId = node1EleMatch ? node1EleMatch[1] : '1';
    const offset = node1OffsetMatch ? node1OffsetMatch[1] : '0';
    const length = node1LengthMatch ? node1LengthMatch[1] : '0';
    if (!dcmNo) return null;

    // 2. 문서 서브 뷰어 HTML 가져오기 (정확한 오프셋 및 길이 지정)
    const viewerUrl = `https://dart.fss.or.kr/report/viewer.do?rcpNo=${rcpNo}&dcmNo=${dcmNo}&eleId=${eleId}&offset=${offset}&length=${length}&dtd=dart4.xsd`;
    const viewerRes = await fetch(viewerUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    if (!viewerRes.ok) return null;
    const html = await viewerRes.text();
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

    const result: DartFilingParseResult = { rcpNo, corpName: '' };

    // 1) 확정 공모가 파싱
    const priceMatch = text.match(/(?:1주당|주당)\s*확정공모가액[^\d]{0,40}([0-9,]+)\s*원/i)
      || text.match(/확정공모가액[^\d]{0,40}([0-9,]+)\s*원/i)
      || text.match(/확정\s*공모가액[^\d]{0,40}([0-9,]+)\s*원/i);
    if (priceMatch) {
      result.confirmedPrice = parseInt(priceMatch[1].replace(/,/g, ''), 10);
    }

    // 2) 상장일 유통가능물량 비율 파싱 (정정신고서의 경우 [정정 전] 뒤에 [정정 후]가 위치하므로 마지막 일치값 취득)
    const circMatches = [
      ...text.matchAll(/([\d.]+)\s*%\s*\)?[^\d%]{0,30}(?:는\s*)?상장\s*직후[^\d%]{0,30}유통가능/gi),
      ...text.matchAll(/상장일\s*유통가능[^\d%]{0,60}([\d.]+)\s*%/gi),
      ...text.matchAll(/상장\s*(?:직후|일)?\s*(?:시장에서\s*)?유통가능한?\s*물량[^\d%]{0,60}([\d.]+)\s*%/gi),
      ...text.matchAll(/유통가능\s*주식수비율[^\d%]{0,60}([\d.]+)\s*%/gi),
      ...text.matchAll(/유통가능물량[^\d%]{0,40}([\d.]+)\s*%/gi),
    ];
    if (circMatches.length > 0) {
      const validMatches = circMatches
        .map((m) => parseFloat(m[1]))
        .filter((val) => !isNaN(val) && val > 0 && val <= 100);
      if (validMatches.length > 0) {
        // 정정 후 최종 수치 선택 (마지막 유효 값)
        result.circulatingSupplyRate = validMatches[validMatches.length - 1];
      }
    }

    // 3) 기관 수요예측 경쟁률 파싱 (테이블의 마지막 합계 TD)
    const compRowMatch = text.match(/합\s*계[^\d]{0,200}?경쟁률[^\d]{0,40}([\d.]+)/i)
      || html.match(/<TR[^>]*>[\s\S]*?<TD[^>]*>\s*경쟁률\s*<\/TD>[\s\S]*?<\/TR>/i);
    if (compRowMatch) {
      if (compRowMatch[1]) {
        result.institutionalCompetitionRate = parseFloat(compRowMatch[1]);
      } else {
        const tds = [...compRowMatch[0].matchAll(/<TD[^>]*>([\s\S]*?)<\/TD>/gi)]
          .map((m) => m[1].replace(/<[^>]+>/g, '').trim());
        const lastTd = tds[tds.length - 1];
        const parsedRate = parseFloat(lastTd.replace(/,/g, ''));
        if (!isNaN(parsedRate) && parsedRate > 0) {
          result.institutionalCompetitionRate = parsedRate;
        }
      }
    }

    // 4) 의무보유확약 비율 파싱
    const lockupMatch = text.match(/의무보유\s*확약\s*비율[^\d%]{0,40}([\d.]+)\s*%/i)
      || text.match(/확약\s*비율[^\d%]{0,40}([\d.]+)\s*%/i);
    if (lockupMatch) {
      const parsedLockup = parseFloat(lockupMatch[1]);
      if (!isNaN(parsedLockup) && parsedLockup >= 0 && parsedLockup <= 100) {
        result.lockupCommitmentRate = parsedLockup;
      }
    }

    return result;
  } catch (err) {
    console.error(`[DartFilingSync] rcpNo=${rcpNo} 파싱 중 에러:`, err);
    return null;
  }
}

/**
 * 기존 등록된 청약 예정/진행 종목 중, DART에 새로 올라온 [증권발행조건확정 / 정정신고서]를 대조하여 자동 업데이트
 */
export async function syncExistingIposWithDartFilings(options?: {
  days?: number;
}): Promise<{
  updatedCount: number;
  updatedStocks: { name: string; code: string; confirmedPrice?: number; circulatingRate?: number; competitionRate?: number }[];
  message: string;
}> {
  const days = options?.days || 14;
  const today = new Date();
  const endDate = today.toISOString().slice(0, 10).replace(/-/g, '');
  const pastDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  const startDate = pastDate.toISOString().slice(0, 10).replace(/-/g, '');

  const dartUrl = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${DART_API_KEY}&bgn_de=${startDate}&end_de=${endDate}&page_no=1&page_count=100`;

  let filings: DartFilingItem[] = [];
  try {
    const res = await fetch(dartUrl, { next: { revalidate: 0 } });
    const data: DartListResponse = await res.json();
    if (data.status === '000' && Array.isArray(data.list)) {
      filings = data.list;
    }
  } catch (err) {
    return {
      updatedCount: 0,
      updatedStocks: [],
      message: `DART 공시 목록 조회 실패: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const allCurrentIpos = getAllIpos();
  const updatedStocks: { name: string; code: string; confirmedPrice?: number; circulatingRate?: number; competitionRate?: number }[] = [];

  for (const ipo of allCurrentIpos) {
    // 이미 상장 완료되었거나 취소된 종목은 스킵
    if (ipo.isCancelled || ipo.status === 'LISTED') continue;

    // 해당 종목의 최근 DART 공시 검색
    const targetFilings = filings.filter((f) => {
      const cleanFilingName = f.corp_name.replace(/(주식회사|\(주\)|\(유\)|주\s)/g, '').trim();
      return cleanFilingName === ipo.name || (f.stock_code && f.stock_code === ipo.code);
    });

    for (const filing of targetFilings) {
      const isConfirmedFiling = filing.report_nm.includes('발행조건확정')
        || (filing.report_nm.includes('투자설명서') && !filing.report_nm.includes('예비'))
        || (filing.report_nm.includes('기재정정') && filing.report_nm.includes('지분증권'));

      if (!isConfirmedFiling) continue;

      console.log(`[DartFilingSync] 확정 공시 감지 -> ${ipo.name} (${filing.report_nm}, rcpNo: ${filing.rcept_no})`);
      const parsed = await parseConfirmedFilingDetails(filing.rcept_no);
      if (!parsed) continue;

      let changed = false;

      if (parsed.confirmedPrice && parsed.confirmedPrice > 0 && ipo.confirmedPrice !== parsed.confirmedPrice) {
        ipo.confirmedPrice = parsed.confirmedPrice;
        changed = true;
      }

      if (parsed.circulatingSupplyRate && parsed.circulatingSupplyRate > 0 && ipo.circulatingSupplyRate !== parsed.circulatingSupplyRate) {
        ipo.circulatingSupplyRate = parsed.circulatingSupplyRate;
        changed = true;
      }

      if (parsed.institutionalCompetitionRate && parsed.institutionalCompetitionRate > 0 && ipo.institutionalCompetitionRate !== parsed.institutionalCompetitionRate) {
        ipo.institutionalCompetitionRate = parsed.institutionalCompetitionRate;
        changed = true;
      }

      if (parsed.lockupCommitmentRate !== undefined && ipo.lockupCommitmentRate !== parsed.lockupCommitmentRate) {
        ipo.lockupCommitmentRate = parsed.lockupCommitmentRate;
        changed = true;
      }

      if (changed) {
        // 날짜 기준 상태 전이 확인
        const nowStr = today.toISOString().slice(0, 10);
        if (ipo.status === 'UPCOMING' && nowStr >= ipo.subscriptionStart && nowStr <= ipo.subscriptionEnd) {
          ipo.status = 'SUBSCRIPTION';
        }
        addOrUpdateIpo(ipo);
        updatedStocks.push({
          name: ipo.name,
          code: ipo.code,
          confirmedPrice: ipo.confirmedPrice,
          circulatingRate: ipo.circulatingSupplyRate,
          competitionRate: ipo.institutionalCompetitionRate,
        });
        break; // 최신 공시 1건 처리 완료
      }
    }
  }

  return {
    updatedCount: updatedStocks.length,
    updatedStocks,
    message: `기존 공모주 DART 확정공시 자동 대조 완료 (총 ${updatedStocks.length}건 갱신)`,
  };
}
