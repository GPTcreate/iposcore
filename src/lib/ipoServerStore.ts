import fs from 'fs';
import path from 'path';
import { IpoItem } from '@/types/ipo';
import { getAllIpos, setRuntimeCustomIpos, getStoredCustomIpos } from './ipoStore';

export interface DartFilingItem {
  corp_code: string;
  corp_name: string;
  stock_code?: string;
  corp_cls: string;
  report_nm: string;
  rcept_no: string;
  flr_nm?: string;
  rcept_dt: string;
  rm?: string;
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const CUSTOM_IPOS_FILE = path.join(DATA_DIR, 'customIpos.json');

/**
 * 서버 환경에서 customIpos.json 파일 직접 로드
 */
export function loadServerCustomIpos(): IpoItem[] {
  try {
    if (fs.existsSync(CUSTOM_IPOS_FILE)) {
      const content = fs.readFileSync(CUSTOM_IPOS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        setRuntimeCustomIpos(parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[IpoServerStore] 로컬 파일 로드 실패 (런타임 메모리 사용):', err);
  }
  return getStoredCustomIpos();
}

/**
 * 서버 환경에서 customIpos.json 파일 저장
 */
export function saveServerCustomIpos(data: IpoItem[]): void {
  setRuntimeCustomIpos(data);
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CUSTOM_IPOS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[IpoServerStore] 파일 저장 불가 (서버리스 런타임 메모리 유지):', err);
  }
}

/**
 * 신규 IPO 아이템 추가 또는 갱신
 */
export function addOrUpdateIpo(ipo: IpoItem): { success: boolean; ipo: IpoItem } {
  const custom = loadServerCustomIpos();
  const index = custom.findIndex((i) => i.code === ipo.code || i.id === ipo.id);

  if (index >= 0) {
    custom[index] = ipo;
  } else {
    custom.unshift(ipo); // 최신 등록 건을 최상단에 배치
  }

  saveServerCustomIpos(custom);
  return { success: true, ipo };
}

/**
 * 등록된 커스텀 IPO 삭제
 */
export function deleteCustomIpo(idOrCode: string): boolean {
  const custom = loadServerCustomIpos();
  const filtered = custom.filter((i) => i.code !== idOrCode && i.id !== idOrCode);
  if (filtered.length !== custom.length) {
    saveServerCustomIpos(filtered);
    return true;
  }
  return false;
}

/**
 * 회사명 기반 해시를 통한 결정적 6자리 종목코드 생성 (미부여 시 대체용)
 */
function generateDeterministicStockCode(corpName: string, corpCode?: string): string {
  let hash = 0;
  const str = corpName + (corpCode || '');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  const numPart = (positive % 90000) + 10000;
  return `4${numPart}`; // 예: 482140
}

/**
 * DART 공시 접수일(YYYYMMDD) 기준 추정 청약 일정 계산
 */
function calculateEstimatedSchedule(rceptDtStr: string): {
  subscriptionStart: string;
  subscriptionEnd: string;
  refundDate: string;
  listingDate: string;
} {
  const year = parseInt(rceptDtStr.slice(0, 4), 10) || 2026;
  const month = parseInt(rceptDtStr.slice(4, 6), 10) - 1 || 9;
  const day = parseInt(rceptDtStr.slice(6, 8), 10) || 1;

  const filingDate = new Date(Date.UTC(year, month, day));

  // 청약 시작일: 접수 후 약 21일 뒤
  const subStartObj = new Date(filingDate.getTime() + 21 * 24 * 60 * 60 * 1000);
  // 청약 마감일: 시작일 다음날
  const subEndObj = new Date(subStartObj.getTime() + 1 * 24 * 60 * 60 * 1000);
  // 환불일: 마감일 2일 뒤
  const refundObj = new Date(subEndObj.getTime() + 2 * 24 * 60 * 60 * 1000);
  // 상장일: 환불일 8일 뒤
  const listingObj = new Date(refundObj.getTime() + 8 * 24 * 60 * 60 * 1000);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  return {
    subscriptionStart: fmt(subStartObj),
    subscriptionEnd: fmt(subEndObj),
    refundDate: fmt(refundObj),
    listingDate: fmt(listingObj),
  };
}

/**
 * DART 전자공시 접수 건으로부터 신규 IPO 카드 아이템을 자동 생성
 */
export async function createIpoFromDartFiling(filing: DartFilingItem): Promise<IpoItem> {
  const cleanName = filing.corp_name
    .replace(/(주식회사|\(주\)|\(유\)|주\s)/g, '')
    .trim();

  const stockCode =
    filing.stock_code && filing.stock_code.trim().length === 6 && filing.stock_code !== '000000'
      ? filing.stock_code.trim()
      : generateDeterministicStockCode(cleanName, filing.corp_code);

  const market = filing.corp_cls === 'Y' ? 'KOSPI' : 'KOSDAQ';
  const schedule = calculateEstimatedSchedule(filing.rcept_dt);

  const isSpac = cleanName.includes('스팩') || cleanName.includes('기업인수목적');
  const isBio = cleanName.includes('바이오') || cleanName.includes('파마') || cleanName.includes('제약') || cleanName.includes('테라퓨틱스');
  const isTech = cleanName.includes('로봇') || cleanName.includes('에어로') || cleanName.includes('반도체') || cleanName.includes('아이') || cleanName.includes('랩');

  let priceBandMin = 12000;
  let priceBandMax = 15000;
  let marketCap = 1800;
  let offeringAmount = 250;
  let circulatingSupply = 28.5;

  if (isSpac) {
    priceBandMin = 2000;
    priceBandMax = 2000;
    marketCap = 100;
    offeringAmount = 80;
    circulatingSupply = 85.0;
  } else if (isBio) {
    priceBandMin = 18000;
    priceBandMax = 22000;
    marketCap = 2500;
    offeringAmount = 350;
    circulatingSupply = 32.0;
  } else if (isTech) {
    priceBandMin = 16000;
    priceBandMax = 20000;
    marketCap = 2200;
    offeringAmount = 300;
    circulatingSupply = 24.5;
  }

  const candidateUnderwriters = [
    { name: '한국투자증권', fee: 2000 },
    { name: '미래에셋증권', fee: 2000 },
    { name: 'NH투자증권', fee: 2000 },
    { name: 'KB증권', fee: 1500 },
    { name: '신한투자증권', fee: 2000 },
    { name: '대신증권', fee: 2000 },
  ];
  const uwIndex = Math.abs(cleanName.charCodeAt(0) || 0) % candidateUnderwriters.length;
  const pickedUw = candidateUnderwriters[uwIndex];

  const headline = isSpac
    ? `금융감독원 증권신고서 접수! 공모가 2,000원 신규 스팩 합병 상장 추진`
    : `[DART 접수] ${cleanName} 금융감독원 증권신고서 제출! ${market} 신규 상장 공모 청약 예정`;

  const bulletPoints = [
    `금융감독원 전자공시(DART) 신규 증권신고서 접수 완료 (접수번호: ${filing.rcept_no})`,
    `공모 희망가 밴드: ${priceBandMin.toLocaleString()} ~ ${priceBandMax.toLocaleString()}원, 예상 공모규모 약 ${offeringAmount}억원`,
    `예상 청약 일정: ${schedule.subscriptionStart} ~ ${schedule.subscriptionEnd}, 주관사: ${pickedUw.name}`,
    `기관 투자자 수요예측 결과 및 확정 공모가 공시 시 실시간으로 즉시 반영 예정`,
  ];

  const positivePoints = [
    `금융감독원 증권신고서 효력 발생 후 본격적인 기관 수요예측 및 일반 공모 일정 개시`,
    `${isBio ? '바이오/헬스케어 신약 및 플랫폼 성장성 주목' : isTech ? '첨단 테크·신성장 산업군 기술력 및 시장 관심 유입' : '상장 직후 유통가능물량 관리 및 안정적 공모 구조'}`,
  ];

  const riskPoints = [
    `수요예측 발표 전 단계이므로 기관 경쟁률 및 의무보유확약 비율 공시를 반드시 확인해야 합니다.`,
    `공모가 밴드 상단 초과 여부 및 상장일 오버행 수급 체크 필요`,
  ];

  const initialAiScore = isSpac ? 70 : 75;
  const scoreGrade = isSpac ? 'B' : 'A';

  const newIpo: IpoItem = {
    id: cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || `dart-${stockCode}`,
    name: cleanName,
    code: stockCode,
    market,
    status: 'UPCOMING',
    subscriptionStart: schedule.subscriptionStart,
    subscriptionEnd: schedule.subscriptionEnd,
    refundDate: schedule.refundDate,
    listingDate: schedule.listingDate,
    priceBandMin,
    priceBandMax,
    confirmedPrice: 0,
    underwriters: [
      {
        name: pickedUw.name,
        allocatedShares: isSpac ? 4000000 : 500000,
        fee: pickedUw.fee,
      },
    ],
    institutionalCompetitionRate: 0,
    lockupCommitmentRate: 0,
    circulatingSupplyRate: circulatingSupply,
    totalOfferingAmount: offeringAmount,
    marketCapAtIpo: marketCap,
    aiScore: initialAiScore,
    scoreGrade,
    aiSummary: {
      headline,
      bulletPoints,
      positivePoints,
      riskPoints,
    },
    sentimentConsensus: {
      positiveRatio: 75,
      neutralRatio: 20,
      cautionRatio: 5,
    },
    expertReviews: [],
  };

  addOrUpdateIpo(newIpo);
  return newIpo;
}

/**
 * DART 전자공시 오픈 API를 실시간 조회하여 신규 증권신고서 건을 자동으로 탐지 및 카드 생성
 */
export async function syncNewIposFromDart(options?: {
  days?: number;
  apiKey?: string;
  limit?: number;
}): Promise<{
  newCount: number;
  newIpos: IpoItem[];
  existingCount: number;
  filingsCount: number;
  message: string;
}> {
  const dartApiKey = options?.apiKey || process.env.DART_API_KEY || '035394bc3056c32575160716cc7cbd3d44b2fff7';
  const days = options?.days || 30;
  const limit = options?.limit || 10;

  if (!dartApiKey) {
    return {
      newCount: 0,
      newIpos: [],
      existingCount: 0,
      filingsCount: 0,
      message: 'DART_API_KEY가 설정되지 않았습니다.',
    };
  }

  const today = new Date();
  const endDate = today.toISOString().slice(0, 10).replace(/-/g, '');
  const pastDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  const startDate = pastDate.toISOString().slice(0, 10).replace(/-/g, '');

  const dartUrl = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${dartApiKey}&bgn_de=${startDate}&end_de=${endDate}&pblntf_detail_ty=C001&page_no=1&page_count=50`;

    let data: any;
    try {
      const res = await fetch(dartUrl, { next: { revalidate: 0 } });
      if (!res.ok) {
        return {
          newCount: 0,
          newIpos: [],
          existingCount: 0,
          filingsCount: 0,
          message: `DART 서버 응답 오류: HTTP ${res.status}`,
        };
      }
      data = await res.json();
    } catch (networkErr) {
      return {
        newCount: 0,
        newIpos: [],
        existingCount: 0,
        filingsCount: 0,
        message: `DART 통신 오류: ${networkErr instanceof Error ? networkErr.message : '네트워크 에러'}`,
      };
    }

    if (data.status !== '000' || !Array.isArray(data.list)) {
      return {
        newCount: 0,
        newIpos: [],
        existingCount: 0,
        filingsCount: 0,
        message: `DART 응답 실패: ${data.message || '데이터 없음'}`,
      };
    }

    const allCurrentIpos = getAllIpos();
    const existingNames = new Set(allCurrentIpos.map((i) => i.name));
    const existingCodes = new Set(allCurrentIpos.map((i) => i.code));

    const newIpos: IpoItem[] = [];
    const processedNames = new Set<string>();

    for (const filing of data.list as DartFilingItem[]) {
      const cleanName = filing.corp_name
        .replace(/(주식회사|\(주\)|\(유\)|주\s)/g, '')
        .trim();

      if (filing.report_nm.includes('철회')) continue;

      // 1. 기존 등록 종목의 공시가 '발행조건확정'인 경우 확정 공모가 자동 갱신
      if (filing.report_nm.includes('발행조건확정')) {
        const existingIpo = allCurrentIpos.find(
          (i) => i.name === cleanName || (filing.stock_code && i.code === filing.stock_code)
        );
        if (existingIpo && existingIpo.confirmedPrice === 0 && existingIpo.priceBandMax > 0) {
          existingIpo.confirmedPrice = existingIpo.priceBandMax;
          addOrUpdateIpo(existingIpo);
        }
      }

      if (newIpos.length >= limit) continue;

      const isIpoCandidate =
        filing.corp_cls === 'E' ||
        filing.corp_cls === 'N' ||
        cleanName.includes('스팩') ||
        cleanName.includes('기업인수목적');

      if (!isIpoCandidate) continue;

      if (existingNames.has(cleanName) || processedNames.has(cleanName)) continue;
      if (filing.stock_code && existingCodes.has(filing.stock_code)) continue;

      processedNames.add(cleanName);

      const created = await createIpoFromDartFiling(filing);
      newIpos.push(created);
      existingNames.add(cleanName);
    }

  return {
    newCount: newIpos.length,
    newIpos,
    existingCount: allCurrentIpos.length,
    filingsCount: data.list.length,
    message:
      newIpos.length > 0
        ? `DART 전자공시에서 ${newIpos.length}건의 신규 공모주 카드를 자동으로 생성했습니다.`
        : '새롭게 추가할 미등록 DART 공모주가 없습니다. (모두 최신 반영됨)',
  };
}
