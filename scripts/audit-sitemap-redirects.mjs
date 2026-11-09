#!/usr/bin/env node
// Read-only live check: sitemap entries must resolve directly (not through 3xx).
// Legacy stock-code URLs may still redirect for existing bookmarks, but must
// never be published as canonical sitemap locations.
const sitemapUrl = process.env.SITEMAP_URL || 'https://www.iposcore.kr/sitemap.xml';
const canonicalOrigin = 'https://www.iposcore.kr';
const timeoutMs = 20000;
const concurrency = 5;

async function request(url, method) {
  return fetch(url, {
    method,
    redirect: 'manual',
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'user-agent': 'IPOScore-Sitemap-Redirect-Audit/1.0' },
  });
}

function decodeXml(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

const response = await request(sitemapUrl, 'GET');
if (response.status !== 200) {
  throw new Error('Sitemap HTTP status ' + response.status + ' at ' + sitemapUrl);
}

const xml = await response.text();
if (!/<urlset\b/i.test(xml)) {
  throw new Error('Expected a sitemap <urlset>, not a redirect, error page, or sitemap index.');
}

const entries = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => decodeXml(m[1]));
if (entries.length === 0 || entries.length > 250) {
  throw new Error('Unexpected sitemap URL count: ' + entries.length);
}

const issues = [];
const unique = new Set(entries);
if (unique.size !== entries.length) {
  issues.push({ issue: 'duplicate-loc', count: entries.length - unique.size });
}

let cursor = 0;
let checked = 0;
await Promise.all(Array.from({ length: concurrency }, async () => {
  while (cursor < entries.length) {
    const url = entries[cursor++];
    try {
      const parsed = new URL(url);
      if (parsed.origin !== canonicalOrigin || parsed.search || parsed.hash) {
        issues.push({ url, issue: 'non-canonical-location' });
        continue;
      }

      let result = await request(url, 'HEAD');
      if ([405, 501].includes(result.status)) {
        result.body?.cancel().catch(() => {});
        result = await request(url, 'GET');
      }

      checked++;
      if (result.status !== 200) {
        issues.push({
          url,
          issue: result.status >= 300 && result.status < 400 ? 'redirect' : 'bad-status',
          status: result.status,
          location: result.headers.get('location'),
        });
      }
      result.body?.cancel().catch(() => {});
    } catch (error) {
      issues.push({ url, issue: 'request-failed', detail: String(error) });
    }
  }
}));

console.log('IPOScore public sitemap audit:', JSON.stringify({
  sitemapUrl,
  sitemapEntries: entries.length,
  checked,
  issues: issues.sort((a, b) => String(a.url).localeCompare(String(b.url))),
}, null, 2));

if (issues.length) process.exitCode = 1;
