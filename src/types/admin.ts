export interface CrawlChannel {
  id: string;
  name: string;
  type: 'YOUTUBE' | 'BLOG';
  identifier: string; // 유튜브 채널ID or 블로그 RSS/도메인
  url: string;
  isActive: boolean;
  reliabilityScore: number; // 신뢰도 가중치 (1~5)
  lastCrawledAt: string;
  collectedCount: number;
}

export interface CrawlJobLog {
  id: string;
  targetStockName: string;
  source: string;
  status: 'SUCCESS' | 'RUNNING' | 'FAILED';
  collectedCount: number;
  timestamp: string;
  message: string;
}
