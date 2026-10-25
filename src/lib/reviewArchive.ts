import type { ExpertReview, IpoItem } from '../types/ipo';
import type { ChannelCollectionResult, ReviewArchive, ReviewSnapshot } from '../types/reviews';

const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const timestamp = (value: unknown): value is string => text(value) && Number.isFinite(Date.parse(value));

export function isReviewDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

/** Include the schedule in the key so a postponed IPO cannot inherit the old run. */
export function reviewSnapshotKey(ipoId: string, subscriptionStart: string): string {
  return JSON.stringify([ipoId, subscriptionStart]);
}

function normalizedUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return undefined;
    url.hash = '';
    for (const key of Array.from(url.searchParams.keys())) {
      if (/^utm_/i.test(key) || ['fbclid', 'gclid'].includes(key)) url.searchParams.delete(key);
    }
    return url.toString();
  } catch { return undefined; }
}

function normalizeReview(value: unknown): ExpertReview | undefined {
  if (!object(value) || !text(value.id) || !text(value.author) || !text(value.title)
    || !['BLOG', 'YOUTUBE'].includes(String(value.sourceType))
    || !['POSITIVE', 'NEUTRAL', 'CAUTION', 'UNCLASSIFIED'].includes(String(value.sentiment))
    || !timestamp(value.publishedAt) || typeof value.summary !== 'string') return undefined;
  const url = normalizedUrl(value.url);
  if (!url) return undefined;
  const review: ExpertReview = {
    id: value.id, sourceType: value.sourceType as ExpertReview['sourceType'], author: value.author,
    title: value.title, url, publishedAt: value.publishedAt,
    sentiment: value.sentiment as ExpertReview['sentiment'], summary: value.summary,
  };
  const evidence = value.evidence;
  if (object(evidence) && normalizedUrl(evidence.feedUrl) && timestamp(evidence.fetchedAt)
    && text(evidence.contentHash) && text(evidence.matchedAlias) && typeof evidence.excerpt === 'string'
    && ['explicit-stance-v1', 'unclassified'].includes(String(evidence.classification))) {
    review.evidence = {
      feedUrl: normalizedUrl(evidence.feedUrl)!, fetchedAt: evidence.fetchedAt,
      contentHash: evidence.contentHash, matchedAlias: evidence.matchedAlias, excerpt: evidence.excerpt,
      classification: evidence.classification as NonNullable<ExpertReview['evidence']>['classification'],
    };
  }
  return review;
}

function normalizeChannel(value: unknown): ChannelCollectionResult | undefined {
  if (!object(value) || !text(value.channelId) || !normalizedUrl(value.feedUrl)
    || !['success', 'empty', 'failed'].includes(String(value.status))
    || !Number.isSafeInteger(value.fetchedCount) || Number(value.fetchedCount) < 0
    || !Number.isSafeInteger(value.matchedCount) || Number(value.matchedCount) < 0) return undefined;
  return {
    channelId: value.channelId, feedUrl: normalizedUrl(value.feedUrl)!,
    status: value.status as ChannelCollectionResult['status'],
    fetchedCount: Number(value.fetchedCount), matchedCount: Number(value.matchedCount),
    ...(text(value.error) ? { error: value.error.slice(0, 500) } : {}),
  };
}

function normalizeSnapshot(value: unknown): ReviewSnapshot | undefined {
  if (!object(value) || !text(value.ipoId) || !text(value.stockName) || !isReviewDate(value.subscriptionStart)
    || !timestamp(value.collectedAt) || !['success', 'empty', 'partial', 'failed'].includes(String(value.status))
    || !Array.isArray(value.reviews) || !Array.isArray(value.channels)) return undefined;
  const reviews = new Map<string, ExpertReview>();
  for (const raw of value.reviews) {
    const review = normalizeReview(raw);
    if (review) reviews.set(review.url, review);
  }
  return {
    ipoId: value.ipoId, stockName: value.stockName, subscriptionStart: value.subscriptionStart,
    collectedAt: value.collectedAt,
    ...(timestamp(value.lastSuccessfulAt) ? { lastSuccessfulAt: value.lastSuccessfulAt } : {}),
    status: value.status as ReviewSnapshot['status'],
    reviews: Array.from(reviews.values()).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.url.localeCompare(b.url)),
    channels: value.channels.map(normalizeChannel).filter((channel): channel is ChannelCollectionResult => !!channel)
      .sort((a, b) => a.channelId.localeCompare(b.channelId) || a.feedUrl.localeCompare(b.feedUrl)),
  };
}

/** Parse untrusted file contents without promoting records into verified financial data. */
export function normalizeReviewArchive(value: unknown): ReviewArchive {
  const snapshots: Record<string, ReviewSnapshot> = {};
  if (object(value) && value.version === 1 && object(value.snapshots)) {
    for (const raw of Object.values(value.snapshots)) {
      const snapshot = normalizeSnapshot(raw);
      if (!snapshot) continue;
      const key = reviewSnapshotKey(snapshot.ipoId, snapshot.subscriptionStart);
      if (!snapshots[key] || Date.parse(snapshot.collectedAt) >= Date.parse(snapshots[key].collectedAt)) snapshots[key] = snapshot;
    }
  }
  return {
    version: 1,
    updatedAt: object(value) && timestamp(value.updatedAt) ? value.updatedAt : null,
    snapshots: Object.fromEntries(Object.entries(snapshots).sort(([a], [b]) => a.localeCompare(b))),
  };
}

/** Fresh empty results clear prior content. Failures retain prior content as stale evidence. */
export function mergeReviewSnapshots(archive: ReviewArchive, incoming: ReviewSnapshot[]): ReviewArchive {
  const result = normalizeReviewArchive(archive);
  for (const raw of incoming) {
    const snapshot = normalizeSnapshot(raw);
    if (!snapshot) throw new Error('수집 결과의 종목·일정·시각 형식이 올바르지 않습니다.');
    const key = reviewSnapshotKey(snapshot.ipoId, snapshot.subscriptionStart);
    const previous = result.snapshots[key];
    if (previous && Date.parse(previous.collectedAt) > Date.parse(snapshot.collectedAt)) continue;
    if (snapshot.status === 'failed') {
      snapshot.reviews = previous?.reviews || [];
      const successfulAt = previous?.lastSuccessfulAt
        || (previous && previous.status !== 'failed' ? previous.collectedAt : undefined);
      if (successfulAt) snapshot.lastSuccessfulAt = successfulAt;
    } else if (snapshot.status === 'partial') {
      const failedFeeds = new Set(snapshot.channels.filter((channel) => channel.status === 'failed').map((channel) => channel.feedUrl));
      const retained = previous?.reviews.filter((review) => review.evidence && failedFeeds.has(review.evidence.feedUrl)) || [];
      // Retain only failed publishers' old evidence. New versions win URL duplicates.
      snapshot.reviews = [...retained, ...snapshot.reviews];
      snapshot.lastSuccessfulAt = snapshot.collectedAt;
    } else {
      snapshot.lastSuccessfulAt = snapshot.collectedAt;
      if (snapshot.status === 'empty') snapshot.reviews = [];
    }
    result.snapshots[key] = snapshot;
    if (!result.updatedAt || Date.parse(snapshot.collectedAt) > Date.parse(result.updatedAt)) result.updatedAt = snapshot.collectedAt;
  }
  return normalizeReviewArchive(result);
}

export function getReviewSnapshot(archive: ReviewArchive, ipo: Pick<IpoItem, 'id' | 'subscriptionStart'>): ReviewSnapshot | undefined {
  const snapshot = archive.snapshots[reviewSnapshotKey(ipo.id, ipo.subscriptionStart)];
  return snapshot ? structuredClone(snapshot) : undefined;
}
