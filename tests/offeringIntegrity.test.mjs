import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const audit = path.resolve('scripts/audit-content-integrity.mjs');
function inspect(changes) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'iposcore-offering-integrity-'));
  const data = path.join(root, 'src', 'data');
  fs.mkdirSync(data, { recursive: true });
  const item = { id: 'offering', name: '공시 기업', confirmedPrice: 8000, offeringShareCount: 5000000,
    totalOfferingAmount: 400, listedShareCount: 45845239, marketCapAtIpo: 3667.61912, aiSummary: { bulletPoints: [] }, ...changes };
  fs.writeFileSync(path.join(data, 'customIpos.json'), JSON.stringify([item]));
  fs.writeFileSync(path.join(data, 'mockIpo.ts'), 'export const MOCK_IPOS: IpoItem[] = [];');
  return spawnSync(process.execPath, [audit], { cwd: root, encoding: 'utf8' });
}
test('the build audit rejects a forecast amount left behind by a final price correction', () => {
  assert.equal(inspect({}).status, 0);
  const result = inspect({ totalOfferingAmount: 650 });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /totalOfferingAmount/);
});
test('the build audit rejects valuation-share totals and stale field citations', () => {
  assert.equal(inspect({ marketCapAtIpo: 5950 }).status, 1);
  assert.equal(inspect({ listedShareCount: 46271412 }).status, 1);
  assert.equal(inspect({ fieldEvidence: { businessDescription: { value: 'old profile' } }, businessDescription: 'current profile' }).status, 1);
});

test('the build audit rejects stale listing identity, candle dates and return denominators', () => {
  const listing = { code: '0013Y0', listingDate: '2026-10-22', openingPrice: 16000,
    closingPrice: 12000, openingReturnRate: 100, closingReturnRate: 50,
    listingPriceEvidence: { code: '0013Y0', tradeDate: '2026-10-22', source: 'fchart_origin' } };
  assert.equal(inspect(listing).status, 0);
  assert.equal(inspect({ ...listing, code: '391020' }).status, 1);
  assert.equal(inspect({ ...listing, listingDate: '2026-10-10' }).status, 1);
  assert.equal(inspect({ ...listing, closingReturnRate: 60 }).status, 1);
  assert.equal(inspect({ fieldEvidence: { code: { value: '391020' } }, code: '0013Y0' }).status, 1);
});
