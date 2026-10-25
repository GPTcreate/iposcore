import type { ExpertReview, IpoItem } from '../types/ipo';

const DAY_MS = 86_400_000;
const CLASSIFIED_SENTIMENTS = new Set(['POSITIVE', 'NEUTRAL', 'CAUTION']);

export interface ReviewSummary {
  /** Independent, explicitly classified blog/author samples used for consensus. */
  sampleSize: number;
  /** Every valid canonical article, including unclassified articles. */
  totalReviews: number;
  positiveCount: number;
  neutralCount: number;
  cautionCount: number;
  unclassifiedCount: number;
  positiveRatio: number | null;
  neutralRatio: number | null;
  cautionRatio: number | null;
  stale: boolean;
}

/** Date.parse alone accepts impossible calendar dates such as February 30. */
function validDate(value: unknown, timestampOnly = false): number | null {
  if (typeof value !== 'string') return null;
  const dayPattern = /^\d{4}-\d{2}-\d{2}$/;
  const timePattern = /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;
  if (!(timestampOnly ? timePattern.test(value) : dayPattern.test(value) || timePattern.test(value))) return null;
  const calendarDay = value.slice(0, 10);
  const calendar = new Date(`${calendarDay}T00:00:00Z`);
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) && Number.isFinite(calendar.getTime())
    && calendar.toISOString().slice(0, 10) === calendarDay ? parsed : null;
}

function safeUrl(value: unknown): URL | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port ? url : null;
  } catch {
    return null;
  }
}

/** Supported publisher article URLs only: no channel home, search or redirect URL. */
export function canonicalizeReviewUrl(value: string): string | null {
  const url = safeUrl(value);
  if (!url) return null;
  if (url.hostname === 'blog.naver.com' || url.hostname === 'm.blog.naver.com') {
    let blogId: string | null = null;
    let postId: string | null = null;
    const path = url.pathname.match(/^\/([a-zA-Z0-9_-]+)\/([1-9]\d*)\/?$/);
    if (path) [, blogId, postId] = path;
    else if (url.pathname === '/PostView.naver') {
      blogId = url.searchParams.get('blogId');
      postId = url.searchParams.get('logNo');
    }
    if (!blogId || !/^[a-zA-Z0-9_-]+$/.test(blogId) || !postId || !/^[1-9]\d*$/.test(postId)) return null;
    return `https://blog.naver.com/${blogId.toLowerCase()}/${postId}`;
  }
  if (/^[a-z0-9-]+\.tistory\.com$/.test(url.hostname)
    && (/^\/[1-9]\d*\/?$/.test(url.pathname) || /^\/entry\/[^/]+\/?$/.test(url.pathname))) {
    return `https://${url.hostname}${url.pathname.replace(/\/$/, '')}`;
  }
  return null;
}

function blogIdentity(articleUrl: string): string {
  const url = new URL(articleUrl);
  return url.hostname === 'blog.naver.com' ? `naver:${url.pathname.split('/')[1]}` : url.hostname;
}

/** Feed evidence must belong to the same blog as the original article. */
function matchingFeed(feedValue: unknown, articleUrl: string): boolean {
  const feed = safeUrl(feedValue);
  if (!feed || feed.search || feed.hash) return false;
  const article = new URL(articleUrl);
  if (article.hostname === 'blog.naver.com') {
    const blogId = article.pathname.split('/')[1];
    return feed.hostname === 'rss.blog.naver.com' && feed.pathname.toLowerCase() === `/${blogId}.xml`;
  }
  return feed.hostname === article.hostname && /^\/rss\/?$/.test(feed.pathname);
}

function normalizeName(value: string): string {
  return value.normalize('NFKC').toLowerCase().replace(/주식회사|\(주\)|㈜/g, '').replace(/[^\p{L}\p{N}]/gu, '');
}

function allowedAliases(name: string): Set<string> {
  const normalized = normalizeName(name);
  const aliases = new Set([normalized]);
  if (normalized.includes('기업인수목적')) {
    aliases.add(normalized.replace('기업인수목적', '스팩'));
    const prefix = normalized.split('기업인수목적')[0];
    const suffix = normalized.split('기업인수목적')[1];
    const numberedPrefix = prefix.match(/^(.*?)(?:제)?(\d+)호?$/);
    const numberedSuffix = suffix.match(/^(?:제)?(\d+)호?$/);
    if (numberedSuffix) {
      const issuer = prefix.replace(/제$/, '');
      aliases.add(`${issuer}${numberedSuffix[1]}호스팩`);
      aliases.add(`${issuer}스팩${numberedSuffix[1]}호`);
      aliases.add(`${issuer}스팩`);
    } else if (numberedPrefix) {
      aliases.add(`${numberedPrefix[1]}${numberedPrefix[2]}호스팩`);
      aliases.add(`${numberedPrefix[1]}스팩${numberedPrefix[2]}호`);
      aliases.add(`${numberedPrefix[1]}스팩`);
    } else if (prefix) aliases.add(`${prefix}스팩`);
  }
  return aliases;
}

/** A company-name prefix inside another company's name is not a stock match. */
function hasBoundedAlias(text: string, alias: string, stockName: string): boolean {
  const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = Array.from(alias).map(escape).join('[\\s\\p{P}\\p{S}]*');
  const candidates = new RegExp(pattern, 'giu');
  const descriptors = '(?:청약|공모주?|상장|수요예측|투자|분석|ipo|기관|경쟁률|일정|증거금|환불|주관|예정|최종|결과|확약|유통|주식|배정|리뷰|공시)';
  const descriptor = new RegExp('^' + descriptors, 'iu');
  const particle = new RegExp('^(?:에서|으로|부터|까지|에게|은|는|이|가|을|를|과|와|의|에|도|만|로)(?=$|[^\\p{L}\\p{N}]|' + descriptors + ')', 'iu');
  const expectedNumber = normalizeName(stockName).match(/(?:제)?(\d+)호/)?.[1];
  const genericSpac = alias.endsWith('스팩') && !/\d/.test(alias);
  for (const match of text.normalize('NFKC').matchAll(candidates)) {
    const source = text.normalize('NFKC');
    const index = match.index!;
    if (index > 0 && /[\p{L}\p{N}]/u.test(source[index - 1])) continue;
    let tail = source.slice(index + match[0].length);
    if (genericSpac) {
      const numbered = tail.match(/^[\s\p{P}\p{S}]*(?:제[\s\p{P}\p{S}]*)?(\d+)[\s\p{P}\p{S}]*호/u);
      if (numbered) {
        if (!expectedNumber || Number(numbered[1]) !== Number(expectedNumber)) continue;
        tail = tail.slice(numbered[0].length);
      } else if (/^[\s\p{P}\p{S}]*(?:제[\s\p{P}\p{S}]*)?\d/u.test(tail)) continue;
    }
    if (!tail || /^[^\p{L}\p{N}]/u.test(tail) || descriptor.test(tail) || particle.test(tail)) return true;
  }
  return false;
}

/**
 * A legacy expertReviews array is never evidence. Only the collector's snapshot
 * for this exact IPO and subscription schedule can supply attributable articles.
 * Hash validation checks the retained SHA-256 identifier, not remote authenticity.
 */
export function getCollectedReviews(ipo: Partial<IpoItem>, now = new Date()): ExpertReview[] {
  const snapshot = ipo.reviewCollection;
  const currentTime = now.getTime();
  if (!snapshot || !Number.isFinite(currentTime) || !ipo.id || !ipo.name || !ipo.subscriptionStart
    || snapshot.ipoId !== ipo.id || snapshot.stockName !== ipo.name
    || snapshot.subscriptionStart !== ipo.subscriptionStart || !Array.isArray(snapshot.reviews)
    || !['success', 'partial', 'failed'].includes(snapshot.status)) return [];
  const subscription = validDate(ipo.subscriptionStart);
  const collectedAt = validDate(snapshot.collectedAt, true);
  if (subscription === null || !/^\d{4}-\d{2}-\d{2}$/.test(ipo.subscriptionStart)
    || collectedAt === null || collectedAt > currentTime) return [];
  // IPO schedule dates are Korean calendar dates. UTC date slicing would move
  // either boundary by nine hours after an RSS timestamp is normalized to ISO.
  const subscriptionStartTime = new Date(`${ipo.subscriptionStart}T00:00:00+09:00`).getTime();
  const earliestPublication = subscriptionStartTime - 30 * DAY_MS;
  const latestPublication = subscriptionStartTime + DAY_MS - 1;

  const aliases = allowedAliases(ipo.name);
  const deduplicated = new Map<string, ExpertReview>();
  for (const review of snapshot.reviews) {
    if (!review || review.sourceType !== 'BLOG' || typeof review.author !== 'string' || !review.author.trim()
      || typeof review.title !== 'string' || !review.title.trim() || typeof review.url !== 'string') continue;
    const url = canonicalizeReviewUrl(review.url);
    const evidence = review.evidence;
    const publishedAt = validDate(review.publishedAt);
    const fetchedAt = validDate(evidence?.fetchedAt, true);
    if (!url || !evidence || !matchingFeed(evidence.feedUrl, url)
      || typeof evidence.contentHash !== 'string' || !/^[a-fA-F0-9]{64}$/.test(evidence.contentHash)
      || typeof evidence.matchedAlias !== 'string' || !evidence.matchedAlias.trim()
      || typeof evidence.excerpt !== 'string' || !evidence.excerpt.trim()
      || !['explicit-stance-v1', 'unclassified'].includes(evidence.classification)
      || publishedAt === null || fetchedAt === null || publishedAt > fetchedAt
      || fetchedAt > collectedAt || fetchedAt > currentTime) continue;
    // The date window is tied to this offering, not to the time a page is opened.
    if (publishedAt < earliestPublication || publishedAt > latestPublication) continue;
    const alias = normalizeName(evidence.matchedAlias);
    if (!aliases.has(alias) || alias.length < 2
      || !(hasBoundedAlias(review.title, alias, ipo.name) || hasBoundedAlias(evidence.excerpt, alias, ipo.name))) continue;
    const normalized: ExpertReview = {
      ...review,
      url,
      sentiment: evidence.classification === 'explicit-stance-v1' && CLASSIFIED_SENTIMENTS.has(review.sentiment)
        ? review.sentiment : 'UNCLASSIFIED',
    };
    const existing = deduplicated.get(url);
    if (!existing || validDate(existing.evidence!.fetchedAt, true)! < fetchedAt) deduplicated.set(url, normalized);
  }
  return [...deduplicated.values()].sort((a, b) => validDate(b.publishedAt)! - validDate(a.publishedAt)!
    || validDate(b.evidence!.fetchedAt, true)! - validDate(a.evidence!.fetchedAt, true)!
    || b.url.localeCompare(a.url));
}

/** Latest article per publisher/author; unclassified is not neutral. */
export function summarizeReviews(ipo: Partial<IpoItem>, now = new Date()): ReviewSummary {
  const reviews = getCollectedReviews(ipo, now);
  const snapshot = ipo.reviewCollection;
  const failedCollection = snapshot?.status === 'failed';
  const feedKey = (value: string) => {
    const url = safeUrl(value);
    return url ? `${url.origin}${url.pathname.toLowerCase().replace(/\/$/, '')}` : value;
  };
  const failedFeeds = new Set(snapshot?.status === 'partial' && Array.isArray(snapshot.channels)
    ? snapshot.channels.filter((channel) => channel.status === 'failed').map((channel) => feedKey(channel.feedUrl)) : []);
  const successfulFeeds = new Set(snapshot?.status === 'partial' && Array.isArray(snapshot.channels)
    ? snapshot.channels.filter((channel) => channel.status === 'success').map((channel) => feedKey(channel.feedUrl)) : []);
  const stale = failedCollection || failedFeeds.size > 0;
  const summary: ReviewSummary = {
    sampleSize: 0, totalReviews: reviews.length,
    positiveCount: 0, neutralCount: 0, cautionCount: 0,
    unclassifiedCount: reviews.filter((review) => review.sentiment === 'UNCLASSIFIED').length,
    positiveRatio: null, neutralRatio: null, cautionRatio: null, stale,
  };
  if (failedCollection) return summary;
  const seenBlogs = new Set<string>();
  const seenAuthors = new Set<string>();
  for (const review of reviews) {
    // A partial refresh may retain the failed channel's earlier articles for
    // display, but only channels collected successfully supply current stances.
    if (snapshot?.status === 'partial' && !successfulFeeds.has(feedKey(review.evidence!.feedUrl))) continue;
    const blog = blogIdentity(review.url);
    const author = normalizeName(review.author);
    if (seenBlogs.has(blog) || seenAuthors.has(author)) continue;
    // A newer unclassified article must not resurrect an author's older stance.
    seenBlogs.add(blog);
    seenAuthors.add(author);
    if (review.sentiment === 'UNCLASSIFIED') continue;
    summary.sampleSize += 1;
    if (review.sentiment === 'POSITIVE') summary.positiveCount += 1;
    else if (review.sentiment === 'NEUTRAL') summary.neutralCount += 1;
    else if (review.sentiment === 'CAUTION') summary.cautionCount += 1;
  }
  if (summary.sampleSize > 0) {
    summary.positiveRatio = summary.positiveCount / summary.sampleSize * 100;
    summary.neutralRatio = summary.neutralCount / summary.sampleSize * 100;
    summary.cautionRatio = summary.cautionCount / summary.sampleSize * 100;
  }
  return summary;
}
