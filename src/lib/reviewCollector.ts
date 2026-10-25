import { createHash } from 'node:crypto';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { load } from 'cheerio';
import defaultChannels from '../data/reviewChannels.json';
import type { ExpertReview, IpoItem } from '../types/ipo';
import type { ChannelCollectionResult, ReviewChannel, ReviewSnapshot } from '../types/reviews';

const MAX_BYTES = 1024 * 1024;
const MAX_CHANNELS = 12;
const MAX_ARTICLES_PER_RUN = 12;
const MAX_REVIEWS_PER_IPO = 12;
const DAY_MS = 86400000;
const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: false, processEntities: false });
type IpoIdentity = Pick<IpoItem, 'id' | 'name' | 'subscriptionStart'>;
type FeedIdentity = { platform: 'naver' | 'tistory'; blogId: string; host: string };
type FeedEntry = { title: string; url: string; publishedAt: string; author: string; description: string };
type FeedResult = { channel: ReviewChannel; identity?: FeedIdentity; entries: FeedEntry[]; count: number; error?: string };
type ArticleResult = { paragraphs: string[]; error?: string };

function publicationTimestamp(value: string): number {
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const rfc = value.match(/(?:^|,\s*)(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b/i);
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  if (iso || rfc) {
    const year = Number(iso ? iso[1] : rfc![3]);
    const month = iso ? Number(iso[2]) - 1 : months.indexOf(rfc![2].toLowerCase());
    const day = Number(iso ? iso[3] : rfc![1]);
    const calendar = new Date(Date.UTC(year, month, day));
    if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month || calendar.getUTCDate() !== day) return Number.NaN;
  } else return Number.NaN;
  return Date.parse(value);
}

function plainText(value: unknown): string {
  if (typeof value !== 'string') return '';
  const $ = load(value);
  $('script,style,noscript,iframe').remove();
  return $.root().text().replace(/\s+/g, ' ').trim();
}

function escapeRegex(text: string): string { return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function stockAliases(name: string): string[] {
  const clean = name.normalize('NFKC').replace(/주식회사|\(주\)|㈜/g, '').trim();
  const aliases = [clean, clean.replace(/기업인수목적/g, '스팩')];
  const numbered = clean.match(/^(.*?)기업인수목적(?:제)?(\d+)호$/);
  if (numbered) aliases.push(`${numbered[1]}${numbered[2]}호스팩`, `${numbered[1]}스팩${numbered[2]}호`);
  if (/^아이엠(?:기업인수목적(?:제)?1호|스팩(?:제)?1호|1호스팩)$/.test(clean)) {
    aliases.push('아이엠기업인수목적1호', '아이엠1호스팩', '아이엠스팩1호', '아이엠스팩');
  }
  return [...new Set(aliases.filter(Boolean))].sort((a, b) => b.length - a.length);
}

const descriptionSuffix = /^(?:청약|공모|상장|수요예측|투자|분석|ipo|기관|경쟁률|일정|증거금|환불|주관|예정|최종|결과|확약|유통|주식|배정|리뷰|공시)/i;

function nameBoundary(text: string, start: number, match: string, stockName: string): boolean {
  const before = text.slice(0, start);
  if (/[\p{L}\p{N}]$/u.test(before)) return false;
  const after = text.slice(start + match.length);
  // A shorthand issuer name cannot borrow another numbered SPAC's article.
  if (/스팩$/u.test(match.replace(/[\s\p{P}\p{S}]/gu, ''))) {
    const next = after.normalize('NFKC').replace(/^[\s\p{P}\p{S}]+/gu, '');
    const numbered = next.match(/^(?:제\s*)?(\d+)\s*호/);
    const expected = stockName.normalize('NFKC').match(/(\d+)\s*호/);
    if (numbered) return Boolean(expected && Number(numbered[1]) === Number(expected[1]));
    if (/^(?:제\s*)?\d/.test(next)) return false;
  }
  if (!after || /^[\s\p{P}\p{S}]/u.test(after)) return true;
  if (descriptionSuffix.test(after)) return true;
  const particle = after.match(/^(?:에서|으로|부터|까지|에게|은|는|이|가|을|를|과|와|의|에|도|만|로)(.*)$/u);
  return Boolean(particle && (!particle[1] || /^[\s\p{P}\p{S}]/u.test(particle[1]) || descriptionSuffix.test(particle[1])));
}

/** Return the actual source substring, so evidence never invents a matched name. */
export function aliasMatch(text: string, stockName: string): string | null {
  for (const alias of stockAliases(stockName)) {
    const flexibleAlias = Array.from(alias).map(escapeRegex).join('[\\s\\p{P}\\p{S}]*');
    for (const match of text.matchAll(new RegExp(flexibleAlias, 'giu'))) {
      if (nameBoundary(text, match.index!, match[0], stockName)) return match[0];
    }
  }
  return null;
}

function safeUrl(value: string): URL {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.port || url.username || url.password || url.hash) throw new Error('허용되지 않은 수집 URL입니다.');
  return url;
}

function feedIdentity(value: string): FeedIdentity {
  const url = safeUrl(value);
  if (url.search) throw new Error('RSS 주소에는 검색 매개변수를 사용할 수 없습니다.');
  const naver = url.pathname.match(/^\/([a-zA-Z0-9_-]{1,64})\.xml$/);
  if (url.hostname === 'rss.blog.naver.com' && naver) return { platform: 'naver', blogId: naver[1].toLowerCase(), host: url.hostname };
  const tistory = url.hostname.match(/^([a-z0-9][a-z0-9-]{0,62})\.tistory\.com$/);
  if (tistory && url.pathname === '/rss') return { platform: 'tistory', blogId: tistory[1], host: url.hostname };
  throw new Error('네이버 블로그 또는 티스토리의 개별 RSS 주소만 수집할 수 있습니다.');
}

function canonicalArticle(value: string, identity: FeedIdentity): string | null {
  try {
    const url = safeUrl(value);
    if (identity.platform === 'naver') {
      if (url.hostname !== 'blog.naver.com' && url.hostname !== 'm.blog.naver.com') return null;
      let blogId: string | undefined;
      let logNo: string | undefined;
      const direct = url.pathname.match(/^\/([a-zA-Z0-9_-]+)\/(\d{1,20})\/?$/);
      if (direct) [, blogId, logNo] = direct;
      else if (url.pathname === '/PostView.naver') {
        blogId = url.searchParams.get('blogId') || undefined;
        logNo = url.searchParams.get('logNo') || undefined;
      }
      if (blogId?.toLowerCase() !== identity.blogId || !logNo || !/^\d{1,20}$/.test(logNo)) return null;
      return `https://blog.naver.com/${identity.blogId}/${logNo}`;
    }
    if (url.hostname !== identity.host || !/^\/(?:\d{1,20}|entry\/[^/?#]+)\/?$/.test(url.pathname)) return null;
    return `https://${identity.host}${url.pathname.replace(/\/$/, '')}`;
  } catch { return null; }
}

/** Bounded streams and explicit redirect validation cover both feeds and posts. */
async function fetchText(
  initialUrl: string,
  fetcher: typeof fetch,
  timeoutMs: number,
  validate: (url: string) => boolean,
): Promise<string> {
  const controller = new AbortController();
  let rejectTimeout: (error: Error) => void = () => {};
  const timeout = new Promise<never>((_, reject) => { rejectTimeout = reject; });
  const timer = setTimeout(() => { controller.abort(); rejectTimeout(new Error('수집 요청 시간이 초과되었습니다.')); }, timeoutMs);
  try {
    let url = initialUrl;
    for (let redirects = 0; redirects <= 3; redirects++) {
      if (!validate(url)) throw new Error('수집 주소 또는 이동 주소가 허용 범위를 벗어났습니다.');
      const response = await Promise.race([fetcher(url, {
        redirect: 'manual', signal: controller.signal,
        headers: { 'User-Agent': 'IPOScore-ReviewCollector/1.0', Accept: 'application/rss+xml, application/xml, text/html;q=0.9' },
      }), timeout]);
      if (response.url && !validate(response.url)) throw new Error('응답 주소가 허용 범위를 벗어났습니다.');
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location || redirects === 3) throw new Error('RSS 또는 본문 이동 횟수를 초과했습니다.');
        url = new URL(location, url).href;
        continue;
      }
      if (!response.ok) throw new Error(`수집 서버 응답 HTTP ${response.status}`);
      const declaredSize = Number(response.headers.get('content-length'));
      if (Number.isFinite(declaredSize) && declaredSize > MAX_BYTES) throw new Error('수집 응답 크기 제한을 초과했습니다.');
      if (!response.body) throw new Error('수집 응답 본문이 없습니다.');
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await Promise.race([reader.read(), timeout]);
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BYTES) {
          void reader.cancel().catch(() => {});
          throw new Error('수집 응답 크기 제한을 초과했습니다.');
        }
        chunks.push(value);
      }
      const buffer = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
      return new TextDecoder().decode(buffer);
    }
    throw new Error('수집 이동에 실패했습니다.');
  } finally { clearTimeout(timer); controller.abort(); }
}

async function collectFeed(channel: ReviewChannel, fetcher: typeof fetch, timeoutMs: number): Promise<FeedResult> {
  try {
    const identity = feedIdentity(channel.feedUrl);
    const xml = await fetchText(channel.feedUrl, fetcher, timeoutMs, (url) => {
      try { const next = feedIdentity(url); return next.platform === identity.platform && next.blogId === identity.blogId && next.host === identity.host; } catch { return false; }
    });
    if (/<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true) throw new Error('유효한 RSS XML이 아닙니다.');
    const parsed = parser.parse(xml);
    const rss = parsed?.rss?.channel;
    if (!rss || typeof rss !== 'object') throw new Error('RSS 채널을 찾을 수 없습니다.');
    const items: Record<string, unknown>[] = (Array.isArray(rss.item) ? rss.item : rss.item ? [rss.item] : []).slice(0, 50);
    const feedAuthor = plainText(rss.title);
    const entries: FeedEntry[] = [];
    for (const item of items) {
      const title = plainText(item.title).slice(0, 240);
      const url = typeof item.link === 'string' ? canonicalArticle(plainText(item.link), identity) : null;
      const dateValue = typeof item.pubDate === 'string' ? item.pubDate : typeof item['dc:date'] === 'string' ? item['dc:date'] : '';
      const timestamp = publicationTimestamp(dateValue);
      if (!title || !url || !dateValue || !Number.isFinite(timestamp)) continue;
      const author = plainText(item['dc:creator']) || plainText(item.author) || feedAuthor;
      if (!author) continue;
      entries.push({ title, url, publishedAt: new Date(timestamp).toISOString(), author: author.slice(0, 100), description: plainText(item.description || item['content:encoded']).slice(0, 12000) });
    }
    return { channel, identity, entries, count: items.length };
  } catch (error) {
    return { channel, entries: [], count: 0, error: error instanceof Error ? error.message : 'RSS 수집 실패' };
  }
}

function sourceParagraphs(html: string): string[] {
  const $ = load(html);
  $('script,style,noscript,iframe,nav,footer,aside').remove();
  const container = $('.se-main-container,#postViewArea,.tt_article_useless_p_margin,.article-view,.entry-content,#article-view').first();
  if (!container.length) return [];
  const paragraphs = container.find('.se-text-paragraph,p').map((_, element) => $(element).text().replace(/\s+/g, ' ').trim()).get().filter(Boolean);
  return paragraphs.length ? [...new Set(paragraphs)].slice(0, 300) : [container.text().replace(/\s+/g, ' ').trim()].filter(Boolean);
}

function boundedExcerpt(paragraph: string, alias: string): string {
  const position = paragraph.indexOf(alias);
  const start = Math.max(0, position - 35);
  const shorten = (text: string) => text.split(/\s+/).slice(0, 18).join(' ').slice(0, 120).replace(/[\uD800-\uDBFF]$/, '').trim();
  let excerpt = shorten(paragraph.slice(start));
  if (!excerpt.includes(alias)) excerpt = shorten(paragraph.slice(Math.max(0, position)));
  return excerpt;
}

function classifyStance(excerpt: string, sourceParagraph: string, target: IpoIdentity, ipos: IpoIdentity[]): ExpertReview['sentiment'] {
  if (ipos.some((other) => other.id !== target.id && aliasMatch(sourceParagraph, other.name))) return 'UNCLASSIFIED';
  if (/[“”"'「」『』]|에 따르면|라고 (?:말|했|하)|유튜버|블로거|전문가|그는|그녀는/.test(sourceParagraph)) return 'UNCLASSIFIED';
  if (!aliasMatch(excerpt, target.name) || !/(?:저는|제가|나는|개인적으로|필자는|저희는)/.test(excerpt)) return 'UNCLASSIFIED';
  if (/(?:만약|라면|다면|경우|수도|않을까|할까|패스.{0,8}(?:하지|안|않)|불참.{0,8}(?:하지|안|않))/.test(excerpt)) return 'UNCLASSIFIED';
  if (/(?:계획|예정|생각|의사).{0,8}(?:없|아니|않)|하기로.{0,10}(?:아니|않)|(?:유보|보류|관망).{0,8}(?:하지|안|않)/.test(excerpt)) return 'UNCLASSIFIED';
  const alias = aliasMatch(excerpt, target.name)!;
  const aliasPosition = excerpt.indexOf(alias);
  // The stance must immediately concern this company, rather than a later name
  // in the paragraph. Unknown intervening words deliberately stay unclassified.
  const subject = excerpt.slice(0, aliasPosition);
  if (!/(?:저는|제가|나는|개인적으로|필자는|저희는)/.test(subject)) return 'UNCLASSIFIED';
  const tail = excerpt.slice(aliasPosition + alias.length).trim();
  const prefix = '^(?:은|는|을|를|에|의|도)?\\s*(?:(?:이번(?:에는)?|균등(?:으로|만)?|비례(?:로|만)?|청약(?:에|은|을|만)?|최소\\s*수량으로|만)\\s*)*';
  const neutral = new RegExp(prefix + '(?:(?:청약|참여)?\\s*(?:여부|결정)(?:는|은|을)?\\s*(?:아직\\s*)?(?:유보|보류|미정|결정하지 않|정하지 않)|(?:판단|결정)(?:을)?\\s*(?:유보|보류)|관망하겠습니다)').test(tail);
  const caution = new RegExp(prefix + '(?:(?:참여|청약)(?:을|에)?\\s*하지\\s*(?:않겠습니다|않기로|않을 예정|않습니다|않았)|(?:패스|불참)(?:하겠습니다|합니다|할 예정입니다|하기로 했습니다|했습니다))').test(tail);
  const positive = new RegExp(prefix + '(?:참여|청약)(?:하겠습니다|합니다|할 예정입니다|할 계획입니다|하기로 했습니다|했습니다)').test(tail);
  // An earlier clear stance must not survive a later correction or conflicting
  // decision in the same source paragraph, even beyond the short public excerpt.
  const anyPositive = /(?:참여|청약)(?:하겠습니다|합니다|할 예정입니다|할 계획입니다|하기로 했습니다|했습니다)/.test(sourceParagraph);
  const anyCaution = /(?:참여|청약)(?:을|에)?\s*(?:하지\s*않|안\s*하)|(?:패스|불참)(?:하겠습니다|합니다|할 예정|하기로|했습니다)/.test(sourceParagraph);
  const anyNeutral = /(?:판단|결정)(?:을)?\s*(?:보류|유보)|관망하겠습니다|청약\s*여부.{0,15}(?:미정|보류|유보)/.test(sourceParagraph);
  if ((positive && (anyCaution || anyNeutral)) || (caution && (anyPositive || anyNeutral)) || (neutral && (anyPositive || anyCaution))) return 'UNCLASSIFIED';
  const results: ExpertReview['sentiment'][] = [];
  if (neutral) results.push('NEUTRAL');
  if (caution) results.push('CAUTION');
  if (positive) results.push('POSITIVE');
  return results.length === 1 ? results[0] : 'UNCLASSIFIED';
}

function subscriptionWindow(ipo: IpoIdentity, now: Date): { earliest: number; latest: number } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ipo.subscriptionStart)) return null;
  const start = new Date(`${ipo.subscriptionStart}T00:00:00+09:00`);
  if (!Number.isFinite(start.getTime()) || new Date(start.getTime() + 9 * 3600000).toISOString().slice(0, 10) !== ipo.subscriptionStart) return null;
  return { earliest: start.getTime() - 30 * DAY_MS, latest: Math.min(now.getTime(), start.getTime() + DAY_MS - 1) };
}

export async function collectReviewsForIpos(
  ipos: IpoIdentity[],
  options?: { channels?: ReviewChannel[]; now?: Date; fetcher?: typeof fetch; timeoutMs?: number },
): Promise<ReviewSnapshot[]> {
  const suppliedNow = options?.now || new Date();
  if (!Number.isFinite(suppliedNow.getTime())) throw new Error('수집 기준일이 유효하지 않습니다.');
  const now = new Date(Math.min(suppliedNow.getTime(), Date.now()));
  const fetchedAt = now.toISOString();
  const fetcher = options?.fetcher || fetch;
  const timeoutMs = Math.max(10, Math.min(10000, options?.timeoutMs || 6000));
  const channels = (options?.channels || defaultChannels as ReviewChannel[]).filter((channel) => channel.isActive).slice(0, MAX_CHANNELS);
  const feedCache = new Map<string, Promise<FeedResult>>();
  const feeds = await Promise.all(channels.map(async (channel) => {
    let feed = feedCache.get(channel.feedUrl);
    if (!feed) { feed = collectFeed(channel, fetcher, timeoutMs); feedCache.set(channel.feedUrl, feed); }
    return { ...await feed, channel };
  }));
  const articleCache = new Map<string, Promise<ArticleResult>>();
  const snapshots: ReviewSnapshot[] = [];

  for (const ipo of ipos) {
    const reviews: ExpertReview[] = [];
    const seen = new Set<string>();
    const channelResults: ChannelCollectionResult[] = [];
    const window = subscriptionWindow(ipo, now);
    for (const feed of feeds) {
      const channelResult: ChannelCollectionResult = { channelId: feed.channel.id, feedUrl: feed.channel.feedUrl, status: feed.error ? 'failed' : feed.count ? 'success' : 'empty', fetchedCount: feed.count, matchedCount: 0, ...(feed.error ? { error: feed.error } : {}) };
      channelResults.push(channelResult);
      if (!window || !feed.identity || feed.error) continue;
      for (const entry of feed.entries) {
        if (reviews.length >= MAX_REVIEWS_PER_IPO || seen.has(entry.url)) continue;
        const publishedAt = Date.parse(entry.publishedAt);
        if (publishedAt < window.earliest || publishedAt > window.latest || !aliasMatch(`${entry.title} ${entry.description}`, ipo.name)) continue;
        seen.add(entry.url);
        channelResult.matchedCount++;
        let article = articleCache.get(entry.url);
        if (!article && articleCache.size < MAX_ARTICLES_PER_RUN) {
          const identity = feed.identity;
          const canonical = new URL(entry.url);
          const articleUrl = identity.platform === 'naver'
            ? `https://blog.naver.com/PostView.naver?blogId=${identity.blogId}&logNo=${canonical.pathname.split('/')[2]}`
            : entry.url;
          article = fetchText(articleUrl, fetcher, timeoutMs, (url) => canonicalArticle(url, identity) === entry.url)
            .then((html) => ({ paragraphs: sourceParagraphs(html) }))
            .catch((error) => ({ paragraphs: [], error: error instanceof Error ? error.message : '본문 확인 실패' }));
          articleCache.set(entry.url, article);
        }
        const body = article ? await article : { paragraphs: [] };
        if (body.error) channelResult.error = '일부 원문 본문을 가져오지 못해 RSS에 제공된 내용만 확인했습니다.';
        const matchedParagraphs = body.paragraphs.filter((paragraph) => aliasMatch(paragraph, ipo.name));
        const candidates = matchedParagraphs.length ? matchedParagraphs : [`${entry.title} ${entry.description}`];
        const evidenceCandidates = candidates.map((paragraph) => {
          const matchedAlias = aliasMatch(paragraph, ipo.name)!;
          const excerpt = boundedExcerpt(paragraph, matchedAlias);
          return { paragraph, matchedAlias, excerpt, sentiment: classifyStance(excerpt, paragraph, ipo, ipos) };
        });
        const classified = evidenceCandidates.filter((candidate) => candidate.sentiment !== 'UNCLASSIFIED');
        const conflicting = new Set(classified.map((candidate) => candidate.sentiment)).size > 1;
        const selected = classified[0] || evidenceCandidates[0];
        if (!selected.excerpt.includes(selected.matchedAlias)) continue;
        const sentiment = conflicting ? 'UNCLASSIFIED' : selected.sentiment;
        reviews.push({
          id: `rss-${createHash('sha256').update(`${ipo.id}\n${entry.url}`).digest('hex').slice(0, 20)}`,
          sourceType: 'BLOG', author: entry.author, title: entry.title, url: entry.url, publishedAt: entry.publishedAt,
          sentiment,
          summary: sentiment === 'UNCLASSIFIED'
            ? '해당 종목을 다룬 글입니다. 작성자의 청약 의사는 분류하지 않았습니다.'
            : sentiment === 'POSITIVE' ? '해당 종목에 대한 작성자의 청약 참여 의사를 확인한 글입니다.'
              : sentiment === 'CAUTION' ? '해당 종목에 대한 작성자의 청약 불참 의사를 확인한 글입니다.'
                : '해당 종목에 대한 작성자의 판단 유보 의사를 확인한 글입니다.',
          evidence: {
            feedUrl: feed.channel.feedUrl, fetchedAt,
            contentHash: createHash('sha256').update(`${entry.title}\n${entry.publishedAt}\n${selected.paragraph}`).digest('hex'),
            matchedAlias: selected.matchedAlias, excerpt: selected.excerpt,
            classification: sentiment === 'UNCLASSIFIED' ? 'unclassified' : 'explicit-stance-v1',
          },
        });
      }
    }
    const failed = channelResults.filter((result) => result.status === 'failed').length;
    const partial = channelResults.some((result) => Boolean(result.error));
    snapshots.push({
      ipoId: ipo.id, stockName: ipo.name, subscriptionStart: ipo.subscriptionStart, collectedAt: fetchedAt,
      status: !window ? 'failed' : failed > 0 && failed === channelResults.length ? 'failed' : partial ? 'partial' : reviews.length ? 'success' : 'empty',
      reviews: reviews.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)), channels: channelResults,
    });
  }
  return snapshots;
}
