import { load } from 'cheerio';
import type { EventEmitter } from 'node:events';
import type { Readable } from 'node:stream';
import * as zlib from 'node:zlib';
import { OFFICIAL_RESPONSE_TIMEOUT_MS } from './officialHttp';

export const DART_DOCUMENT_API = 'https://opendart.fss.or.kr/api/document.xml';
export const DART_DOCUMENT_LIMITS = { compressedBytes: 5_000_000, totalBytes: 20_000_000, entryBytes: 10_000_000, entries: 32 } as const;
const MAX_BODY_CHARACTERS = 2_000_000;
interface ZipEntry {
  fileName: string; generalPurposeBitFlag: number; compressionMethod: number;
  compressedSize: number; uncompressedSize: number; crc32: number;
}
interface ZipFile extends EventEmitter {
  entryCount: number; readEntry: () => void; close: () => void;
  openReadStream: (entry: ZipEntry, options: { decompress?: false }, callback: (error: Error | null, stream?: Readable) => void) => void;
}
interface ZipReader {
  fromBuffer: (buffer: Buffer, options: { lazyEntries: true; autoClose: false; validateEntrySizes: true; strictFileNames: true },
    callback: (error: Error | null, file?: ZipFile) => void) => void;
}
// The locked runtime dependency has no bundled TypeScript declarations.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const zipReader = require('yauzl') as ZipReader;
const crc32 = (zlib as typeof zlib & { crc32?: (data: Uint8Array) => number }).crc32;
const receiptIsValid = (receipt: string) => /^\d{14}$/.test(receipt) && (() => {
  const day = `${receipt.slice(0, 4)}-${receipt.slice(4, 6)}-${receipt.slice(6, 8)}`;
  return Number.isFinite(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day;
})();
function safeEntryName(name: string): boolean {
  const segments = name.replace(/\/$/, '').split('/');
  return !!name && !/[\\:\x00-\x1f\x7f]/.test(name) && !name.startsWith('/')
    && segments.every(segment => !!segment && segment !== '.' && segment !== '..');
}

/** Inspect all archive metadata before reading only the exact receipt's XML entry. No files are extracted. */
function readReceiptXml(buffer: Buffer, receipt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    zipReader.fromBuffer(buffer, { lazyEntries: true, autoClose: false, validateEntrySizes: true, strictFileNames: true }, (error, file) => {
      if (error || !file) { reject(new Error('DART_DOCUMENT_ZIP')); return; }
      let finished = false, selected: ZipEntry | undefined, total = 0, count = 0;
      const names = new Set<string>();
      const finish = (value?: Buffer) => {
        if (finished) return;
        finished = true;
        file.close();
        if (value) resolve(value); else reject(new Error('DART_DOCUMENT_ZIP'));
      };
      file.on('error', () => finish());
      if (!Number.isInteger(file.entryCount) || file.entryCount < 1 || file.entryCount > DART_DOCUMENT_LIMITS.entries) { finish(); return; }
      file.on('entry', (entry: ZipEntry) => {
        count++;
        total += entry.uncompressedSize;
        if (count > file.entryCount || !safeEntryName(entry.fileName) || names.has(entry.fileName)
          || (entry.generalPurposeBitFlag & (1 | 64)) !== 0 || ![0, 8].includes(entry.compressionMethod)
          || !Number.isSafeInteger(entry.uncompressedSize) || entry.uncompressedSize < 0 || entry.uncompressedSize > DART_DOCUMENT_LIMITS.entryBytes
          || !Number.isSafeInteger(entry.compressedSize) || entry.compressedSize < 0 || entry.compressedSize > DART_DOCUMENT_LIMITS.compressedBytes
          || total > DART_DOCUMENT_LIMITS.totalBytes) { finish(); return; }
        names.add(entry.fileName);
        if (entry.fileName === `${receipt}.xml`) selected = entry;
        file.readEntry();
      });
      file.on('end', () => {
        if (finished) return;
        if (count !== file.entryCount || !selected || !crc32) { finish(); return; }
        const entry = selected;
        try { file.openReadStream(entry, entry.compressionMethod === 8 ? { decompress: false } : {}, (streamError, stream) => {
          if (streamError || !stream) { finish(); return; }
          const chunks: Buffer[] = []; let bytes = 0;
          stream.on('error', () => finish());
          stream.on('data', (chunk: Buffer) => {
            bytes += chunk.length;
            if (bytes > entry.compressedSize || bytes > DART_DOCUMENT_LIMITS.compressedBytes) { stream.destroy(); finish(); return; }
            chunks.push(chunk);
          });
          stream.on('end', () => {
            if (finished) return;
            try {
              if (bytes !== entry.compressedSize) { finish(); return; }
              const compressed = Buffer.concat(chunks, bytes);
              const xml = entry.compressionMethod === 8
                ? zlib.inflateRawSync(compressed, { maxOutputLength: Math.min(entry.uncompressedSize + 1, DART_DOCUMENT_LIMITS.entryBytes) }) : compressed;
              if (xml.length !== entry.uncompressedSize || crc32(xml) !== entry.crc32) { finish(); return; }
              finish(xml);
            } catch { finish(); }
          });
        }); } catch { finish(); }
      });
      file.readEntry();
    });
  });
}

/** The export contains covers and issuer sections; only one explicitly titled current offering part is eligible. */
export async function extractDartDocumentOffering(buffer: Uint8Array, receipt: string): Promise<string[] | null> {
  if (!receiptIsValid(receipt) || !buffer.byteLength || buffer.byteLength > DART_DOCUMENT_LIMITS.compressedBytes) return null;
  try {
    const xml = new TextDecoder('utf-8', { fatal: true }).decode(await readReceiptXml(Buffer.from(buffer), receipt));
    const $ = load(xml, { xml: { xmlMode: true, decodeEntities: true, withStartIndices: true, withEndIndices: true } });
    const document = $.root().children('DOCUMENT');
    if ($.root().children().length !== 1 || document.length !== 1) return null;
    const body = document.children('BODY');
    if (body.length !== 1) return null;
    const mainBodies = body.children('PART').toArray().filter(part => {
      const titles = $(part).children('TITLE');
      return titles.length === 1 && /^(?:【본문】|본문)$/.test(titles.text().replace(/\s+/g, ''));
    });
    if (mainBodies.length > 1) return null;
    const libraries = $(mainBodies).children('LIBRARY');
    if (mainBodies.length && libraries.length !== 1) return null;
    // The DART editor puts current parts in the main body's LIBRARY. Covers/attachments/correction wrappers are ineligible.
    const currentParts = [...body.children('PART').toArray(), ...libraries.children('PART').toArray()];
    const parts = currentParts.filter(part => {
      const titles = $(part).children('TITLE');
      return titles.length === 1 && /^제1부모집또는매출에관한사항$/.test(titles.text().replace(/\s+/g, ''));
    });
    if (parts.length !== 1) return null;
    const part = parts[0];
    const slice = (node: typeof part) => typeof node.startIndex === 'number' && typeof node.endIndex === 'number' && node.endIndex >= node.startIndex
      ? xml.slice(node.startIndex, node.endIndex + 1) : null;
    const whole = slice(part);
    if (!whole) return null;
    let selected = [whole];
    if (whole.length > MAX_BODY_CHARACTERS) {
      const sections = $(part).children('SECTION-1').toArray();
      const matching = (title: RegExp) => sections.filter(section => {
        const titles = $(section).children('TITLE');
        return titles.length === 1 && title.test(titles.text().replace(/\s+/g, ''));
      });
      const general = matching(/^(?:I|Ⅰ)[.．]?모집또는매출에관한일반사항$/);
      const risk = matching(/^(?:III|Ⅲ)[.．]?투자위험요소$/);
      if (general.length !== 1 || risk.length !== 1) return null;
      const bodies = [slice(general[0]), slice(risk[0])];
      if (bodies.some(body => !body || body.length > MAX_BODY_CHARACTERS)) return null;
      selected = bodies as string[];
    }
    // Native DART editor cells TE/TU have the same row/column semantics as rendered TD cells.
    return selected.map(body => body.replace(/<(\/?)(TE|TU)(?=[\s>])/g, '<$1TD'));
  } catch { return null; }
}

/** Authentication stays in memory. Neither transport exceptions nor authenticated URLs escape this helper. */
export async function fetchDartDocumentOffering(receipt: string, options: {
  apiKey?: string; fetcher?: typeof fetch; timeoutMs?: number;
} = {}): Promise<string[] | null> {
  const key = (options.apiKey ?? process.env.DART_API_KEY)?.trim();
  if (!receiptIsValid(receipt) || !key) return null;
  try {
    const address = `${DART_DOCUMENT_API}?crtfc_key=${encodeURIComponent(key)}&rcept_no=${receipt}`;
    const response = await (options.fetcher || fetch)(address, { redirect: 'error', cache: 'no-store',
      signal: AbortSignal.timeout(options.timeoutMs ?? OFFICIAL_RESPONSE_TIMEOUT_MS), headers: { 'User-Agent': 'IPOScore/1.0' } });
    if (!response.ok || response.headers.get('location') || (response.url && response.url !== address)
      || Number(response.headers.get('content-length')) > DART_DOCUMENT_LIMITS.compressedBytes) { await response.body?.cancel(); return null; }
    const reader = response.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = []; let bytes = 0;
    try {
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        bytes += part.value.byteLength;
        if (bytes > DART_DOCUMENT_LIMITS.compressedBytes) { await reader.cancel(); return null; }
        chunks.push(part.value);
      }
    } catch { await reader.cancel().catch(() => {}); return null; }
    finally { reader.releaseLock(); }
    return extractDartDocumentOffering(Buffer.concat(chunks, bytes), receipt);
  } catch { return null; }
}
