import { CrawlChannel, CrawlJobLog } from '@/types/admin';

export const INITIAL_CHANNELS: CrawlChannel[] = [
  {
    id: 'ch-1',
    name: '공모주 수첩 TV',
    type: 'YOUTUBE',
    identifier: 'UC_sample_notebook_01',
    url: 'https://youtube.com/@ipo_notebook',
    isActive: true,
    reliabilityScore: 5,
    lastCrawledAt: '2026-10-06 08:30:12',
    collectedCount: 42
  },
  {
    id: 'ch-2',
    name: '소리주식Lab',
    type: 'YOUTUBE',
    identifier: 'UC_sample_sori_02',
    url: 'https://youtube.com/@sori_stock',
    isActive: true,
    reliabilityScore: 5,
    lastCrawledAt: '2026-10-06 08:30:15',
    collectedCount: 38
  },
  {
    id: 'ch-3',
    name: '스마트공모주',
    type: 'YOUTUBE',
    identifier: 'UC_sample_smart_03',
    url: 'https://youtube.com/@smart_ipo',
    isActive: true,
    reliabilityScore: 4,
    lastCrawledAt: '2026-10-05 19:12:00',
    collectedCount: 29
  },
  {
    id: 'ch-4',
    name: '재테크의 신 (네이버 블로그)',
    type: 'BLOG',
    identifier: 'blog.naver.com/god_of_finance',
    url: 'https://blog.naver.com/god_of_finance',
    isActive: true,
    reliabilityScore: 4,
    lastCrawledAt: '2026-10-06 07:45:20',
    collectedCount: 51
  },
  {
    id: 'ch-5',
    name: '초보투자자의 IPO노트 (티스토리)',
    type: 'BLOG',
    identifier: 'ipo-note.tistory.com',
    url: 'https://ipo-note.tistory.com',
    isActive: false, // 임시 비활성화 상태 예시
    reliabilityScore: 3,
    lastCrawledAt: '2026-10-01 14:20:00',
    collectedCount: 15
  }
];

export const INITIAL_LOGS: CrawlJobLog[] = [
  {
    id: 'log-1',
    targetStockName: '뉴로로보틱스',
    source: 'YouTube (3개 채널)',
    status: 'SUCCESS',
    collectedCount: 4,
    timestamp: '2026-10-06 08:30:15',
    message: '자막 추출 및 Gemini 2.5 감성 분석 완료 (긍정 85%, 점수 92점)'
  },
  {
    id: 'log-2',
    targetStockName: '데이터코어클라우드',
    source: 'Naver Blog API',
    status: 'SUCCESS',
    collectedCount: 8,
    timestamp: '2026-10-05 19:12:00',
    message: '블로그 리뷰 8건 요약 및 스코어 반영 완료 (점수 78점)'
  },
  {
    id: 'log-3',
    targetStockName: 'DART 전자공시 동기화',
    source: 'DART Open API',
    status: 'SUCCESS',
    collectedCount: 5,
    timestamp: '2026-10-05 09:00:00',
    message: '10월 2주차 신규 공모주 5건 증권신고서 스펙 파싱 완료'
  }
];
