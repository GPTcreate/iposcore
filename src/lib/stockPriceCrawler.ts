import https from 'https';
import { IpoItem } from '@/types/ipo';
import { getAllEffectiveIpos, getKstDateString } from './ipoUtils';
import { addOrUpdateIpo } from './ipoServerStore';
import { getFieldEvidence } from './contentQuality';
import { normalizeListingCompany } from './officialSource';

export interface CrawledStockPrice {
  code: string;
  tradeDate: string;
  openingPrice: number;
  closingPrice: number;
  source: 'fchart_origin' | 'realtime_polling' | 'recent_price_history';
}

export interface SyncPriceResult {
  success: boolean;
  totalCandidates: number;
  updatedCount: number;
  updatedStocks: { code: string; name: string; openingPrice: number; closingPrice: number; source: string }[];
  skippedCount: number;
  deferredCount: number;
  deferredStocks: { code: string; name: string; reason: string }[];
  errors: { code: string; name: string; error: string }[];
  timestamp: string;
}

type PriceFetcher = (url: string) => Promise<string>;
const isIsoDay = (value: string | undefined): value is string => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value);

/**
 * 범용 HTTPS GET 요청 헬퍼
 */
function httpsGet(url: string, headers: Record<string, string> = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: '*/*',
          ...headers,
        },
        timeout: 5000,
      },
      (res) => {
        if (res.statusCode !== 200) { res.resume(); reject(new Error(`시세 HTTP ${res.statusCode}`)); return; }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('error', reject);
        res.on('aborted', () => reject(new Error('시세 응답이 중단되었습니다.')));
        res.on('end', () => resolve(data));
      }
    );

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`요청 시간 초과: ${url}`));
    });
  });
}

/**
 * 1. 네이버 증권 fchart 일봉 전수 히스토리 조회 (상장 첫날 캔들)
 */
async function fetchFromFchart(code: string, listingDate?: string, fetcher: PriceFetcher = httpsGet): Promise<CrawledStockPrice | null> {
  try {
    const url = `https://fchart.stock.naver.com/sise.nhn?symbol=${code}&timeframe=day&count=1000&requestType=0`;
    const xml = await fetcher(url);
    const items = [...xml.matchAll(/<item data="([^"]+)"/g)];
    const itemMatch = listingDate ? items.find((item) => item[1].split('|')[0] === listingDate.replace(/-/g, '')) : items[0];
    if (itemMatch && itemMatch[1]) {
      const parts = itemMatch[1].split('|');
      const dateStr = parts[0]; // YYYYMMDD
      const open = parseInt(parts[1], 10);
      const close = parseInt(parts[4], 10);
      if (open > 0 && close > 0) {
        return {
          code,
          tradeDate: `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`,
          openingPrice: open,
          closingPrice: close,
          source: 'fchart_origin',
        };
      }
    }
  } catch (err) {
    console.warn(`[StockPriceCrawler] fchart 조회 실패 (${code}):`, err instanceof Error ? err.message : err);
  }
  return null;
}

/**
 * 2. 네이버페이 증권 공식 실시간 폴링 API 조회 (상장 당일 실시간 시초가·종가)
 */
async function fetchFromRealtimePolling(code: string, listingDate?: string, fetcher: PriceFetcher = httpsGet): Promise<CrawledStockPrice | null> {
  try {
    const url = `https://polling.finance.naver.com/api/realtime/domestic/stock/${code}`;
    const jsonStr = await fetcher(url);
    const parsed = JSON.parse(jsonStr);
    const item = parsed?.datas?.[0];
    if (item) {
      const open = parseInt(String(item.openPriceRaw || item.openPrice).replace(/[^0-9]/g, ''), 10);
      const close = parseInt(String(item.closePriceRaw || item.closePrice).replace(/[^0-9]/g, ''), 10);
      const tradeDate = item.localTradedAt ? String(item.localTradedAt).slice(0, 10) : '';

      if (item.marketStatus === 'CLOSE' && item.marketSessionType === 'regularMarket'
        && open > 0 && close > 0 && isIsoDay(tradeDate) && (!listingDate || tradeDate === listingDate)) {
        return {
          code,
          tradeDate,
          openingPrice: open,
          closingPrice: close,
          source: 'realtime_polling',
        };
      }
    }
  } catch (err) {
    console.warn(`[StockPriceCrawler] 실시간 폴링 조회 실패 (${code}):`, err instanceof Error ? err.message : err);
  }
  return null;
}

/**
 * 3. 네이버 증권 모바일 최근 거래 세션 API 조회 (최근 상장 종목 백업)
 */
async function fetchFromRecentPrices(code: string, listingDate?: string, fetcher: PriceFetcher = httpsGet): Promise<CrawledStockPrice | null> {
  try {
    const url = `https://m.stock.naver.com/api/stock/${code}/price?page=1&pageSize=20`;
    const jsonStr = await fetcher(url);
    const list = JSON.parse(jsonStr);
    if (Array.isArray(list) && list.length > 0) {
      // 상장 첫날 세션 탐색 (페이징 데이터의 마지막 세션)
      const firstSession = listingDate ? list.find((session) => String(session.localTradedAt || '').slice(0, 10) === listingDate) : list[list.length - 1];
      if (!firstSession) return null;
      const open = parseInt(String(firstSession.openPrice).replace(/[^0-9]/g, ''), 10);
      const close = parseInt(String(firstSession.closePrice).replace(/[^0-9]/g, ''), 10);
      const tradeDate = String(firstSession.localTradedAt || '').slice(0, 10);
      if (open > 0 && close > 0 && isIsoDay(tradeDate)) {
        return {
          code,
          tradeDate,
          openingPrice: open,
          closingPrice: close,
          source: 'recent_price_history',
        };
      }
    }
  } catch (err) {
    console.warn(`[StockPriceCrawler] 최근 시세 히스토리 조회 실패 (${code}):`, err instanceof Error ? err.message : err);
  }
  return null;
}

/**
 * 특정 종목 코드의 실제 거래소 체결 시세(시초가 & 종가) 크롤링
 */
export async function fetchStockListingPrices(code: string, listingDate?: string, options?: { fetcher?: PriceFetcher; expectedName?: string }): Promise<CrawledStockPrice | null> {
  if (!code || !/^[0-9A-Z]{6}$/.test(code.trim()) || code.trim() === '000000') {
    return null;
  }

  const cleanCode = code.trim();
  if (options?.expectedName) {
    const basic = JSON.parse(await (options.fetcher || httpsGet)(`https://m.stock.naver.com/api/stock/${cleanCode}/basic`));
    if (basic.stockEndType !== 'stock' || basic.itemCode !== cleanCode
      || normalizeListingCompany(basic.stockName || '') !== normalizeListingCompany(options.expectedName)) {
      throw new Error('시세 종목명·코드·주식 종류가 등록된 기업과 다릅니다. 상장성과를 저장하지 않았습니다.');
    }
  }

  // Always prefer the regular-session daily candle, including the listing day after close.
  const fchart = await fetchFromFchart(cleanCode, listingDate, options?.fetcher);
  if (fchart) return fchart;

  // fchart에 아직 반영되지 않은 신규 상장 건: 최근 거래 세션 조회
  const recent = await fetchFromRecentPrices(cleanCode, listingDate, options?.fetcher);
  if (recent) return recent;

  // 최종 실시간 폴링 재시도
  return await fetchFromRealtimePolling(cleanCode, listingDate, options?.fetcher);
}

/**
 * 상장 완료 종목들의 실전 시초가·종가 및 수익률 전수 자동 크롤링 및 동기화
 */
export async function syncListingReturnsForIpos(options?: {
  forceAll?: boolean;
  targetCode?: string;
  /** Scheduled runs must verify the listing date before freezing its first-day prices. */
  requireVerifiedListingDate?: boolean;
  now?: Date;
  fetchPrices?: (code: string, listingDate?: string) => Promise<CrawledStockPrice | null>;
}): Promise<SyncPriceResult> {
  const allIpos = getAllEffectiveIpos();
  const todayStr = getKstDateString(options?.now);
  const timeParts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hourCycle: 'h23', hour: '2-digit', minute: '2-digit' }).formatToParts(options?.now || new Date());
  const hour = Number(timeParts.find((part) => part.type === 'hour')!.value);
  const minute = Number(timeParts.find((part) => part.type === 'minute')!.value);
  const beforeFinalClose = hour * 60 + minute < 15 * 60 + 40;

  let skippedCount = 0;
  let deferredCount = 0;
  const deferredStocks: SyncPriceResult['deferredStocks'] = [];

  // 크롤링 대상 종목 필터링:
  // 1) 상장 완료(LISTED) 또는 오늘 상장일 도래 종목
  // 2) 공모 취소(isCancelled) 종목 제외
  // 3) [영구 불변 정책]: 이미 시초가와 종가가 최종 등록된 종목은 영구 불변(Frozen) 데이터로 간주하여
  //    추가 네트워크 요청, 불필요한 재크롤링, 재검증(크로스체크)을 100% 차단하고 즉시 건너뜁니다.
  const candidates = allIpos.filter((ipo) => {
    if (ipo.isCancelled) return false;
    if (options?.targetCode && ipo.code !== options.targetCode) return false;

    const isListed = ipo.status === 'LISTED' || (ipo.listingDate && todayStr >= ipo.listingDate);
    if (!isListed) return false;

    // 이미 시초가와 종가가 모두 확정 등록된 종목 여부
    const isAlreadyFinalized =
      Boolean(Number.isFinite(ipo.openingPrice) && ipo.openingPrice! > 0 && Number.isFinite(ipo.closingPrice) && ipo.closingPrice! > 0);

    // 관리자가 특정 종목 코드를 명시하여 강제 갱신을 요청한 경우가 아니라면,
    // 최종 등록 완료된 종목은 일체 다시 보거나 크롤링하지 않음!
    if (isAlreadyFinalized && (!options?.targetCode || options.targetCode !== ipo.code)) {
      skippedCount++;
      return false;
    }

    return true;
  });

  const updatedStocks: SyncPriceResult['updatedStocks'] = [];
  const errors: SyncPriceResult['errors'] = [];

  // 대기 중인 대상 종목이 없으면(모두 등록 완료 상태) 네트워크 호출 없이 0ms 즉시 반환
  if (candidates.length === 0) {
    return {
      success: true,
      totalCandidates: 0,
      updatedCount: 0,
      updatedStocks: [],
      skippedCount,
      deferredCount,
      deferredStocks,
      errors: [],
      timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    };
  }

  for (const ipo of candidates) {
    if (!isIsoDay(ipo.listingDate)) {
      skippedCount++;
      errors.push({ code: ipo.code, name: ipo.name, error: '상장일이 확인되지 않아 상장일 시세 저장을 보류했습니다.' });
      continue;
    }
    if (options?.requireVerifiedListingDate) {
      const evidence = getFieldEvidence(ipo, 'listingDate');
      if (ipo.scheduleVerification?.status === 'conflict' || ipo.scheduleVerification?.status === 'unavailable'
        || !evidence || evidence.value !== ipo.listingDate) {
        // A quote matching a registered date cannot prove that date was the listing day.
        // Wait for value-bound official evidence without querying or freezing market prices.
        skippedCount++;
        deferredCount++;
        deferredStocks.push({ code: ipo.code, name: ipo.name, reason: '공식 상장일 근거 확인 대기' });
        continue;
      }
    }
    if (ipo.listingDate === todayStr && beforeFinalClose) {
      // Intraday quotes must never become the permanently frozen listing-day close.
      skippedCount++;
      deferredCount++;
      deferredStocks.push({ code: ipo.code, name: ipo.name, reason: '상장일 정규장 마감 후 집계' });
      continue;
    }
    // 6자리 정상 코드가 없는 경우 건너뜀
    if (!ipo.code || ipo.code.length !== 6 || !ipo.confirmedPrice || ipo.confirmedPrice <= 0) {
      skippedCount++;
      deferredCount++;
      deferredStocks.push({ code: ipo.code, name: ipo.name, reason: '종목코드 또는 확정 공모가 확인 대기' });
      continue;
    }

    try {
      const priceData = await (options?.fetchPrices || ((code, date) => fetchStockListingPrices(code, date, { expectedName: ipo.name })))(ipo.code, ipo.listingDate);

      if (!priceData || priceData.code !== ipo.code || !Number.isFinite(priceData.openingPrice) || !Number.isFinite(priceData.closingPrice)
        || priceData.openingPrice <= 0 || priceData.closingPrice <= 0) {
        errors.push({
          code: ipo.code,
          name: ipo.name,
          error: '상장일과 날짜가 일치하는 시세를 받지 못했습니다. 기존 상장성과를 유지합니다.',
        });
        continue;
      }

      if (priceData.tradeDate !== ipo.listingDate) {
        skippedCount++;
        errors.push({ code: ipo.code, name: ipo.name, error: `시세 거래일(${priceData.tradeDate})이 상장일(${ipo.listingDate})과 달라 기존 상장성과를 유지합니다.` });
        continue;
      }

      // 수익률 정밀 계산 (소수점 1자리)
      const confirmed = ipo.confirmedPrice;
      const openRate = Number((((priceData.openingPrice - confirmed) / confirmed) * 100).toFixed(1));
      const closeRate = Number((((priceData.closingPrice - confirmed) / confirmed) * 100).toFixed(1));

      const updatedIpo: IpoItem = {
        ...ipo,
        status: 'LISTED',
        openingPrice: priceData.openingPrice,
        openingReturnRate: openRate,
        closingPrice: priceData.closingPrice,
        closingReturnRate: closeRate,
        listingPriceEvidence: { code: ipo.code, tradeDate: priceData.tradeDate, source: priceData.source,
          sourceUrl: priceData.source === 'fchart_origin'
            ? `https://fchart.stock.naver.com/sise.nhn?symbol=${ipo.code}&timeframe=day&count=1000&requestType=0`
            : priceData.source === 'recent_price_history' ? `https://m.stock.naver.com/api/stock/${ipo.code}/price?page=1&pageSize=20`
              : `https://polling.finance.naver.com/api/realtime/domestic/stock/${ipo.code}`,
          checkedAt: (options?.now || new Date()).toISOString() },
      };

      // AI 요약 헤드라인 자동 갱신
      if (updatedIpo.aiSummary) {
        const signOpen = openRate > 0 ? `+${openRate}%` : `${openRate}%`;
        const signClose = closeRate > 0 ? `+${closeRate}%` : `${closeRate}%`;
        updatedIpo.aiSummary.headline = `${ipo.name} 상장 완료! 시초가 ${priceData.openingPrice.toLocaleString()}원(${signOpen}), 종가 ${priceData.closingPrice.toLocaleString()}원(${signClose}) 기록`;
      }

      // 저장소 갱신
      addOrUpdateIpo(updatedIpo);

      updatedStocks.push({
        code: ipo.code,
        name: ipo.name,
        openingPrice: priceData.openingPrice,
        closingPrice: priceData.closingPrice,
        source: priceData.source,
      });

      console.log(
        `[StockPriceCrawler] ✅ '${ipo.name}'(${ipo.code}) 시세 동기화 완료: 시초가=${priceData.openingPrice}원(${openRate}%), 종가=${priceData.closingPrice}원(${closeRate}%) [출처: ${priceData.source}]`
      );
    } catch (err) {
      errors.push({
        code: ipo.code,
        name: ipo.name,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return {
    success: errors.length === 0,
    totalCandidates: candidates.length,
    updatedCount: updatedStocks.length,
    updatedStocks,
    skippedCount,
    deferredCount,
    deferredStocks,
    errors,
    timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
  };
}
