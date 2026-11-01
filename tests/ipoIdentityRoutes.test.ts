import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function store() {
  const exports: Record<string, unknown> = {};
  const code = ts.transpileModule(fs.readFileSync('src/lib/ipoStore.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const seed = [{ id: 'elice-group', name: '엘리스', code: '0158S0' }, { id: 'ms-bio', name: '엠에스바이오', code: '0013Y0' }];
  vm.runInNewContext(code, { exports, module: { exports }, structuredClone, require: (name: string) => {
    if (name === '@/data/mockIpo') return { MOCK_IPOS: seed };
    if (name === '@/data/customIpos.json') return [];
    if (name === '@/data/reviewSnapshots.json') return {};
    if (name === './reviewArchive') return { normalizeReviewArchive: () => ({}), getReviewSnapshot: () => undefined };
    if (name === './ipoDiscovery') return { isSameIpoIdentity: (a: { id: string }, b: { id: string }) => a.id === b.id };
    throw new Error('Unexpected store dependency: ' + name);
  } });
  return exports as {
    getIpoByIdOrCode: (key: string) => { id: string } | undefined;
    setRuntimeCustomIpos: (records: unknown[]) => void;
  };
}

test('old mistaken bookmarks resolve while real issuer codes take precedence', () => {
  const data = store();
  assert.equal(data.getIpoByIdOrCode('459100')?.id, 'elice-group');
  assert.equal(data.getIpoByIdOrCode(encodeURIComponent('엘리스그룹'))?.id, 'elice-group');
  assert.equal(data.getIpoByIdOrCode('391020')?.id, 'ms-bio');
  data.setRuntimeCustomIpos([{ id: 'wits', name: '위츠', code: '459100' }]);
  assert.equal(data.getIpoByIdOrCode('459100')?.id, 'wits');
  assert.equal(data.getIpoByIdOrCode('0158S0')?.id, 'elice-group');
  assert.equal(data.getIpoByIdOrCode('elice-group')?.id, 'elice-group');
});
