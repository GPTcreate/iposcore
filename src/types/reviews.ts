import type { ExpertReview } from './ipo';

export interface ReviewChannel {
  id: string;
  name: string;
  type: 'BLOG';
  url: string;
  feedUrl: string;
  isActive: boolean;
}

export interface ChannelCollectionResult {
  channelId: string;
  feedUrl: string;
  status: 'success' | 'empty' | 'failed';
  fetchedCount: number;
  matchedCount: number;
  error?: string;
}

export interface ReviewSnapshot {
  ipoId: string;
  stockName: string;
  subscriptionStart: string;
  collectedAt: string;
  lastSuccessfulAt?: string;
  status: 'success' | 'empty' | 'partial' | 'failed';
  reviews: ExpertReview[];
  channels: ChannelCollectionResult[];
}

export interface ReviewArchive {
  version: 1;
  updatedAt: string | null;
  snapshots: Record<string, ReviewSnapshot>;
}
