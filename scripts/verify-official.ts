import fs from 'node:fs';
import path from 'node:path';
import { loadDiscoverySource, writeDiscoveredIpos } from './sync-ipo-discovery';
import { emptyVerificationArchive, validateVerificationArchive, verifyOfficialSchedules } from '../src/lib/officialVerification';
import { isSameIpoIdentity } from '../src/lib/ipoDiscovery';

export function parseOfficialArguments(args: string[]) {
  const stocks: string[] = [], flags = new Set<string>();
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === '--stock') {
      const id = args[++index];
      if (!id || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(id) || stocks.includes(id)) throw new Error('--stock에 중복되지 않은 정확한 종목 ID를 입력하세요.');
      stocks.push(id);
    } else if (!['--write', '--dry-run', '--help'].includes(argument) || flags.has(argument)) throw new Error('지원하지 않거나 중복된 옵션입니다.');
    else flags.add(argument);
  }
  if (flags.has('--write') && flags.has('--dry-run')) throw new Error('--write와 --dry-run을 함께 사용할 수 없습니다.');
  return { stocks, write: flags.has('--write'), help: flags.has('--help') };
}
export async function main(args = process.argv.slice(2)): Promise<void> {
  const options = parseOfficialArguments(args);
  if (options.help) {
    console.log('Usage: npm run verify:official -- [--dry-run | --write] [--stock exact-id ...]\nBounded official schedule checks. Default preview; --write updates customIpos.json and .cache/official-verification.json. --stock selects only the given IDs and preserves other records/cache. No publishing or messages.'); return;
  }
  if (process.env.VERCEL) throw new Error('공식 검증 저장은 저장소 워크플로에서 실행하세요.');
  const root = process.cwd(), source = loadDiscoverySource(root);
  const statePath = path.join(root, '.cache', 'official-verification.json');
  if (fs.existsSync(statePath) && fs.statSync(statePath).size > 5_000_000) throw new Error('공식 검증 이력 크기 제한을 초과했습니다.');
  const archive = fs.existsSync(statePath) ? validateVerificationArchive(JSON.parse(fs.readFileSync(statePath, 'utf8'))) : emptyVerificationArchive();
  if (options.stocks.some(id => !source.combined.some(ipo => ipo.id === id))) throw new Error('등록되지 않은 종목 ID입니다. 조회를 실행하지 않았습니다.');
  const selected = options.stocks.length ? source.combined.filter(ipo => options.stocks.includes(ipo.id)) : source.combined;
  const result = await verifyOfficialSchedules(selected, archive);
  if (options.write) {
    const custom = structuredClone(source.custom);
    for (const ipo of result.ipos) {
      const previous = source.combined.find(item => item.id === ipo.id);
      if (JSON.stringify(previous) === JSON.stringify(ipo)) continue;
      const index = custom.findIndex(item => isSameIpoIdentity(item, ipo));
      if (index >= 0) custom[index] = ipo; else custom.push(ipo);
    }
    if (JSON.stringify(custom) !== JSON.stringify(source.custom)) writeDiscoveredIpos(path.join(root, 'src', 'data', 'customIpos.json'), custom);
    fs.mkdirSync(path.dirname(statePath), { recursive: true });
    const content = `${JSON.stringify(result.archive, null, 2)}\n`, temporary = `${statePath}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, content, { flag: 'wx' });
    fs.renameSync(temporary, statePath);
    if (fs.readFileSync(statePath, 'utf8') !== content) throw new Error('검증 이력 저장 확인 실패');
  }
  const summary = { checkedCount: result.checkedCount, skippedCount: result.skippedCount, requestCount: result.requestCount,
    changes: result.changes, newNotices: result.notices, errorCount: result.errorCount, coverage: result.coverage,
    storageStatus: options.write ? 'local-file-checked' : 'preview-only', deploymentConfirmed: false };
  console.log(JSON.stringify(summary, null, 2));
  if (process.env.GITHUB_STEP_SUMMARY) {
    const clean = (value: string) => value.replace(/[|\r\n<>]/g, ' ');
    const lines = ['## 공식 일정 검증', '', `확인 ${result.checkedCount} · 조회 ${result.requestCount}/30 · 생략 ${result.skippedCount} · 오류 ${result.errorCount}`,
      '미지원·누락은 partial, 조회 실패는 unavailable로 기록합니다. 전체 일치나 발행 가능을 뜻하지 않습니다.', ''];
    for (const change of result.changes) lines.push(`- ${clean(change.name)}: ${change.fields.join(', ')} 변경`);
    for (const notice of result.notices) lines.push(`- ${clean(notice.id)}: ${notice.status} ${notice.conflicts.join(', ')}`);
    if (!result.changes.length && !result.notices.length) lines.push('새 변경·충돌 알림 없음.');
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
  }
  // Persist partial evidence and retry state, but never turn a fetch/parse failure into a successful check.
  if (result.errorCount || result.coverage.some(item => item.status === 'conflict')) process.exitCode = 1;
}
if (require.main === module) main().catch(() => {
  console.error('공식 일정 검증을 완료하지 못했습니다. 기존 근거와 실행 이력을 확인하세요.'); process.exitCode = 1;
});
