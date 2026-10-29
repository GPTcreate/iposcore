import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const mockFilePath = path.join(process.cwd(), 'src', 'data', 'mockIpo.ts');
const customFilePath = path.join(process.cwd(), 'src', 'data', 'customIpos.json');

console.log('🔍 [IPO Data Integrity Validator] 공모주 데이터 정합성 검증 시작...\n');

let hasErrors = false;

function loadIposFromMock() {
  const content = fs.readFileSync(mockFilePath, 'utf-8');
  const startMarker = 'export const MOCK_IPOS: IpoItem[] = ';
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) {
    throw new Error('mockIpo.ts에서 MOCK_IPOS 정의를 찾을 수 없습니다.');
  }
  let jsonStr = content.slice(startIdx + startMarker.length).trim();
  if (jsonStr.endsWith(';')) {
    jsonStr = jsonStr.slice(0, -1).trim();
  }
  return JSON.parse(jsonStr);
}

function loadCustomIpos() {
  if (fs.existsSync(customFilePath)) {
    const parsed = JSON.parse(fs.readFileSync(customFilePath, 'utf-8'));
    if (!Array.isArray(parsed)) throw new Error('customIpos.json은 종목 배열이어야 합니다.');
    return parsed;
  }
  return [];
}

const mockIpos = loadIposFromMock();
const customIpos = loadCustomIpos();
// Custom records are updates to existing IDs, or new accumulated discoveries.
const merged = new Map(mockIpos.map(ipo => [ipo.id, ipo]));
for (const ipo of customIpos) merged.set(ipo.id, ipo);
const allIpos = [...merged.values()];

console.log(`📊 검증 대상: 총 ${allIpos.length}개 종목 (기본 ${mockIpos.length}개, 커스텀 ${customIpos.length}개)\n`);

// 1. 종목코드 및 ID 중복 검사
const seenIds = new Map();
const seenCodes = new Map();

for (const ipo of allIpos) {
  if (seenIds.has(ipo.id)) {
    console.error(`❌ [중복 ID] ID '${ipo.id}'가 '${seenIds.get(ipo.id)}'와 '${ipo.name}'에서 중복 사용되었습니다.`);
    hasErrors = true;
  } else {
    seenIds.set(ipo.id, ipo.name);
  }

  if (ipo.code && seenCodes.has(ipo.code)) {
    console.error(`❌ [중복 종목코드] 코드 '${ipo.code}'가 '${seenCodes.get(ipo.code)}'와 '${ipo.name}'에서 중복 사용되었습니다.`);
    hasErrors = true;
  } else if (ipo.code) {
    seenCodes.set(ipo.code, ipo.name);
  }
}

// 2. 종목별 필드 정합성 및 생명주기 검증
for (const ipo of allIpos) {
  const isWaitingOrListed = ipo.status === 'WAITING_LISTING' || ipo.status === 'LISTED';
  const isCancelled = Boolean(ipo.isCancelled);

  // 상장대기 또는 상장완료 종목 검증
  if (isWaitingOrListed && !isCancelled) {
    if (!ipo.confirmedPrice || ipo.confirmedPrice <= 0) {
      console.error(`❌ [공모가 누락] '${ipo.name}'(${ipo.code})의 상태가 '${ipo.status}'이지만 확정 공모가가 0원 이하입니다.`);
      hasErrors = true;
    }
    if (!ipo.listingDate) {
      console.warn(`⚠️ [상장일 누락] '${ipo.name}'(${ipo.code})의 상태가 '${ipo.status}'이지만 상장일이 지정되지 않았습니다.`);
    }
  }

  // 일정 순서 검증 (시작 <= 마감 <= 환불 <= 상장)
  if (ipo.subscriptionStart && ipo.subscriptionEnd) {
    if (ipo.subscriptionStart > ipo.subscriptionEnd) {
      console.error(`❌ [일정 오류] '${ipo.name}'의 청약 시작일(${ipo.subscriptionStart})이 마감일(${ipo.subscriptionEnd})보다 늦습니다.`);
      hasErrors = true;
    }
  }
  if (ipo.subscriptionEnd && ipo.refundDate) {
    if (ipo.subscriptionEnd > ipo.refundDate) {
      console.error(`❌ [일정 오류] '${ipo.name}'의 청약 마감일(${ipo.subscriptionEnd})이 환불일(${ipo.refundDate})보다 늦습니다.`);
      hasErrors = true;
    }
  }
  if (ipo.refundDate && ipo.listingDate && !isCancelled) {
    if (ipo.refundDate > ipo.listingDate) {
      console.error(`❌ [일정 오류] '${ipo.name}'의 환불일(${ipo.refundDate})이 상장일(${ipo.listingDate})보다 늦습니다.`);
      hasErrors = true;
    }
  }

  // 실전 청약 결과 검증
  if (ipo.subscriptionResults) {
    const res = ipo.subscriptionResults;
    if (res.proportionalCompetitionRate !== undefined && ipo.generalCompetitionRate !== undefined) {
      if (res.proportionalCompetitionRate <= 0) {
        console.error(`❌ [비례경쟁률 오류] '${ipo.name}'의 비례경쟁률이 0 이하입니다.`);
        hasErrors = true;
      }
      // 비례 경쟁률과 일반 경쟁률이 동일하게 기재된 경우 경고 (일반적으로 비례경쟁률은 균등50/비례50 구조상 약 2배)
      if (res.proportionalCompetitionRate === ipo.generalCompetitionRate) {
        console.warn(`⚠️ [경쟁률 확인 필요] '${ipo.name}'의 일반경쟁률(${ipo.generalCompetitionRate})과 비례경쟁률(${res.proportionalCompetitionRate})이 동일합니다.`);
      }
    }
  }
}

// 3. 콘텐츠 품질 및 공시 팩트 무결성 감사 실행
try {
  execFileSync(process.execPath, [path.join(process.cwd(), 'scripts', 'audit-content-integrity.mjs')], { stdio: 'inherit' });
} catch (e) {
  hasErrors = true;
}

if (hasErrors) {
  console.error('\n🚨 공모주 데이터 정합성 검증 실패! 위 오류를 수정한 후 다시 빌드하십시오.\n');
  process.exit(1);
} else {
  console.log('✅ [검증 완료] 모든 공모주 데이터(코드 고유성, 공모가, 일정 순서, 경쟁률 구조)가 정상입니다.\n');
}
