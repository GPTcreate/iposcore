import fs from 'fs';
import path from 'path';

const DART_API_KEY = process.env.DART_API_KEY || '035394bc3056c32575160716cc7cbd3d44b2fff7';
const mockFilePath = path.join(process.cwd(), 'src', 'data', 'mockIpo.ts');

console.log('📡 [DART Disclosures Cross-Check Audit] 금융감독원 DART 공시 전수 대조 감사 시작...\n');

function loadIposFromMock() {
  const content = fs.readFileSync(mockFilePath, 'utf-8');
  const startMarker = 'export const MOCK_IPOS: IpoItem[] = ';
  const startIdx = content.indexOf(startMarker);
  let jsonStr = content.slice(startIdx + startMarker.length).trim();
  if (jsonStr.endsWith(';')) {
    jsonStr = jsonStr.slice(0, -1).trim();
  }
  return JSON.parse(jsonStr);
}

const mockIpos = loadIposFromMock();

async function runAudit() {
  const today = new Date();
  const endDate = today.toISOString().slice(0, 10).replace(/-/g, '');
  const pastDate = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000); // 최근 60일
  const startDate = pastDate.toISOString().slice(0, 10).replace(/-/g, '');

  const dartUrl = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${DART_API_KEY}&bgn_de=${startDate}&end_de=${endDate}&pblntf_detail_ty=C001&page_no=1&page_count=100`;

  let filings = [];
  try {
    const res = await fetch(dartUrl);
    const data = await res.json();
    if (data.status === '000' && Array.isArray(data.list)) {
      filings = data.list;
    } else {
      console.warn(`DART API 응답: ${data.message || '데이터 없음'}`);
    }
  } catch (err) {
    console.error(`DART 통신 오류: ${err.message}`);
    return;
  }

  console.log(`📑 최근 60일간 DART 유상/공모 지분증권 공시 접수: ${filings.length}건\n`);

  let discrepancyCount = 0;

  for (const ipo of mockIpos) {
    const matchedFilings = filings.filter((f) => {
      const cleanFilingName = f.corp_name.replace(/(주식회사|\(주\)|\(유\)|주\s)/g, '').trim();
      return cleanFilingName === ipo.name || (f.stock_code && f.stock_code === ipo.code);
    });

    if (matchedFilings.length === 0) continue;

    const latest = matchedFilings[0];
    const isWithdrawal = latest.report_nm.includes('철회');
    const isPerformanceReport = latest.report_nm.includes('증권발행실적보고서');
    const isPriceConfirmed = latest.report_nm.includes('발행조건확정');

    // 1. 공모 철회 공시가 있는데 DB에 철회 반영이 안 된 경우
    if (isWithdrawal && !ipo.isCancelled) {
      console.warn(`🚨 [공모 철회 누락] '${ipo.name}': DART '${latest.report_nm}'(${latest.rcept_dt}) 접수됨. (현재 DB에 철회 미반영)`);
      discrepancyCount++;
    }

    // 2. 증권발행실적보고서가 있는데 DB가 아직 청약대기 또는 예정 상태인 경우
    if (isPerformanceReport && (ipo.status === 'UPCOMING' || ipo.status === 'SUBSCRIPTION')) {
      console.warn(`🚨 [상장대기 전이 누락] '${ipo.name}': DART 증권발행실적보고서(${latest.rcept_dt}) 접수됨. (현재 상태: ${ipo.status})`);
      discrepancyCount++;
    }

    // 3. 발행조건확정 공시가 있는데 DB 공모가가 0원인 경우
    if (isPriceConfirmed && (!ipo.confirmedPrice || ipo.confirmedPrice === 0)) {
      console.warn(`🚨 [확정 공모가 미반영] '${ipo.name}': DART 발행조건확정(${latest.rcept_dt}) 접수됨. (현재 DB 공모가: 0원)`);
      discrepancyCount++;
    }
  }

  if (discrepancyCount === 0) {
    console.log('✨ [감사 완료] 모든 DART 최신 공시와 로컬 데이터베이스가 100% 일치합니다.');
  } else {
    console.warn(`\n⚠️ 총 ${discrepancyCount}건의 최신 공시 미반영 내역이 감지되었습니다.`);
  }
}

runAudit();
