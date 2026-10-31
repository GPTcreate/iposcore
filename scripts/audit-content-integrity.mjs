import fs from 'fs';
import path from 'path';

console.log('🛡️  [Content Integrity Audit] 콘텐츠 품질 및 공시 팩트 정합성 감사 시작...\n');

const customPath = path.join(process.cwd(), 'src', 'data', 'customIpos.json');
const mockPath = path.join(process.cwd(), 'src', 'data', 'mockIpo.ts');

function loadCustomIpos() {
  if (fs.existsSync(customPath)) {
    return JSON.parse(fs.readFileSync(customPath, 'utf8'));
  }
  return [];
}

function loadMockIpos() {
  const content = fs.readFileSync(mockPath, 'utf8');
  const marker = 'export const MOCK_IPOS: IpoItem[] = ';
  const idx = content.indexOf(marker);
  if (idx === -1) throw new Error('mockIpo.ts marker not found');
  let jsonStr = content.slice(idx + marker.length).trim();
  if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1).trim();
  return JSON.parse(jsonStr);
}

const customIpos = loadCustomIpos();
const mockIpos = loadMockIpos();

let auditFailures = 0;

function reportError(source, ipoName, message) {
  console.error(`❌ [${source} / ${ipoName}] ${message}`);
  auditFailures++;
}

// 1. 금지된 미검증 보일러플레이트 / 법적 오류 문구 검사
const FORBIDDEN_PHRASES = [
  {
    pattern: /효력\s*발생\s*완료/i,
    reason: '자본시장법상 증권신고서는 접수 후 효력발생 대기 기간(15영업일)이 소요되므로 일괄 "효력 발생 완료" 표기는 허위 정보입니다.'
  },
  {
    pattern: /우수한\s*펀더멘털/i,
    reason: 'SPAC 또는 미검증 신규 상장 종목에 근거 없는 주관적 미사여구("우수한 펀더멘털") 표기는 금지됩니다.'
  },
  {
    pattern: /안정적인\s*공모\s*구조/i,
    reason: '검증되지 않은 템플릿성 수식어("안정적인 공모 구조")는 사용할 수 없습니다.'
  }
];

function inspectForbiddenPhrases(sourceName, ipos) {
  for (const ipo of ipos) {
    const textBlob = JSON.stringify(ipo);
    for (const rule of FORBIDDEN_PHRASES) {
      if (rule.pattern.test(textBlob)) {
        reportError(sourceName, ipo.name, `금지 문구 검출 (${rule.pattern}): ${rule.reason}`);
      }
    }
  }
}

inspectForbiddenPhrases('customIpos.json', customIpos);
inspectForbiddenPhrases('mockIpo.ts', mockIpos);

// 2. 단일 진실 공급원(SSOT) 정합성 검사: 텍스트 메모와 정형 데이터 간의 모순 확인
function inspectProseConsistency(sourceName, ipos) {
  for (const ipo of ipos) {
    const allProse = [
      ipo.aiSummary?.headline || '',
      ...(ipo.aiSummary?.bulletPoints || []),
      ...(ipo.aiSummary?.positivePoints || []),
      ...(ipo.aiSummary?.riskPoints || [])
    ].join(' ');

    // 유통가능비율 일치 여부 확인 (텍스트에 유통비율 XX%가 언급된 경우)
    const floatMatch = allProse.match(/유통가능(?:비율|물량)?\s*[:：]?\s*([\d.]+)%/);
    if (floatMatch && ipo.circulatingSupplyRate !== undefined) {
      const statedFloat = parseFloat(floatMatch[1]);
      if (Math.abs(statedFloat - ipo.circulatingSupplyRate) > 0.05) {
        reportError(sourceName, ipo.name, `유통가능비율 불일치: 텍스트(${statedFloat}%) vs 정형 데이터(${ipo.circulatingSupplyRate}%)`);
      }
    }

    // 주관사 일치 여부 확인 (텍스트에 '주관사: OOO'가 언급된 경우)
    const underwriterMatch = allProse.match(/(?:대표\s*)?주관사\s*[:：]\s*([가-힣A-Za-z0-9]+(?:증권|투자증권)?)/);
    if (underwriterMatch && ipo.underwriters && ipo.underwriters.length > 0) {
      const mentionedUnderwriter = underwriterMatch[1].replace(/(?:투자)?증권$/, '');
      const hasMatch = ipo.underwriters.some(u => u.name.includes(mentionedUnderwriter));
      if (!hasMatch) {
        reportError(sourceName, ipo.name, `주관사 불일치: 텍스트('${underwriterMatch[1]}') vs 정형 주관사목록(${ipo.underwriters.map(u => u.name).join(', ')})`);
      }
    }
  }
}

inspectProseConsistency('customIpos.json', customIpos);
inspectProseConsistency('mockIpo.ts', mockIpos);

// Disclosed share counts must reconcile with the final offer price; forecast amounts cannot pass silently.
function inspectOfferingAmounts(sourceName, ipos) {
  for (const ipo of ipos) {
    for (const [countField, amountField] of [['offeringShareCount', 'totalOfferingAmount'], ['listedShareCount', 'marketCapAtIpo']]) {
      const count = ipo[countField], amount = ipo[amountField];
      if (count === undefined) continue;
      if (!Number.isSafeInteger(count) || count <= 0) { reportError(sourceName, ipo.name, `${countField}는 양의 정수 주식수여야 합니다.`); continue; }
      if (ipo.confirmedPrice > 0 && amount > 0 && Math.abs(count * ipo.confirmedPrice / 100_000_000 - amount) > 0.000001) {
        reportError(sourceName, ipo.name, `${amountField}가 공시 주식수 × 확정 공모가와 다릅니다.`);
      }
    }
    for (const field of ['totalOfferingAmount', 'marketCapAtIpo', 'offeringShareCount', 'listedShareCount', 'businessDescription']) {
      const evidence = ipo.fieldEvidence?.[field];
      if (evidence?.value !== undefined && evidence.value !== ipo[field]) reportError(sourceName, ipo.name, `${field}의 원문 근거가 현재 값과 다릅니다.`);
    }
  }
}
inspectOfferingAmounts('customIpos.json', customIpos);
inspectOfferingAmounts('mockIpo.ts', mockIpos);

// 3. 엔키화이트햇 등 공식 DART 정정 공시 데이터 특수 검증
const enki = customIpos.find(i => i.id === 'enki-whitehat');
if (enki) {
  if (enki.circulatingSupplyRate !== 37.95) {
    reportError('customIpos.json', enki.name, `공시 기준 유통비율 37.95% 불일치 (현재: ${enki.circulatingSupplyRate}%)`);
  }
}

// 4. 청약 개시일 도래 종목의 공모가 확정 및 일정 유효성 감사 (Stale Schedule Guard)
// 대한민국 공모주 청약은 확정 공모가 없이 진행될 수 없으므로,
// 청약 시작일이 도래했는데 공모가가 0원이면 일정이 연기되었거나 누락된 상태임.
const todayStr = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

function inspectScheduleValidity(sourceName, ipos) {
  for (const ipo of ipos) {
    if (ipo.isCancelled) continue;
    if (ipo.subscriptionStart && ipo.subscriptionStart <= todayStr) {
      if (!ipo.confirmedPrice || ipo.confirmedPrice <= 0) {
        reportError(sourceName, ipo.name, `[일정 연기 의심 / 공모가 미확정] 청약 시작일(${ipo.subscriptionStart})이 도래했으나 확정 공모가가 0원입니다. DART 정정공시(일정 연기 또는 발행조건확정)를 확인하여 일정을 갱신해야 합니다.`);
      }
    }
  }
}

inspectScheduleValidity('customIpos.json', customIpos);
inspectScheduleValidity('mockIpo.ts', mockIpos);

if (auditFailures > 0) {
  console.error(`\n🚨 [감사 실패] 총 ${auditFailures}건의 콘텐츠 무결성 오류가 발견되었습니다. 배포가 중단됩니다.\n`);
  process.exit(1);
} else {
  console.log(`✅ [감사 통과] 총 ${customIpos.length}개 종목의 콘텐츠 무결성(금지 문구 부재, SSOT 정합성, DART 팩트 일치, 청약일정 유효성) 검증 완료.\n`);
}
