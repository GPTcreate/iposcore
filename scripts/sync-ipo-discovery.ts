import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { IpoItem } from '../src/types/ipo';
import { isSameIpoIdentity, mergeDartDiscoveries } from '../src/lib/ipoDiscovery';
import type { DartFilingItem, DartListResponse } from '../src/lib/ipoDiscovery';
import { fetchOfficialText } from '../src/lib/officialHttp';

export interface DiscoveryOptions { write: boolean; days: number; limit: number; help: boolean }

export function parseDiscoveryArguments(args: string[]): DiscoveryOptions {
  const options: DiscoveryOptions = { write: false, days: 30, limit: 1000, help: false };
  const seen = new Set<string>();
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (seen.has(argument)) throw new Error(`중복 옵션: ${argument}`);
    seen.add(argument);
    if (argument === '--write') options.write = true;
    else if (argument === '--dry-run') options.write = false;
    else if (argument === '--help') options.help = true;
    else if (argument === '--days' || argument === '--limit') {
      const value = args[++index];
      const maximum = argument === '--days' ? 90 : 1000;
      if (!value || !/^\d+$/.test(value) || Number(value) < 1 || Number(value) > maximum) throw new Error(`${argument} 값은 1~${maximum} 정수여야 합니다.`);
      if (argument === '--days') options.days = Number(value);
      else options.limit = Number(value);
    } else throw new Error(`지원하지 않는 옵션: ${argument}`);
  }
  if (seen.has('--write') && seen.has('--dry-run')) throw new Error('--write와 --dry-run은 함께 사용할 수 없습니다.');
  return options;
}

function assertIpoArray(input: unknown): asserts input is IpoItem[] {
  if (!Array.isArray(input) || input.some((ipo) => !ipo || typeof ipo.id !== 'string' || typeof ipo.name !== 'string' || typeof ipo.code !== 'string')) {
    throw new Error('종목 파일이 올바른 배열이 아닙니다. 기존 파일을 유지합니다.');
  }
}

export function loadDiscoverySource(root: string): { base: IpoItem[]; custom: IpoItem[]; combined: IpoItem[] } {
  const source = fs.readFileSync(path.join(root, 'src', 'data', 'mockIpo.ts'), 'utf8');
  const marker = 'export const MOCK_IPOS: IpoItem[] = ';
  const start = source.indexOf(marker);
  if (start < 0) throw new Error('기본 종목 데이터의 JSON 선언을 찾지 못했습니다.');
  const base: unknown = JSON.parse(source.slice(start + marker.length).trim().replace(/;$/, ''));
  const custom: unknown = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'customIpos.json'), 'utf8'));
  assertIpoArray(base);
  assertIpoArray(custom);
  const combined = structuredClone(base);
  for (const ipo of custom) {
    const index = combined.findIndex((item) => isSameIpoIdentity(item, ipo));
    if (index >= 0) combined[index] = structuredClone(ipo);
    else combined.push(structuredClone(ipo));
  }
  return { base, custom, combined };
}

export function writeDiscoveredIpos(file: string, ipos: IpoItem[]): void {
  if (process.env.VERCEL) throw new Error('Vercel 파일은 영속 저장소가 아닙니다. 저장소 수집 워크플로를 사용하세요.');
  assertIpoArray(ipos);
  const temporary = `${file}.${randomUUID()}.tmp`;
  const content = `${JSON.stringify(ipos, null, 2)}\n`;
  try {
    fs.writeFileSync(temporary, content, { encoding: 'utf8', flag: 'wx' });
    fs.renameSync(temporary, file);
    if (fs.readFileSync(file, 'utf8') !== content) throw new Error('신규 종목 파일의 저장 확인에 실패했습니다.');
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

/** No writes until every C001 page has been received successfully. Never print the request URL/key. */
export async function fetchDiscoveryFilings(apiKey: string, days: number, now = new Date(), fetcher: typeof fetch = fetch): Promise<DartFilingItem[]> {
  if (!apiKey.trim()) throw new Error('DART_API_KEY가 설정되지 않았습니다.');
  const endDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now).replace(/-/g, '');
  const startDate = new Date(`${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}T00:00:00Z`);
  startDate.setUTCDate(startDate.getUTCDate() - days);
  const filings: DartFilingItem[] = [];
  let totalPages = 1;
  for (let page = 1; page <= totalPages; page++) {
    const url = new URL('https://opendart.fss.or.kr/api/list.json');
    for (const [key, value] of Object.entries({ crtfc_key: apiKey, bgn_de: startDate.toISOString().slice(0, 10).replace(/-/g, ''), end_de: endDate,
      pblntf_detail_ty: 'C001', sort: 'date', sort_mth: 'desc', page_no: String(page), page_count: '100' })) url.searchParams.set(key, value);
    let body: string;
    try { body = (await fetchOfficialText(url, { fetcher, maxBytes: 2_000_000 })).text; }
    catch { throw new Error(`DART 공시 ${page}페이지를 가져오지 못했습니다. 기존 파일을 유지합니다.`); }
    let data: DartListResponse;
    try { data = JSON.parse(body) as DartListResponse; }
    catch { throw new Error('DART 응답 형식이 올바르지 않습니다. 기존 파일을 유지합니다.'); }
    if (data.status === '013' && page === 1) return [];
    if (data.status !== '000' || !Array.isArray(data.list)) throw new Error('DART 공시 목록 응답이 정상적이지 않습니다. 기존 파일을 유지합니다.');
    totalPages = Number(data.total_page) || 1;
    if (!Number.isInteger(totalPages) || totalPages < 1 || totalPages > 100) throw new Error('DART 조회 페이지 범위를 처리하지 못했습니다. --days 값을 줄여 다시 실행하세요.');
    filings.push(...data.list);
  }
  return filings;
}

export async function main(args = process.argv.slice(2)): Promise<void> {
  const options = parseDiscoveryArguments(args);
  if (options.help) {
    console.log('Usage: node scripts/sync-ipo-discovery.mjs [--days 1..90] [--limit 1..1000] [--write | --dry-run]\nDefault: 30 days, preview only. DART_API_KEY is required. --write atomically updates only src/data/customIpos.json; a repository commit and deployment are separate.');
    return;
  }
  const root = process.cwd();
  const source = loadDiscoverySource(root);
  const filings = await fetchDiscoveryFilings(process.env.DART_API_KEY || '', options.days);
  const result = mergeDartDiscoveries(source.combined, filings, options.limit);
  const changed = [...result.updatedIpos, ...result.newIpos];
  const custom = structuredClone(source.custom);
  for (const ipo of changed) {
    const index = custom.findIndex((item) => isSameIpoIdentity(item, ipo));
    if (index >= 0) custom[index] = ipo;
    else custom.push(ipo);
  }
  if (options.write && changed.length > 0) writeDiscoveredIpos(path.join(root, 'src', 'data', 'customIpos.json'), custom);
  console.log(JSON.stringify({ filingsCount: filings.length, newCount: result.newIpos.length, updatedCount: result.updatedIpos.length,
    totalCount: result.ipos.length, ignoredCount: result.ignoredCount,
    storageStatus: options.write ? (changed.length > 0 ? 'local-file-written' : 'unchanged') : 'preview-only', deploymentConfirmed: false,
    newIpos: result.newIpos.map(({ id, name, discovery }) => ({ id, name, discovery })),
  }, null, 2));
}

if (require.main === module) main().catch(() => {
  // Fetch errors can contain authenticated request URLs. Keep executable errors secret-free.
  console.error('신규 공시 수집에 실패했습니다. 환경변수·DART 응답·파일 권한을 확인하세요. 성공으로 처리하지 않았습니다.');
  process.exitCode = 1;
});
