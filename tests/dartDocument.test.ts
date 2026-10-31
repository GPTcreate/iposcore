import assert from 'node:assert/strict';
import test from 'node:test';
import * as zlib from 'node:zlib';
import { DART_DOCUMENT_API, DART_DOCUMENT_LIMITS, extractDartDocumentOffering, fetchDartDocumentOffering } from '../src/lib/dartDocument';

const receipt = '20261030000406';
const crc32 = (zlib as typeof zlib & { crc32: (data: Uint8Array) => number }).crc32;
type Entry = { name: string; data: string | Buffer; method?: number; flags?: number; size?: number; crc?: number };
/** Minimal fixtures include both ordinary headers and the data-descriptor form used by OpenDART. */
function zip(entries: Entry[]): Buffer {
  const files: Buffer[] = [], central: Buffer[] = []; let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name), data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data);
    const method = entry.method ?? 8, flags = entry.flags ?? 0;
    const encoded = method === 8 ? zlib.deflateRawSync(data) : data;
    const size = entry.size ?? data.length, crc = entry.crc ?? crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50); local.writeUInt16LE(20, 4); local.writeUInt16LE(flags, 6); local.writeUInt16LE(method, 8);
    if (!(flags & 8)) { local.writeUInt32LE(crc, 14); local.writeUInt32LE(encoded.length, 18); local.writeUInt32LE(size, 22); }
    local.writeUInt16LE(name.length, 26);
    const descriptor = flags & 8 ? Buffer.alloc(16) : Buffer.alloc(0);
    if (descriptor.length) { descriptor.writeUInt32LE(0x08074b50); descriptor.writeUInt32LE(crc, 4); descriptor.writeUInt32LE(encoded.length, 8); descriptor.writeUInt32LE(size, 12); }
    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(20, 6);
    header.writeUInt16LE(flags, 8); header.writeUInt16LE(method, 10); header.writeUInt32LE(crc, 16);
    header.writeUInt32LE(encoded.length, 20); header.writeUInt32LE(size, 24); header.writeUInt16LE(name.length, 28); header.writeUInt32LE(offset, 42);
    files.push(local, name, encoded, descriptor); central.push(header, name);
    offset += local.length + name.length + encoded.length + descriptor.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...files, directory, end]);
}
const offering = (body = '<P>current offering</P>') => `<PART><TITLE>제1부 모집 또는 매출에 관한 사항</TITLE>${body}</PART>`;
const document = (body = offering()) => `<?xml version="1.0" encoding="utf-8"?><DOCUMENT><DOCUMENT-NAME>투자설명서</DOCUMENT-NAME><COMPANY-NAME AREGCIK="01835829">Alpha</COMPANY-NAME><BODY><COVER><P>old cover figures</P></COVER><PART><TITLE>【 본 문 】</TITLE><LIBRARY>${body}</LIBRARY></PART></BODY></DOCUMENT>`;
const archive = (xml = document(), changes: Partial<Entry> = {}) => zip([{ name: `${receipt}.xml`, data: xml, ...changes }]);
const asResponse = (buffer: Buffer) => new Response(Uint8Array.from(buffer));

test('stored and deflated native exports select only the exact receipt and current offering, preserving cell spans', async () => {
  for (const method of [0, 8]) for (const flags of [0, 8]) {
    const expected = offering('<TABLE><TR><TD COLSPAN="2">price</TD><TD ROWSPAN="2">quantity</TD></TR></TABLE>');
    const xml = document(offering('<TABLE><TR><TE COLSPAN="2">price</TE><TU ROWSPAN="2">quantity</TU></TR></TABLE>')
      + '<PART><TITLE>제2부 발행인에 관한 사항</TITLE><P>issuer figures</P></PART>');
    assert.deepEqual(await extractDartDocumentOffering(archive(xml, { method, flags }), receipt), [expected]);
  }
});

test('a different receipt, attachment-only XML or case-variant filename cannot replace the requested filing', async () => {
  for (const name of ['20261028000157.xml', `${receipt}-attachment.xml`, `${receipt}.XML`, `attachments/${receipt}.xml`]) {
    assert.equal(await extractDartDocumentOffering(archive(document(), { name }), receipt), null);
  }
  const result = await extractDartDocumentOffering(zip([
    { name: '20261028000157.xml', data: document(offering('<P>older figures</P>')) },
    { name: `${receipt}.xml`, data: document() },
  ]), receipt);
  assert.deepEqual(result, [offering()]);
});

test('duplicate or missing current offering parts fail closed and covers or historical wrappers never supply a body', async () => {
  for (const body of ['', offering() + offering(), `<CORRECTION>${offering()}</CORRECTION>`,
    `<ATTACHMENT>${offering()}</ATTACHMENT>`, '<PART><TITLE>증권발행조건확정</TITLE><P>cover</P></PART>',
    '<PART><TITLE>제1부 모집 또는 매출에 관한 사항</TITLE><TITLE>other title</TITLE><P>x</P></PART>']) {
    assert.equal(await extractDartDocumentOffering(archive(document(body)), receipt), null);
  }
  assert.equal(await extractDartDocumentOffering(archive(`<DOCUMENT><BODY><COVER>${offering()}</COVER></BODY></DOCUMENT>`), receipt), null);
  assert.equal(await extractDartDocumentOffering(archive(document() + document()), receipt), null);
  assert.equal(await extractDartDocumentOffering(archive(document().replace('</LIBRARY>', '</LIBRARY><LIBRARY/>')), receipt), null);
  assert.equal(await extractDartDocumentOffering(archive(document().replace('</BODY>', '<PART><TITLE>【본문】</TITLE><LIBRARY/></PART></BODY>')), receipt), null);
});

test('an oversized offering uses only its unique direct general/risk sections while retaining the two-million-character bound', async () => {
  const general = '<SECTION-1><TITLE>I. 모집 또는 매출에 관한 일반사항</TITLE><P>pricing</P></SECTION-1>';
  const risk = '<SECTION-1><TITLE>III. 투자위험요소</TITLE><P>float</P></SECTION-1>';
  const padding = `<SECTION-1><TITLE>IV. 인수인의 의견</TITLE><P>${'x'.repeat(2_000_001)}</P></SECTION-1>`;
  assert.deepEqual(await extractDartDocumentOffering(archive(document(offering(general + risk + padding))), receipt), [general, risk]);
  for (const sections of [general + padding, general + general + risk + padding, `<WRAPPER>${general}</WRAPPER>${risk}${padding}`,
    general.replace('pricing', 'x'.repeat(2_000_001)) + risk]) {
    assert.equal(await extractDartDocumentOffering(archive(document(offering(sections))), receipt), null);
  }
});

test('every archive entry is checked for duplicate names, traversal, encryption and unsupported compression', async () => {
  for (const entry of [
    { name: `${receipt}.xml` }, { name: '../older.xml' }, { name: '/absolute.xml' }, { name: 'C:/absolute.xml' },
    { name: 'dir/../older.xml' }, { name: 'dir\\older.xml' }, { name: './older.xml' },
    { name: 'encrypted.xml', flags: 1 }, { name: 'strong-encrypted.xml', flags: 64 }, { name: 'unsupported.xml', method: 12 },
  ]) {
    assert.equal(await extractDartDocumentOffering(zip([
      { name: `${receipt}.xml`, data: document() }, { data: 'other', ...entry },
    ]), receipt), null);
  }
});

test('entry count, compressed bytes, total expanded bytes and per-entry expanded bytes are bounded before decompression', async () => {
  assert.equal(await extractDartDocumentOffering(Buffer.alloc(DART_DOCUMENT_LIMITS.compressedBytes + 1), receipt), null);
  const tooMany = Array.from({ length: 33 }, (_, index) => ({ name: `${index}.xml`, data: 'small' }));
  assert.equal(await extractDartDocumentOffering(zip(tooMany), receipt), null);
  assert.equal(await extractDartDocumentOffering(archive(document(), { size: DART_DOCUMENT_LIMITS.entryBytes + 1 }), receipt), null);
  assert.equal(await extractDartDocumentOffering(zip([
    { name: `${receipt}.xml`, data: document() }, ...Array.from({ length: 3 }, (_, index) => ({ name: `${index}.xml`, data: 'small', size: 8_000_000 })),
  ]), receipt), null);
});

test('CRC, actual decompressed length, deflate expansion and malformed archive headers are independently rejected', async () => {
  assert.equal(await extractDartDocumentOffering(archive(document(), { crc: 0 }), receipt), null);
  assert.equal(await extractDartDocumentOffering(archive(document(), { size: Buffer.byteLength(document()) + 1 }), receipt), null);
  assert.equal(await extractDartDocumentOffering(archive('x'.repeat(10_000_001), { size: 100 }), receipt), null);
  const brokenLocal = archive(); brokenLocal.writeUInt32LE(0, 0);
  for (const buffer of [brokenLocal, archive().subarray(0, -10), Buffer.from('<result><status>014</status></result>')]) {
    assert.equal(await extractDartDocumentOffering(buffer, receipt), null);
  }
});

test('non-UTF-8 payloads and invalid receipt numbers are rejected without guessing or making requests', async () => {
  const invalidUtf8 = Buffer.concat([Buffer.from('<DOCUMENT><BODY>'), Buffer.from([0xc3, 0x28]), Buffer.from('</BODY></DOCUMENT>')]);
  assert.equal(await extractDartDocumentOffering(zip([{ name: `${receipt}.xml`, data: invalidUtf8 }]), receipt), null);
  let requests = 0;
  for (const target of ['20260230000001', '20261030', '../20261030000406', '20261030000406?other']) {
    assert.equal(await fetchDartDocumentOffering(target, { apiKey: 'fixture-only', fetcher: async () => { requests++; return asResponse(archive()); } }), null);
  }
  assert.equal(await fetchDartDocumentOffering(receipt, { apiKey: ' ', fetcher: async () => { requests++; return asResponse(archive()); } }), null);
  assert.equal(requests, 0);
});

test('authenticated binary requests use the exact receipt endpoint, disallow redirects and return only selected HTML', async () => {
  const result = await fetchDartDocumentOffering(receipt, { apiKey: 'fixture-only', fetcher: async (input, init) => {
    const address = new URL(String(input));
    assert.equal(address.origin + address.pathname, DART_DOCUMENT_API);
    assert.equal(address.searchParams.get('rcept_no'), receipt);
    assert.equal(address.searchParams.get('crtfc_key'), 'fixture-only');
    assert.equal(init?.redirect, 'error'); assert.equal(init?.cache, 'no-store'); assert(init?.signal);
    return asResponse(archive());
  } });
  assert.deepEqual(result, [offering()]);
  assert(!JSON.stringify(result).includes('fixture-only'));
});

test('HTTP, redirect, size-header and authenticated transport failures return null without exposing error text', async () => {
  for (const response of [
    () => new Response('Unavailable', { status: 503 }),
    () => new Response('', { status: 302, headers: { location: 'https://example.invalid' } }),
    () => new Response('', { headers: { 'content-length': String(DART_DOCUMENT_LIMITS.compressedBytes + 1) } }),
    () => { throw new TypeError('https://opendart.fss.or.kr/api/document.xml?crtfc_key=fixture-only'); },
  ]) {
    let requests = 0;
    assert.equal(await fetchDartDocumentOffering(receipt, { apiKey: 'fixture-only', fetcher: async () => { requests++; return response(); } }), null);
    assert.equal(requests, 1);
  }
});

test('streaming downloads stop at the byte budget and discard interrupted or stalled bodies', async () => {
  let cancelled = false;
  const oversized = new Response(new ReadableStream<Uint8Array>({ start(controller) {
    controller.enqueue(new Uint8Array(DART_DOCUMENT_LIMITS.compressedBytes + 1));
  }, cancel() { cancelled = true; } }));
  assert.equal(await fetchDartDocumentOffering(receipt, { apiKey: 'fixture-only', fetcher: async () => oversized }), null);
  assert.equal(cancelled, true);
  const broken = new Response(new ReadableStream<Uint8Array>({ start(controller) {
    controller.enqueue(new Uint8Array([0x50, 0x4b])); controller.error(new DOMException('deadline', 'TimeoutError'));
  } }));
  assert.equal(await fetchDartDocumentOffering(receipt, { apiKey: 'fixture-only', fetcher: async () => broken }), null);
  const stalled = await fetchDartDocumentOffering(receipt, { apiKey: 'fixture-only', timeoutMs: 5, fetcher: async (_input, init) =>
    new Response(new ReadableStream<Uint8Array>({ start(controller) {
      const timer = setTimeout(() => controller.close(), 100);
      init!.signal!.addEventListener('abort', () => { clearTimeout(timer); controller.error(init!.signal!.reason); }, { once: true });
    } })) });
  assert.equal(stalled, null);
});
