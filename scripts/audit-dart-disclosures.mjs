import fs from 'fs';
import path from 'path';

const DART_API_KEY = process.env.DART_API_KEY?.trim();
if (!DART_API_KEY) { console.error('DART_API_KEY is required. No request was sent.'); process.exit(1); }
const mockFilePath = path.join(process.cwd(), 'src', 'data', 'mockIpo.ts');
const customFilePath = path.join(process.cwd(), 'src', 'data', 'customIpos.json');

console.log('📡 [DART Disclosures Cross-Check Audit] 금융감독원 DART 공시 전수 대조 감사 시작...\n');

function loadMergedIpos() {
  const content = fs.readFileSync(mockFilePath, 'utf-8');
  const startMarker = 'export const MOCK_IPOS: IpoItem[] = ';
  const startIdx = content.indexOf(startMarker);
  let jsonStr = content.slice(startIdx + startMarker.length).trim();
  if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1).trim();
  const mockIpos = JSON.parse(jsonStr);

  const customIpos = fs.existsSync(customFilePath)
    ? JSON.parse(fs.readFileSync(customFilePath, 'utf8'))
    : [];

  const map = new Map(mockIpos.map(i => [i.id, i]));
  for (const i of customIpos) map.set(i.id, i);
  return [...map.values()];
}

const allIpos = loadMergedIpos();

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
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(today);

  for (const ipo of allIpos) {
    const matchedFilings = filings.filter((f) => {
      const cleanFilingName = f.corp_name.replace(/(주식회사|\(주\)|\(유\)|주\s)/g, '').trim();
      return cleanFilingName === ipo.name || (f.stock_code && f.stock_code === ipo.code);
    });

    if (matchedFilings.length === 0) {
      // DART 매칭과 무관하게 청약 시작일이 도래했는데 공모가가 0원인 경우 체크
      if (!ipo.isCancelled && ipo.subscriptionStart && ipo.subscriptionStart <= todayStr && (!ipo.confirmedPrice || ipo.confirmedPrice <= 0)) {
        console.warn(`🚨 [공모가 미확정 상태 청약 도래] '${ipo.name}': 청약 시작일(${ipo.subscriptionStart})이 도래했으나 확정 공모가가 0원입니다. 일정 연기 여부를 점검하십시오.`);
        discrepancyCount++;
      }
      continue;
    }

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

    // 4. 기재정정 공시가 접수되었는데 접수번호가 DB의 discovery.receiptNo보다 최신인 경우
    if (latest.report_nm.includes('기재정정') && ipo.discovery?.receiptNo && latest.rcept_no > ipo.discovery.receiptNo) {
      console.warn(`⚠️ [정정공시 발생 (일정/조건 변경 가능성)] '${ipo.name}': 최신 정정공시(${latest.report_nm}, ${latest.rcept_dt}) 접수됨. (현재 기록: ${ipo.discovery.receiptNo})`);
      discrepancyCount++;
    }

    // 5. 청약 시작일이 도래했으나 확정 공모가가 0원인 경우
    if (!ipo.isCancelled && ipo.subscriptionStart && ipo.subscriptionStart <= todayStr && (!ipo.confirmedPrice || ipo.confirmedPrice <= 0)) {
      console.warn(`🚨 [공모가 미확정 상태 청약 도래] '${ipo.name}': 청약 시작일(${ipo.subscriptionStart})이 도래했으나 확정 공모가가 0원입니다. 일정 연기 여부를 점검하십시오.`);
      discrepancyCount++;
    }
  }

  if (discrepancyCount === 0) {
    console.log('✨ [감사 완료] 조회 범위의 공시 접수정보에서 새 차이를 찾지 못했습니다. 원문 항목 검증 완료를 뜻하지 않습니다.');
  } else {
    console.warn(`\n⚠️ 총 ${discrepancyCount}건의 최신 공시 미반영 내역이 감지되었습니다.`);
  }
}

runAudit();
