import assert from 'node:assert/strict';
import test from 'node:test';
import type { IpoFieldEvidence, IpoItem } from '../src/types/ipo';
import { KRX_LISTING_VERSION, parseKrxCompanyList, syncKrxListingIdentities } from '../src/lib/krxListings';
import { KRX_COMPANY_LIST, normalizeListingCompany } from '../src/lib/officialSource';
import { getFieldEvidence, hasVerifiedField, isReviewedIpo, isSpecificOfficialSourceUrl } from '../src/lib/contentQuality';

const now = new Date('2026-10-30T01:00:00Z');
const headers = ['회사명', '시장구분', '종목코드', '상장일'];
type Company = { name: string; code: string; listingDate: string; market?: string };
const company = (changes: Partial<Company> = {}): Company => ({ name: 'Alpha', code: '123456', listingDate: '2026-10-30', market: '코스닥', ...changes });
const ipo = (changes: Partial<IpoItem> = {}): IpoItem => ({
  id: 'alpha', name: 'Alpha', code: '999999', market: 'KOSDAQ', status: 'WAITING_LISTING',
  subscriptionStart: '2026-10-20', subscriptionEnd: '2026-10-21', refundDate: '2026-10-23', listingDate: '2026-10-29',
  priceBandMin: 10000, priceBandMax: 12000, confirmedPrice: 12000, underwriters: [],
  institutionalCompetitionRate: 1000, lockupCommitmentRate: 10, circulatingSupplyRate: 20,
  totalOfferingAmount: 100, marketCapAtIpo: 1000, aiScore: 80, scoreGrade: 'A',
  aiSummary: { headline: 'Alpha 10월 29일 상장 예정', bulletPoints: ['상장 예정일 10월 29일', '기업 설명'], positivePoints: [], riskPoints: [] },
  sentimentConsensus: { positiveRatio: null, neutralRatio: null, cautionRatio: null }, expertReviews: [],
  dataQuality: { status: 'unverified' }, ...changes,
});

// The live export is EUC-KR. Numeric entities keep this mock response ASCII while exercising the same decoder and HTML parser.
const asciiHtml = (value: string) => Array.from(value, character => character.codePointAt(0)! > 127
  ? `&#${character.codePointAt(0)};` : character).join('');
function exportHtml(companies: Company[], columns = headers): string {
  return asciiHtml(`<table><tr>${columns.map(header => `<th>${header}</th>`).join('')}</tr>${companies.map(item => {
    const values: Record<string, string> = { 회사명: item.name, 시장구분: item.market || '코스닥', 종목코드: item.code, 상장일: item.listingDate };
    return `<tr>${columns.map(header => `<td>${values[header] || ''}</td>`).join('')}</tr>`;
  }).join('')}</table>`);
}
function responseFixture(companies: Company[]) {
  const calls: string[] = [];
  const writes: IpoItem[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    calls.push(String(input));
    assert.equal(String(input), KRX_COMPANY_LIST);
    assert.equal(init?.redirect, 'error');
    return new Response(exportHtml(companies));
  };
  return { calls, writes, options: { now, fetcher, save: (item: IpoItem) => writes.push(structuredClone(item)) } };
}

test('KRX export locates labelled columns, preserves alphanumeric codes and rejects invalid rows', () => {
  const rows = parseKrxCompanyList(exportHtml([
    company({ code: '0053F0' }), company({ name: 'Beta', code: '654321', market: '유가증권', listingDate: '2026-10-29' }),
    company({ name: 'Bad code', code: '12345' }), company({ name: 'Lowercase code', code: '0053f0' }),
    company({ name: 'Placeholder code', code: '000000' }), company({ name: 'Bad day', listingDate: '2026-02-30' }),
    company({ name: 'Unsupported market', market: '코넥스' }), company({ name: '' }),
  ], ['종목코드', '업종', '상장일', '회사명', '시장구분']));
  assert.deepEqual(rows, [
    { name: 'Alpha', code: '0053F0', listingDate: '2026-10-30', market: 'KOSDAQ', excerpt: 'Alpha | 코스닥 | 0053F0 | 상장일 2026-10-30' },
    { name: 'Beta', code: '654321', listingDate: '2026-10-29', market: 'KOSPI', excerpt: 'Beta | 유가증권 | 654321 | 상장일 2026-10-29' },
  ]);
  assert.throws(() => parseKrxCompanyList(exportHtml([company()], headers.filter(header => header !== '상장일'))));
  assert.throws(() => parseKrxCompanyList(exportHtml([])));
  assert.throws(() => parseKrxCompanyList('<html>Access denied</html>'));
});

test('corporate suffix and SPAC normalization remain exact about the company and SPAC number', () => {
  assert.equal(normalizeListingCompany('주식회사 Ａｌｐｈａ'), normalizeListingCompany('(주) Alpha'));
  assert.equal(normalizeListingCompany('㈜ Alpha'), normalizeListingCompany('ALPHA'));
  assert.equal(normalizeListingCompany('한화플러스제6호기업인수목적'), normalizeListingCompany('한화플러스제6호스팩'));
  assert.equal(normalizeListingCompany('한화플러스제6호 SPAC'), normalizeListingCompany('한화플러스제6호스팩'));
  assert.notEqual(normalizeListingCompany('한화플러스제6호스팩'), normalizeListingCompany('한화플러스제7호스팩'));
  assert.notEqual(normalizeListingCompany('Alpha'), normalizeListingCompany('Alpha Holdings'));
});

test('one exchange export corrects wrong registered codes using exact company identity and binds its rows', async () => {
  const items = [
    ipo({ id: 'creates', name: '크리에이츠', code: '462900', dataQuality: { status: 'reviewed', reviewedAt: '2026-10-20T01:00:00Z' } }),
    ipo({ id: 'tne-korea', name: '티앤이코리아', code: '382010' }),
    ipo({ id: 'hanwha-plus-spac6', name: '한화플러스제6호기업인수목적', code: '450043' }),
  ];
  const original = structuredClone(items);
  const fixture = responseFixture([
    company({ name: '크리에이츠', code: '439270' }), company({ name: '티앤이코리아', code: '0053F0', listingDate: '2026-10-29' }),
    company({ name: '한화플러스제6호스팩', code: '0127E0' }),
  ]);
  const result = await syncKrxListingIdentities(items, fixture.options);
  assert.equal(result.success, true);
  assert.equal(result.checkedCount, 3);
  assert.equal(result.updatedCount, 3);
  assert.equal(result.pendingCount, 0);
  assert.equal(result.requestCount, 1);
  assert.equal(fixture.calls.length, 1);
  assert.deepEqual(items, original);
  assert.deepEqual(fixture.writes.map(item => item.code), ['439270', '0053F0', '0127E0']);
  for (const item of fixture.writes) {
    for (const field of ['code', 'listingDate'] as const) {
      assert.equal(getFieldEvidence(item, field)?.sourceUrl, KRX_COMPANY_LIST);
      assert.equal(getFieldEvidence(item, field)?.value, item[field]);
      assert.equal(getFieldEvidence(item, field)?.parserVersion, KRX_LISTING_VERSION);
      assert.equal(hasVerifiedField(item, field), true);
    }
    assert.equal(item.institutionalCompetitionRate, 1000);
    assert.equal(item.openingPrice, undefined);
    assert.equal(item.closingPrice, undefined);
    assert.equal(isReviewedIpo(item), false);
  }
  assert.equal(fixture.writes[0].dataQuality?.status, 'unverified');
  assert.deepEqual(fixture.writes[0].aiSummary.bulletPoints, ['기업 설명']);

  // Successfully bound identities do not re-download the full export on the next run.
  const rerun = responseFixture([]);
  const repeated = await syncKrxListingIdentities(fixture.writes, rerun.options);
  assert.equal(repeated.checkedCount, 0);
  assert.equal(repeated.requestCount, 0);
  assert.equal(rerun.calls.length, 0);
  assert.equal(rerun.writes.length, 0);
});

test('exchange row evidence validates only its exact company, code and listing date, never financial metrics or a full review', async () => {
  const fixture = responseFixture([company()]);
  await syncKrxListingIdentities([ipo()], fixture.options);
  const item = fixture.writes[0];
  const evidence = item.fieldEvidence!.code!;
  assert.equal(isSpecificOfficialSourceUrl(KRX_COMPANY_LIST), false);
  assert.equal(isReviewedIpo({ ...item, dataQuality: { status: 'reviewed', reviewedAt: now.toISOString(),
    sources: [{ title: 'Listed companies', url: KRX_COMPANY_LIST }] } }), false);
  for (const field of ['confirmedPrice', 'institutionalCompetitionRate', 'lockupCommitmentRate', 'circulatingSupplyRate'] as const) {
    const incoming = { ...item, fieldEvidence: { ...item.fieldEvidence, [field]: { ...evidence, value: item[field] } } };
    assert.equal(getFieldEvidence(incoming, field), undefined);
    assert.equal(hasVerifiedField(incoming, field), false);
  }
  for (const field of ['code', 'listingDate'] as const) {
    const valid = item.fieldEvidence![field]!;
    const invalid: Partial<IpoFieldEvidence>[] = [
      { excerpt: valid.excerpt!.replace('Alpha', 'Alpha Holdings') },
      { excerpt: valid.excerpt!.replace('123456', '654321') },
      { excerpt: valid.excerpt!.replace('2026-10-30', '2026-10-29') },
      { parserVersion: 'old-parser' }, { sourceUrl: `${KRX_COMPANY_LIST}&extra=1` },
      { value: field === 'code' ? '654321' : '2026-10-29' },
    ];
    for (const changes of invalid) assert.equal(getFieldEvidence({ ...item,
      fieldEvidence: { ...item.fieldEvidence, [field]: { ...valid, ...changes } } }, field), undefined);
  }
});

test('prior exchange evidence is revalidated after unavailable schedules or listing conflicts and becomes usable again', async () => {
  const seed = responseFixture([company()]);
  await syncKrxListingIdentities([ipo()], seed.options);
  for (const status of ['unavailable', 'conflict'] as const) {
    const item: IpoItem = { ...structuredClone(seed.writes[0]), scheduleVerification: {
      status, checkedAt: now.toISOString(), conflicts: status === 'conflict' ? ['listingDate'] : [],
      coveredFields: ['listingDate'],
    } };
    const fixture = responseFixture([company()]);
    const result = await syncKrxListingIdentities([item], fixture.options);
    assert.equal(result.success, true);
    assert.equal(result.checkedCount, 1);
    assert.equal(result.requestCount, 1);
    assert.equal(fixture.calls.length, 1);
    assert.equal(fixture.writes.length, 1);
    const saved = fixture.writes[0];
    assert.equal(saved.scheduleVerification?.status, 'partial');
    assert.deepEqual(saved.scheduleVerification?.conflicts, []);
    assert.equal(getFieldEvidence(saved, 'code')?.value, '123456');
    assert.equal(getFieldEvidence(saved, 'listingDate')?.value, '2026-10-30');
    assert.equal(item.scheduleVerification?.status, status);

    const repeated = responseFixture([]);
    assert.equal((await syncKrxListingIdentities([saved], repeated.options)).checkedCount, 0);
    assert.equal(repeated.calls.length, 0);
  }
});

test('same-version evidence with a malformed source, row, check time or stale value cannot suppress exchange revalidation', async () => {
  const seed = responseFixture([company()]);
  await syncKrxListingIdentities([ipo()], seed.options);
  for (const changes of [
    { sourceUrl: 'https://example.invalid/listed-companies' },
    { excerpt: 'Other company | 코스닥 | 123456 | 상장일 2026-10-30' },
    { checkedAt: 'not-a-date' }, { value: '2026-10-29' }, { parserVersion: 'old-parser' },
  ]) {
    const item = structuredClone(seed.writes[0]);
    item.fieldEvidence!.listingDate = { ...item.fieldEvidence!.listingDate!, ...changes };
    assert.equal(getFieldEvidence(item, 'listingDate'), undefined);
    const fixture = responseFixture([company()]);
    const result = await syncKrxListingIdentities([item], fixture.options);
    assert.equal(result.checkedCount, 1);
    assert.equal(result.requestCount, 1);
    assert.equal(fixture.calls.length, 1);
    assert.equal(result.updatedCount, 1);
    assert.equal(getFieldEvidence(fixture.writes[0], 'listingDate')?.value, '2026-10-30');
  }
});

test('duplicate company, wrong known market, pre-subscription listing and code collisions cannot overwrite records', async () => {
  const cases: { rows: Company[]; other?: IpoItem }[] = [
    { rows: [company(), company({ name: '(주) Alpha', code: '654321' })] },
    { rows: [company({ market: '유가증권' })] },
    { rows: [company({ listingDate: '2026-10-21' })] },
    { rows: [company({ listingDate: '2026-10-20' })] },
    { rows: [company()], other: ipo({ id: 'other', name: 'Beta', code: '123456' }) },
  ];
  for (const scenario of cases) {
    const input = [ipo(), ...(scenario.other ? [scenario.other] : [])];
    const original = structuredClone(input);
    const fixture = responseFixture(scenario.rows);
    const result = await syncKrxListingIdentities(input, fixture.options);
    assert.equal(result.success, false);
    assert.equal(result.requestCount, 1);
    assert.equal(result.updatedCount, 0);
    assert.equal(result.errors.length, 1);
    assert.equal(fixture.writes.length, 0);
    assert.deepEqual(input, original);
  }
});

test('a future official listing remains a normal pending result without overwriting registered identity', async () => {
  const item = ipo(), original = structuredClone(item);
  const fixture = responseFixture([company({ listingDate: '2026-11-02' })]);
  const result = await syncKrxListingIdentities([item], fixture.options);
  assert.equal(result.success, true);
  assert.equal(result.checkedCount, 1);
  assert.equal(result.requestCount, 1);
  assert.equal(result.pendingCount, 1);
  assert.equal(result.updatedCount, 0);
  assert.deepEqual(result.errors, []);
  assert.equal(fixture.writes.length, 0);
  assert.deepEqual(item, original);
});

test('an exact exchange row recovers past-subscription discoveries with unknown market, code and listing day even with stale UPCOMING status', async () => {
  for (const status of ['WAITING_LISTING', 'UPCOMING'] as const) {
    const item = ipo({ id: 'sk-spac14', name: '에스케이증권제14호기업인수목적', market: 'UNCONFIRMED', code: '', listingDate: undefined,
      status, subscriptionStart: '2026-10-15', subscriptionEnd: '2026-10-16', refundDate: '', confirmedPrice: 2000 });
    const original = structuredClone(item);
    const fixture = responseFixture([company({ name: '에스케이증권제14호스팩', code: '0205H0', listingDate: '2026-10-27' })]);
    const result = await syncKrxListingIdentities([item], fixture.options);
    assert.equal(result.success, true);
    assert.equal(result.checkedCount, 1);
    assert.equal(result.updatedCount, 1);
    assert.equal(result.requestCount, 1);
    assert.equal(result.pendingCount, 0);
    const saved = fixture.writes[0];
    assert.equal(saved.market, 'KOSDAQ');
    assert.equal(saved.code, '0205H0');
    assert.equal(saved.listingDate, '2026-10-27');
    assert.equal(saved.confirmedPrice, 2000);
    assert.equal(saved.refundDate, '');
    assert.equal(getFieldEvidence(saved, 'code')?.value, '0205H0');
    assert.equal(getFieldEvidence(saved, 'listingDate')?.value, '2026-10-27');
    assert.equal(isReviewedIpo(saved), false);
    assert.deepEqual(item, original);
  }
});

test('a similarly named or different-number SPAC remains pending without fuzzy matching', async () => {
  const fixture = responseFixture([company({ name: 'Alpha Holdings' }),
    company({ name: '한화플러스제7호스팩', code: '0127E0' })]);
  const result = await syncKrxListingIdentities([ipo(), ipo({ id: 'spac', name: '한화플러스제6호기업인수목적' })], fixture.options);
  assert.equal(result.success, true);
  assert.equal(result.pendingCount, 2);
  assert.equal(result.updatedCount, 0);
  assert.equal(fixture.writes.length, 0);
});

test('finalized and cancelled records trigger no request or new evidence requirement', async () => {
  const input = [ipo({ status: 'LISTED', openingPrice: 15000, closingPrice: 16000 }), ipo({ id: 'cancelled', isCancelled: true }),
    ipo({ id: 'future', status: 'UPCOMING', subscriptionEnd: '2026-11-03', listingDate: '2026-11-10' })];
  const original = structuredClone(input);
  const fixture = responseFixture([]);
  const result = await syncKrxListingIdentities(input, fixture.options);
  assert.equal(result.success, true);
  assert.equal(result.checkedCount, 0);
  assert.equal(result.requestCount, 0);
  assert.equal(fixture.calls.length, 0);
  assert.equal(fixture.writes.length, 0);
  assert.deepEqual(input, original);
});

test('an export needed by another record still leaves finalized first-day values and identity untouched', async () => {
  const finalized = ipo({ openingPrice: 15000, closingPrice: 16000, openingReturnRate: 25, closingReturnRate: 33.3 });
  const beta = ipo({ id: 'beta', name: 'Beta', code: '888888' });
  const fixture = responseFixture([company(), company({ name: 'Beta', code: '654321' })]);
  const original = structuredClone(finalized);
  const result = await syncKrxListingIdentities([finalized, beta], fixture.options);
  assert.equal(result.checkedCount, 1);
  assert.equal(result.updatedCount, 1);
  assert.deepEqual(fixture.writes.map(item => item.id), ['beta']);
  assert.deepEqual(finalized, original);
});

test('more than twelve pending names cannot starve a later match in the same one-request full export', async () => {
  const pending = Array.from({ length: 13 }, (_, index) => ipo({ id: `pending-${index}`, name: `Unknown ${index}`, code: `8${String(index).padStart(5, '0')}` }));
  const fixture = responseFixture([company()]);
  const result = await syncKrxListingIdentities([...pending, ipo()], fixture.options);
  assert.equal(result.checkedCount, 14);
  assert.equal(result.requestCount, 1);
  assert.equal(fixture.calls.length, 1);
  assert.equal(result.pendingCount, 13);
  assert.equal(result.updatedCount, 1);
  assert.deepEqual(fixture.writes.map(item => item.id), ['alpha']);
});

test('exchange listing facts clear only the listing-date conflict and preserve unrelated evidence and conflicts', async () => {
  const source = { sourceTitle: 'DART metric', sourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261020000001', checkedAt: now.toISOString(), value: 1000 };
  const item = ipo({ fieldEvidence: { institutionalCompetitionRate: source },
    scheduleVerification: { status: 'conflict', checkedAt: now.toISOString(), conflicts: ['listingDate', 'refundDate'],
      pendingFields: ['listingDate'], coveredFields: ['subscriptionStart', 'subscriptionEnd'] } });
  const fixture = responseFixture([company()]);
  await syncKrxListingIdentities([item], fixture.options);
  const saved = fixture.writes[0];
  assert.deepEqual(saved.scheduleVerification?.conflicts, ['refundDate']);
  assert.equal(saved.scheduleVerification?.pendingFields, undefined);
  assert.equal(saved.scheduleVerification?.status, 'conflict');
  assert(saved.scheduleVerification?.coveredFields.includes('listingDate'));
  assert.deepEqual(saved.fieldEvidence?.institutionalCompetitionRate, source);
  assert.equal(getFieldEvidence(saved, 'listingDate')?.value, '2026-10-30');
});

test('transport, malformed export and save failures retain the original registered identity', async () => {
  for (const failure of ['transport', 'parse', 'save']) {
    const item = ipo(), original = structuredClone(item);
    let saves = 0;
    const result = await syncKrxListingIdentities([item], { now,
      fetcher: async () => failure === 'transport' ? new Response('Unavailable', { status: 503 })
        : new Response(failure === 'parse' ? '<html>Access denied</html>' : exportHtml([company()])),
      save: () => { saves++; throw new Error('Write failed'); } });
    assert.equal(result.success, false);
    assert.equal(result.requestCount, 1);
    assert.equal(result.updatedCount, 0);
    assert.equal(result.errors.length, 1);
    assert.equal(saves, failure === 'save' ? 1 : 0);
    assert.deepEqual(item, original);
  }
});
